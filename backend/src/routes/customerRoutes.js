const express = require('express');
const router = express.Router();
const { 
  trackDelivery, 
  getCustomerProfile, 
  updateCustomerProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} = require('../controllers/customerController');
const { protect } = require('../middleware/auth');

// Public route - no auth guards
router.get('/track/:trackingId', trackDelivery);

// Protected profile routes
router.get('/profile', protect, getCustomerProfile);
router.put('/profile', protect, updateCustomerProfile);

// Protected address routes
router.route('/addresses')
  .get(protect, getAddresses)
  .post(protect, addAddress);

router.route('/addresses/:id')
  .put(protect, updateAddress)
  .delete(protect, deleteAddress);

router.put('/addresses/:id/default', protect, setDefaultAddress);

module.exports = router;
