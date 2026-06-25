const Delivery = require('../models/Delivery');
const Driver = require('../models/Driver');
const { getDriverLocation } = require('../services/redisService');

/**
 * @desc    Public search and track delivery order
 * @route   GET /api/customer/track/:trackingId
 * @access  Public
 */
const trackDelivery = async (req, res, next) => {
  const { trackingId } = req.params;

  try {
    const delivery = await Delivery.findOne({ trackingId })
      .populate('assignedDriver', 'name');

    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Invalid tracking ID. Please verify and try again.' });
    }

    let liveLocation = null;

    if (delivery.assignedDriver) {
      const driverId = delivery.assignedDriver._id.toString();
      
      // Try to read driver's coordinates from Redis cache
      const cachedLoc = await getDriverLocation(driverId);
      if (cachedLoc) {
        liveLocation = {
          latitude: cachedLoc.latitude,
          longitude: cachedLoc.longitude,
          speed: cachedLoc.speed,
          timestamp: cachedLoc.timestamp
        };
      } else {
        // Fallback: Read last known position from DB Driver record
        const driverProfile = await Driver.findOne({ user: driverId });
        if (driverProfile && driverProfile.currentLocation?.coordinates) {
          const [lng, lat] = driverProfile.currentLocation.coordinates;
          liveLocation = {
            latitude: lat,
            longitude: lng,
            speed: 0,
            timestamp: driverProfile.updatedAt
          };
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        id: delivery._id,
        trackingId: delivery.trackingId,
        customer: {
          name: delivery.customer.name
        },
        pickupAddress: delivery.pickupAddress,
        deliveryAddress: delivery.deliveryAddress,
        status: delivery.status,
        assignedDriver: delivery.assignedDriver ? { name: delivery.assignedDriver.name } : null,
        route: delivery.route,
        timeline: delivery.timeline,
        eta: delivery.eta,
        liveLocation
      }
    });
  } catch (error) {
    next(error);
  }
};

const User = require('../models/User');

/**
 * @desc    Get customer profile preferences
 * @route   GET /api/customer/profile
 * @access  Private
 */
const getCustomerProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '+91 98765 43210',
        dob: user.dob || '1995-08-12',
        gender: user.gender || 'Female',
        nationality: user.nationality || 'Indian',
        language: user.language || 'English',
        deliveryTime: user.deliveryTime || 'Afternoon',
        contactMethod: user.contactMethod || 'SMS',
        instructions: user.instructions || 'Leave at Door',
        profileImage: user.profileImage || ''
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update customer profile preferences
 * @route   PUT /api/customer/profile
 * @access  Private
 */
const updateCustomerProfile = async (req, res, next) => {
  const { name, email, phone, dob, gender, nationality, language, deliveryTime, contactMethod, instructions, profileImage } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (dob !== undefined) user.dob = dob;
    if (gender !== undefined) user.gender = gender;
    if (nationality !== undefined) user.nationality = nationality;
    if (language !== undefined) user.language = language;
    if (deliveryTime !== undefined) user.deliveryTime = deliveryTime;
    if (contactMethod !== undefined) user.contactMethod = contactMethod;
    if (instructions !== undefined) user.instructions = instructions;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dob: user.dob,
        gender: user.gender,
        nationality: user.nationality,
        language: user.language,
        deliveryTime: user.deliveryTime,
        contactMethod: user.contactMethod,
        instructions: user.instructions,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get customer addresses
 * @route   GET /api/customer/addresses
 * @access  Private
 */
const getAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user.addresses || [] });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add customer address
 * @route   POST /api/customer/addresses
 * @access  Private
 */
const addAddress = async (req, res, next) => {
  const { label, text } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    const isFirst = (user.addresses || []).length === 0;
    
    // Clear other defaults if new is default
    const isDefault = isFirst ? true : (req.body.isDefault || false);
    if (isDefault) {
      user.addresses.forEach(a => a.isDefault = false);
    }
    
    user.addresses.push({ label, text, isDefault });
    await user.save();
    
    res.status(201).json({ success: true, data: user.addresses });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update customer address
 * @route   PUT /api/customer/addresses/:id
 * @access  Private
 */
const updateAddress = async (req, res, next) => {
  const { label, text, isDefault } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    const address = user.addresses.id(req.params.id);
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });
    
    if (label) address.label = label;
    if (text) address.text = text;
    if (isDefault !== undefined) {
      if (isDefault) {
        user.addresses.forEach(a => {
          if (a._id.toString() !== req.params.id) a.isDefault = false;
        });
      }
      address.isDefault = isDefault;
    }
    
    await user.save();
    res.status(200).json({ success: true, data: user.addresses });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete customer address
 * @route   DELETE /api/customer/addresses/:id
 * @access  Private
 */
const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    const address = user.addresses.id(req.params.id);
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });
    
    const wasDefault = address.isDefault;
    user.addresses.pull(req.params.id);
    
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }
    
    await user.save();
    res.status(200).json({ success: true, data: user.addresses });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Set default customer address
 * @route   PUT /api/customer/addresses/:id/default
 * @access  Private
 */
const setDefaultAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    user.addresses.forEach(a => {
      a.isDefault = a._id.toString() === req.params.id;
    });
    
    await user.save();
    res.status(200).json({ success: true, data: user.addresses });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  trackDelivery,
  getCustomerProfile,
  updateCustomerProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
};
