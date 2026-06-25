const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Secure all admin control panel endpoints to administrative roles only
router.use(protect);
router.use(authorize('superadmin', 'admin'));

router.route('/vehicles')
  .get(getVehicles)
  .post(createVehicle);

router.route('/vehicles/:id')
  .put(updateVehicle)
  .delete(deleteVehicle);

router.route('/users')
  .get(getUsers);

router.route('/users/:id/status')
  .put(updateUserStatus);

router.route('/tickets')
  .get(getTickets);

router.route('/tickets/:id')
  .put(updateTicket);

router.route('/audit-logs')
  .get(getAuditLogs);

router.route('/settings')
  .get(getSettings)
  .put(updateSettings);

module.exports = router;
