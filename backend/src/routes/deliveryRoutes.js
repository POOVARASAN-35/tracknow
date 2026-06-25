const express = require('express');
const router = express.Router();
const {
  createDelivery,
  getDeliveries,
  getDeliveryById,
  updateDelivery,
  assignDriver,
  updateDeliveryStatus,
  deleteDelivery,
  reviewRejection,
  getRejectionRequests
} = require('../controllers/deliveryController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/rejections', authorize('admin', 'superadmin'), getRejectionRequests);
router.put('/:id/rejection-review', authorize('admin', 'superadmin'), reviewRejection);

router
  .route('/')
  .post(authorize('admin', 'superadmin'), createDelivery)
  .get(getDeliveries);

router
  .route('/:id')
  .get(getDeliveryById)
  .put(authorize('admin', 'superadmin'), updateDelivery)
  .delete(authorize('admin', 'superadmin'), deleteDelivery);

router.post('/:id/assign', authorize('admin', 'superadmin'), assignDriver);
router.put('/:id/status', updateDeliveryStatus);

module.exports = router;
