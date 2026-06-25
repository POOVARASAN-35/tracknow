const express = require('express');
const router = express.Router();
const { getCart, addToCart, removeFromCart, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.route('/')
  .get(getCart)
  .delete(clearCart);

router.post('/add', addToCart);
router.post('/remove', removeFromCart);

module.exports = router;
