const Review = require('../models/Review');
const Order = require('../models/Order');
const Driver = require('../models/Driver');
const Delivery = require('../models/Delivery');

/**
 * @desc    Submit a review for a completed order/driver
 * @route   POST /api/reviews
 * @access  Private (Customer)
 */
const createReview = async (req, res, next) => {
  const { orderId, rating, comment } = req.body;

  try {
    if (!orderId || !rating) {
      return res.status(400).json({ success: false, message: 'Order ID and rating are required' });
    }

    // 1. Fetch Order and verify status
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.customer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied: not your order' });
    }

    // 2. Retrieve corresponding Delivery driver info
    const delivery = await Delivery.findById(order.deliveryId);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Corresponding delivery manifest not found' });
    }

    if (!delivery.assignedDriver) {
      return res.status(400).json({ success: false, message: 'No driver was assigned to this delivery' });
    }

    const driverId = delivery.assignedDriver;

    // Check if review already exists
    const existingReview = await Review.findOne({ orderId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this delivery run' });
    }

    // 3. Create Review
    const review = await Review.create({
      orderId,
      customerId: req.user.id,
      driverId,
      rating: Number(rating),
      comment
    });

    // 4. Recalculate Driver average rating
    const reviews = await Review.find({ driverId });
    const avgRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;

    // Update Driver profile
    await Driver.findOneAndUpdate(
      { user: driverId },
      { rating: Number(avgRating.toFixed(2)) },
      { runValidators: true }
    );

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview
};
