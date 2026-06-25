const express = require('express');
const router = express.Router();
const {
  submitLocationUpdate,
  getTrackingLogs,
  getFleetLocations
} = require('../controllers/trackingController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/update', authorize('driver'), submitLocationUpdate);
router.get('/history/:deliveryId', getTrackingLogs);
router.get('/fleet', authorize('admin', 'superadmin'), getFleetLocations);

module.exports = router;
