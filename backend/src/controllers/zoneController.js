const Zone = require('../models/Zone');

/**
 * @desc    Create geofencing boundary zone
 * @route   POST /api/zones
 * @access  Private (Admin/Superadmin)
 */
const createZone = async (req, res, next) => {
  const { name, description, status, coordinates } = req.body;

  try {
    if (!name || !coordinates) {
      return res.status(400).json({ success: false, message: 'Please provide name and coordinates' });
    }

    const zone = await Zone.create({
      name,
      description,
      status: status || 'active',
      coordinates: {
        type: 'Polygon',
        coordinates
      }
    });

    res.status(201).json({ success: true, data: zone });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all geofencing zones
 * @route   GET /api/zones
 * @access  Private
 */
const getZones = async (req, res, next) => {
  try {
    const zones = await Zone.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: zones.length, data: zones });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a geofence zone
 * @route   DELETE /api/zones/:id
 * @access  Private (Admin/Superadmin)
 */
const deleteZone = async (req, res, next) => {
  try {
    const zone = await Zone.findByIdAndDelete(req.params.id);
    if (!zone) {
      return res.status(404).json({ success: false, message: 'Zone not found' });
    }
    res.status(200).json({ success: true, message: 'Zone deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createZone,
  getZones,
  deleteZone
};
