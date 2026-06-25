const Driver = require('../models/Driver');
const TrackingLog = require('../models/TrackingLog');
const { processLocationUpdate } = require('../services/trackingService');

/**
 * @desc    Submit live GPS updates
 * @route   POST /api/tracking/update
 * @access  Private (Driver)
 */
const submitLocationUpdate = async (req, res, next) => {
  const { latitude, longitude, speed, deliveryId } = req.body;

  try {
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, message: 'Latitude and Longitude are required' });
    }

    const telemetry = { latitude, longitude, speed, deliveryId };
    const locationPayload = await processLocationUpdate(req.user.id, req.user.name, telemetry);

    res.status(200).json({ success: true, data: locationPayload });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get historical route coordinate logs for a delivery
 * @route   GET /api/tracking/history/:deliveryId
 * @access  Private
 */
const getTrackingLogs = async (req, res, next) => {
  try {
    const logs = await TrackingLog.find({ deliveryId: req.params.deliveryId })
      .sort({ timestamp: 1 });

    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get active driver positions (Fleet view)
 * @route   GET /api/tracking/fleet
 * @access  Private (Admin/Superadmin)
 */
const getFleetLocations = async (req, res, next) => {
  try {
    const activeDrivers = await Driver.find({ status: { $ne: 'offline' } })
      .populate('user', 'name email');

    res.status(200).json({ success: true, data: activeDrivers });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitLocationUpdate,
  getTrackingLogs,
  getFleetLocations
};
