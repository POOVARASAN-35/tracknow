const User = require('../models/User');
const Driver = require('../models/Driver');
const Delivery = require('../models/Delivery');
const Vehicle = require('../models/Vehicle');
const AuditLog = require('../models/AuditLog');
const SupportTicket = require('../models/SupportTicket');

// Mock system settings stored in memory (in production this would be in DB or key-value config store)
let mockSystemSettings = {
  jwtExpiration: '24h',
  googleMapsApiKey: 'AIzaSyFakeKey_MapsControlCenter_2026_Prod',
  redisHost: '127.0.0.1',
  redisPort: 6379,
  smtpServer: 'smtp.trackflow.com',
  smtpPort: 587,
  smtpUser: 'no-reply@trackflow.com',
  smsGatewayUrl: 'https://sms.trackflow.com/api/v1/send',
  notificationsEnabled: true,
  themeModeDefault: 'light',
  defaultLanguage: 'English'
};

/**
 * ==========================================
 * VEHICLE MANAGEMENT CRUD
 * ==========================================
 */
const getVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find().populate('assignedDriver', 'name email');
    res.status(200).json({ success: true, count: vehicles.length, data: vehicles });
  } catch (error) {
    next(error);
  }
};

const createVehicle = async (req, res, next) => {
  const { vehicleNumber, model, type, status, assignedDriver } = req.body;
  try {
    const existing = await Vehicle.findOne({ vehicleNumber: vehicleNumber.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Vehicle number already exists' });
    }

    const vehicle = await Vehicle.create({
      vehicleNumber: vehicleNumber.toUpperCase(),
      model,
      type,
      status: status || 'active',
      assignedDriver: assignedDriver || null
    });

    // Log action
    await AuditLog.create({
      user: req.user.id,
      userName: req.user.name,
      action: `Created vehicle ${vehicle.vehicleNumber}`,
      ipAddress: req.ip
    });

    const populated = await Vehicle.findById(vehicle._id).populate('assignedDriver', 'name email');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('assignedDriver', 'name email');

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    await AuditLog.create({
      user: req.user.id,
      userName: req.user.name,
      action: `Updated vehicle ${vehicle.vehicleNumber} specs`,
      ipAddress: req.ip
    });

    res.status(200).json({ success: true, data: vehicle });
  } catch (error) {
    next(error);
  }
};

const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    await AuditLog.create({
      user: req.user.id,
      userName: req.user.name,
      action: `Deleted vehicle ${vehicle.vehicleNumber}`,
      ipAddress: req.ip
    });

    res.status(200).json({ success: true, message: 'Vehicle deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * ==========================================
 * USER / CUSTOMER MANAGEMENT
 * ==========================================
 */
const getUsers = async (req, res, next) => {
  const { role } = req.query;
  const filter = {};
  if (role) filter.role = role;

  try {
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  const { status } = req.body; // active / blocked
  try {
    const userToUpdate = await User.findById(req.params.id);
    if (!userToUpdate) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Set suspended field
    userToUpdate.suspended = status === 'blocked';
    await userToUpdate.save();

    // Log action
    await AuditLog.create({
      user: req.user.id,
      userName: req.user.name,
      action: `${status === 'blocked' ? 'Suspended' : 'Activated'} user account ${userToUpdate.email}`,
      ipAddress: req.ip
    });

    res.status(200).json({ success: true, data: userToUpdate });
  } catch (error) {
    next(error);
  }
};

/**
 * ==========================================
 * AUDIT LOGS LOOKUP
 * ==========================================
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    next(error);
  }
};

/**
 * ==========================================
 * SUPPORT CENTER TICKETS
 * ==========================================
 */
const getTickets = async (req, res, next) => {
  try {
    const tickets = await SupportTicket.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: tickets.length, data: tickets });
  } catch (error) {
    next(error);
  }
};

const updateTicket = async (req, res, next) => {
  const { status } = req.body;
  try {
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    await AuditLog.create({
      user: req.user.id,
      userName: req.user.name,
      action: `Resolved support ticket ID: ${ticket._id}`,
      ipAddress: req.ip
    });

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

/**
 * ==========================================
 * MOCK SYSTEM SETTINGS
 * ==========================================
 */
const getSettings = async (req, res, next) => {
  res.status(200).json({ success: true, data: mockSystemSettings });
};

const updateSettings = async (req, res, next) => {
  mockSystemSettings = {
    ...mockSystemSettings,
    ...req.body
  };

  await AuditLog.create({
    user: req.user.id,
    userName: req.user.name,
    action: 'Modified global system configurations settings',
    ipAddress: req.ip
  });

  res.status(200).json({ success: true, data: mockSystemSettings, message: 'System configurations updated successfully' });
};

module.exports = {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getUsers,
  updateUserStatus,
  getAuditLogs,
  getTickets,
  updateTicket,
  getSettings,
  updateSettings
};
