const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Delivery = require('../models/Delivery');
const Notification = require('../models/Notification');
const { getDirections } = require('../services/googleMapsService');
const { broadcastToRole } = require('../config/socket');
const { invalidateReport } = require('../services/redisService');

/**
 * @desc    Checkout cart and place a new logistics order
 * @route   POST /api/orders
 * @access  Private (Customer)
 */
const createOrder = async (req, res, next) => {
  const {
    recipientName,
    phone,
    pickupAddress,
    deliveryAddress,
    paymentMethod = 'UPI',
    specialInstructions = ''
  } = req.body;

  try {
    // 1. Fetch user's cart
    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your shopping cart is empty' });
    }

    if (!recipientName || !phone || !pickupAddress || !deliveryAddress) {
      return res.status(400).json({ success: false, message: 'Please provide all shipping details' });
    }

    // 2. Calculate sequential Order ID (ORD000001, etc.)
    const totalOrdersCount = await Order.countDocuments();
    const orderId = `ORD${String(totalOrdersCount + 1).padStart(6, '0')}`;

    // 3. Compute total checkout amount and map items
    let totalAmount = 0;
    const orderItems = cart.items.map(item => {
      const price = item.product.price;
      const quantity = item.quantity;
      totalAmount += price * quantity;
      return {
        product: {
          name: item.product.name,
          price: price,
          productId: item.product._id
        },
        quantity: quantity
      };
    });

    // 4. Generate random 4-digit OTP code
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    // 5. Get Google Maps directions telemetry details
    let routeDetails = { distance: 5, duration: 15, polyline: '', eta: new Date(Date.now() + 15 * 60000) };
    try {
      routeDetails = await getDirections(pickupAddress.coordinates, deliveryAddress.coordinates);
    } catch (err) {
      console.warn('Google Maps service route failure, using fallback mock routes:', err.message);
    }

    // 6. Create Delivery Record
    const delivery = await Delivery.create({
      trackingId: orderId,
      customer: {
        name: req.user.name,
        phone: phone,
        email: req.user.email
      },
      pickupAddress: {
        text: pickupAddress.text,
        coordinates: pickupAddress.coordinates
      },
      deliveryAddress: {
        text: deliveryAddress.text,
        coordinates: deliveryAddress.coordinates
      },
      status: 'pending',
      route: {
        distance: routeDetails.distance,
        duration: routeDetails.duration,
        polyline: routeDetails.polyline
      },
      eta: routeDetails.eta || new Date(Date.now() + routeDetails.duration * 60000),
      timeline: [
        {
          status: 'pending',
          comment: `Order placed. Tracking manifest generated.`
        }
      ],
      proofOfDelivery: {
        otpCode: otpCode,
        location: {
          type: 'Point',
          coordinates: deliveryAddress.coordinates
        }
      }
    });

    // 7. Create Order Record
    const order = await Order.create({
      orderId,
      customer: req.user.id,
      recipientName,
      phone,
      items: orderItems,
      totalAmount: Number(totalAmount.toFixed(2)),
      paymentMethod,
      pickupAddress,
      deliveryAddress,
      specialInstructions,
      status: 'Order Placed',
      deliveryId: delivery._id,
      otpCode
    });

    // 8. Clear user's shopping cart
    cart.items = [];
    await cart.save();

    // 9. Save notification alert in database for admins
    const notif = await Notification.create({
      recipient: null, // Broadcast to admins
      title: 'New Order Placed',
      message: `New shipment order ${orderId} has been placed by ${req.user.name}.`,
      type: 'system_alert',
      delivery: delivery._id
    });

    // 10. Invalidate Redis analytics cache
    await invalidateReport('dashboard_metrics');

    // 11. Broadcast real-time Socket notifications
    broadcastToRole('admin', 'new_order', { order, notification: notif });
    broadcastToRole('admin', 'notification', notif);
    broadcastToRole('admin', 'delivery_updated', delivery);

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get orders list
 * @route   GET /api/orders
 * @access  Private
 */
const getOrders = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'customer') {
      query.customer = req.user.id;
    }
    const orders = await Order.find(query)
      .populate('customer', 'name email')
      .populate('deliveryId')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get order details by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('deliveryId');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order invoice not found' });
    }

    // Role verification
    if (req.user.role === 'customer' && order.customer._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied to this invoice' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById
};
