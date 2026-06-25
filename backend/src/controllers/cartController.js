const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * @desc    Get user's shopping cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id }).populate('items.product');
    
    // If cart doesn't exist, create an empty one
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [] });
    }

    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add product to cart (or increment quantity)
 * @route   POST /api/cart/add
 * @access  Private
 */
const addToCart = async (req, res, next) => {
  const { productId, quantity = 1 } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    // Check if product already in cart
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
      // Increment quantity
      cart.items[itemIndex].quantity += Number(quantity);
    } else {
      // Add new item
      cart.items.push({ product: productId, quantity: Number(quantity) });
    }

    await cart.save();
    
    // Re-populate and return updated cart
    const populatedCart = await Cart.findById(cart._id).populate('items.product');

    res.status(200).json({ success: true, data: populatedCart });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove product from cart (decrement or remove completely)
 * @route   POST /api/cart/remove
 * @access  Private
 */
const removeFromCart = async (req, res, next) => {
  const { productId } = req.body;

  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    // If quantity is more than 1, decrement it. Otherwise, remove it.
    if (cart.items[itemIndex].quantity > 1) {
      cart.items[itemIndex].quantity -= 1;
    } else {
      cart.items.splice(itemIndex, 1);
    }

    await cart.save();
    
    // Re-populate and return updated cart
    const populatedCart = await Cart.findById(cart._id).populate('items.product');

    res.status(200).json({ success: true, data: populatedCart });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/cart
 * @access  Private
 */
const clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.status(200).json({ success: true, message: 'Cart cleared successfully', data: cart });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  clearCart
};
