const express = require('express');
const router = express.Router();
const { getProducts, createProduct } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getProducts)
  .post(protect, authorize('admin', 'superadmin'), createProduct);

module.exports = router;
