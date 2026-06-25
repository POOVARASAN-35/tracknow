const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');
const { invalidateReport } = require('../services/redisService');

/**
 * @desc    Get all drivers with profiles
 * @route   GET /api/drivers
 * @access  Private (Admin/Superadmin)
 */
const getDrivers = async (req, res, next) => {
  try {
    const drivers = await Driver.find()
      .populate('user', 'name email role suspended')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: drivers.length, data: drivers });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get driver by user ID (profile details)
 * @route   GET /api/drivers/profile
 * @access  Private (Driver)
 */
const getDriverProfile = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ user: req.user.id }).populate('user', 'name email role profileImage phone');
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver profile not found' });
    }

    const vehicle = await Vehicle.findOne({ assignedDriver: req.user.id });

    res.status(200).json({
      success: true,
      data: {
        ...driver.toObject(),
        vehicle: vehicle ? {
          vehicleNumber: vehicle.vehicleNumber,
          model: vehicle.model,
          type: vehicle.type,
          status: vehicle.status
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add driver profile
 * @route   POST /api/drivers
 * @access  Private (Admin/Superadmin)
 */
const addDriver = async (req, res, next) => {
  const { name, email, password, licenseNumber } = req.body;

  try {
    if (!name || !email || !password || !licenseNumber) {
      return res.status(400).json({ success: false, message: 'Please provide all details' });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const licenseExists = await Driver.findOne({ licenseNumber });
    if (licenseExists) {
      return res.status(400).json({ success: false, message: 'License number already registered' });
    }

    // Create User entry
    const user = await User.create({
      name,
      email,
      password,
      role: 'driver'
    });

    // Create Driver profile
    const driver = await Driver.create({
      user: user._id,
      licenseNumber,
      status: 'offline'
    });

    await invalidateReport('dashboard_metrics');

    const newDriver = await Driver.findById(driver._id).populate('user', 'name email role');

    res.status(201).json({
      success: true,
      data: newDriver
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Edit driver profile
 * @route   PUT /api/drivers/:id
 * @access  Private (Admin/Superadmin)
 */
const editDriver = async (req, res, next) => {
  const { name, email, licenseNumber, status, rating, performanceScore } = req.body;

  try {
    let driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    // Update User parameters
    const userUpdate = {};
    if (name) userUpdate.name = name;
    if (email) userUpdate.email = email;

    if (Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(driver.user, userUpdate);
    }

    // Update Driver parameters
    if (licenseNumber) driver.licenseNumber = licenseNumber;
    if (status) driver.status = status;
    if (rating !== undefined) driver.rating = rating;
    if (performanceScore !== undefined) driver.performanceScore = performanceScore;

    await driver.save();
    await invalidateReport('dashboard_metrics');

    const updatedDriver = await Driver.findById(req.params.id).populate('user', 'name email role');

    res.status(200).json({ success: true, data: updatedDriver });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload Driver document (License, ID, etc.)
 * @route   POST /api/drivers/:id/documents
 * @access  Private (Admin/Superadmin/Driver)
 */
const uploadDriverDocuments = async (req, res, next) => {
  const { docName, docUrl } = req.body;

  try {
    if (!docName || !docUrl) {
      return res.status(400).json({ success: false, message: 'Document name and URL required' });
    }

    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    // Authorization verification
    if (req.user.role === 'driver' && driver.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    let finalUrl = docUrl;
    if (docUrl.startsWith('data:')) {
      try {
        let mimeType = 'application/pdf';
        let base64Data = docUrl;

        const parts = docUrl.split(';base64,');
        if (parts.length === 2) {
          mimeType = parts[0].split(':')[1];
          base64Data = parts[1];
        }

        const extension = mimeType.split('/')[1] || 'pdf';
        const filename = `doc-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}.${extension}`;
        
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const filepath = path.join(uploadsDir, filename);
        fs.writeFileSync(filepath, Buffer.from(base64Data, 'base64'));

        finalUrl = `/uploads/${filename}`;
      } catch (err) {
        console.error('File saving failed, keeping raw URL:', err.message);
      }
    }

    driver.documents.push({
      name: docName,
      url: finalUrl,
      uploadedAt: new Date()
    });

    await driver.save();

    res.status(200).json({ success: true, documents: driver.documents });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete driver profile
 * @route   DELETE /api/drivers/:id
 * @access  Private (Admin/Superadmin)
 */
const deleteDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    // Unassign vehicles mapping
    await Vehicle.updateMany({ assignedDriver: driver.user }, { assignedDriver: null });

    // Remove User & Driver records
    await User.findByIdAndDelete(driver.user);
    await Driver.findByIdAndDelete(req.params.id);

    await invalidateReport('dashboard_metrics');

    res.status(200).json({ success: true, message: 'Driver deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update driver profile (self)
 * @route   PUT /api/drivers/profile
 * @access  Private (Driver)
 */
const updateDriverProfile = async (req, res, next) => {
  const { name, email, status, password, profileImage, phone } = req.body;

  try {
    const driver = await Driver.findOne({ user: req.user.id });
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver profile not found' });
    }

    // Update User parameters
    const userUpdate = {};
    if (name) userUpdate.name = name;
    if (email) userUpdate.email = email;
    if (phone !== undefined) userUpdate.phone = phone;
    if (profileImage !== undefined) userUpdate.profileImage = profileImage;

    if (password) {
      const userObj = await User.findById(req.user.id);
      if (userObj) {
        userObj.password = password;
        await userObj.save();
      }
    }
    
    if (Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(req.user.id, userUpdate);
    }

    // Update Driver parameters
    if (status) {
      if (!['available', 'busy', 'offline'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }
      driver.status = status;
    }

    await driver.save();
    await invalidateReport('dashboard_metrics');

    // Notify admins of status change
    try {
      const socketModule = require('../config/socket');
      socketModule.broadcastToRole('admin', 'driver_status_change', {
        driverId: req.user.id,
        status: driver.status
      });
    } catch (sErr) {
      console.warn('Socket status broadcast failed:', sErr.message);
    }

    const updatedDriver = await Driver.findOne({ user: req.user.id }).populate('user', 'name email role profileImage phone');
    const vehicle = await Vehicle.findOne({ assignedDriver: req.user.id });

    res.status(200).json({
      success: true,
      data: {
        ...updatedDriver.toObject(),
        vehicle: vehicle ? {
          vehicleNumber: vehicle.vehicleNumber,
          model: vehicle.model,
          type: vehicle.type,
          status: vehicle.status
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload document (self)
 * @route   POST /api/drivers/profile/documents
 * @access  Private (Driver)
 */
const uploadDriverSelfDocuments = async (req, res, next) => {
  const { docName, docUrl } = req.body;

  try {
    if (!docName || !docUrl) {
      return res.status(400).json({ success: false, message: 'Document name and URL required' });
    }

    const driver = await Driver.findOne({ user: req.user.id });
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    let finalUrl = docUrl;
    if (docUrl.startsWith('data:')) {
      try {
        let mimeType = 'application/pdf';
        let base64Data = docUrl;

        const parts = docUrl.split(';base64,');
        if (parts.length === 2) {
          mimeType = parts[0].split(':')[1];
          base64Data = parts[1];
        }

        const extension = mimeType.split('/')[1] || 'pdf';
        const filename = `doc-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}.${extension}`;
        
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const filepath = path.join(uploadsDir, filename);
        fs.writeFileSync(filepath, Buffer.from(base64Data, 'base64'));

        finalUrl = `/uploads/${filename}`;
      } catch (err) {
        console.error('File saving failed, keeping raw URL:', err.message);
      }
    }

    driver.documents.push({
      name: docName,
      url: finalUrl,
      uploadedAt: new Date()
    });

    await driver.save();

    res.status(200).json({ success: true, documents: driver.documents });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDrivers,
  getDriverProfile,
  addDriver,
  editDriver,
  uploadDriverDocuments,
  deleteDriver,
  updateDriverProfile,
  uploadDriverSelfDocuments
};
