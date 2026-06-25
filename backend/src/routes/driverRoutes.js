const express = require('express');
const router = express.Router();
const {
  getDrivers,
  getDriverProfile,
  addDriver,
  editDriver,
  uploadDriverDocuments,
  deleteDriver,
  updateDriverProfile,
  uploadDriverSelfDocuments
} = require('../controllers/driverController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/profile')
  .get(authorize('driver'), getDriverProfile)
  .put(authorize('driver'), updateDriverProfile);

router.post('/profile/documents', authorize('driver'), uploadDriverSelfDocuments);

router
  .route('/')
  .get(authorize('admin', 'superadmin'), getDrivers)
  .post(authorize('admin', 'superadmin'), addDriver);

router
  .route('/:id')
  .put(authorize('admin', 'superadmin'), editDriver)
  .delete(authorize('admin', 'superadmin'), deleteDriver);

router.post('/:id/documents', uploadDriverDocuments);

module.exports = router;
