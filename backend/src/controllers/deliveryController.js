const Delivery = require('../models/Delivery');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Rejection = require('../models/Rejection');
const { getDirections } = require('../services/googleMapsService');
const { invalidateReport } = require('../services/redisService');
const { broadcastToRole, sendToUser, sendToDeliveryRoom } = require('../config/socket');

// Generate unique tracking ID
const generateTrackingId = () => {
  return `TRK-${Date.now().toString().slice(-8)}${Math.floor(10 + Math.random() * 90)}`;
};

// Sync status changes to Order collection in MongoDB
const syncOrderStatus = async (delivery) => {
  try {
    const Order = require('../models/Order');
    let orderStatus = delivery.status;
    if (delivery.status === 'pending') orderStatus = 'Order Placed';
    else if (delivery.status === 'assigned') orderStatus = 'Driver Assigned';
    else if (delivery.status === 'accepted') orderStatus = 'Accepted';
    else if (delivery.status === 'picked_up') orderStatus = 'Picked Up';
    else if (delivery.status === 'in_transit') orderStatus = 'In Transit';
    else if (delivery.status === 'delivered') orderStatus = 'Delivered';
    else if (delivery.status === 'cancelled') orderStatus = 'Cancelled';
    
    await Order.findOneAndUpdate({ orderId: delivery.trackingId }, { status: orderStatus });
  } catch (err) {
    console.error('Error syncing order status:', err.message);
  }
};

/**
 * @desc    Create a new delivery
 * @route   POST /api/deliveries
 * @access  Private (Admin/Superadmin)
 */
const createDelivery = async (req, res, next) => {
  const { customer, pickupAddress, deliveryAddress } = req.body;

  try {
    if (!customer || !pickupAddress || !deliveryAddress) {
      return res.status(400).json({ success: false, message: 'Please provide all details' });
    }

    // Call Google Maps Directions API (or fallback mock)
    const routeDetails = await getDirections(pickupAddress.coordinates, deliveryAddress.coordinates);

    const trackingId = generateTrackingId();

    const delivery = await Delivery.create({
      trackingId,
      customer,
      pickupAddress,
      deliveryAddress,
      route: {
        distance: routeDetails.distance,
        duration: routeDetails.duration,
        polyline: routeDetails.polyline
      },
      eta: routeDetails.eta,
      timeline: [
        {
          status: 'pending',
          comment: 'Delivery order created.'
        }
      ]
    });

    // Invalidate dashboard metrics cache
    await invalidateReport('dashboard_metrics');

    res.status(201).json({ success: true, data: delivery });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all deliveries (filtered by role)
 * @route   GET /api/deliveries
 * @access  Private (Admin/Superadmin/Driver)
 */
const getDeliveries = async (req, res, next) => {
  try {
    let query = {};

    // Drivers can only see their own assigned deliveries
    if (req.user.role === 'driver') {
      query.assignedDriver = req.user.id;
    } else if (req.user.role === 'customer') {
      query['customer.email'] = req.user.email;
    }

    const deliveries = await Delivery.find(query)
      .populate('assignedDriver', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: deliveries.length, data: deliveries });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single delivery by ID
 * @route   GET /api/deliveries/:id
 * @access  Private
 */
const getDeliveryById = async (req, res, next) => {
  try {
    const delivery = await Delivery.findById(req.params.id).populate('assignedDriver', 'name email');
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    // Role check: drivers/customers can only see their own deliveries
    if (req.user.role === 'driver' && delivery.assignedDriver?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    } else if (req.user.role === 'customer' && delivery.customer?.email !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({ success: true, data: delivery });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update delivery details
 * @route   PUT /api/deliveries/:id
 * @access  Private (Admin/Superadmin)
 */
const updateDelivery = async (req, res, next) => {
  const { customer, pickupAddress, deliveryAddress } = req.body;

  try {
    let delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    // Recalculate directions if coordinates changed
    if (pickupAddress?.coordinates || deliveryAddress?.coordinates) {
      const orig = pickupAddress?.coordinates || delivery.pickupAddress.coordinates;
      const dest = deliveryAddress?.coordinates || delivery.deliveryAddress.coordinates;
      const routeDetails = await getDirections(orig, dest);
      
      req.body.route = {
        distance: routeDetails.distance,
        duration: routeDetails.duration,
        polyline: routeDetails.polyline
      };
      req.body.eta = routeDetails.eta;
    }

    delivery = await Delivery.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('assignedDriver', 'name email');

    await invalidateReport('dashboard_metrics');

    broadcastToRole('admin', 'delivery_updated', delivery);
    if (delivery.assignedDriver) {
      sendToUser(delivery.assignedDriver._id.toString(), 'delivery_updated', delivery);
    }

    res.status(200).json({ success: true, data: delivery });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign driver to delivery
 * @route   POST /api/deliveries/:id/assign
 * @access  Private (Admin/Superadmin)
 */
const assignDriver = async (req, res, next) => {
  const { driverId } = req.body;

  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    const driver = await User.findById(driverId);
    if (!driver || driver.role !== 'driver') {
      return res.status(400).json({ success: false, message: 'Invalid driver ID' });
    }

    delivery.assignedDriver = driverId;
    if (delivery.status === 'pending') {
      delivery.status = 'assigned';
      delivery.timeline.push({
        status: 'assigned',
        comment: `Driver ${driver.name} assigned.`
      });
    }

    await delivery.save();
    await syncOrderStatus(delivery);
    const populatedDelivery = await Delivery.findById(delivery._id).populate('assignedDriver', 'name email');
    await invalidateReport('dashboard_metrics');

    // Create persistent notification in DB
    let notif = await Notification.create({
      recipient: driverId,
      title: 'New Delivery Assigned',
      message: `You have been assigned to delivery ${delivery.trackingId}`,
      type: 'delivery_assigned',
      delivery: delivery._id
    });

    // Populate delivery field for socket and client presentation
    notif = await Notification.findById(notif._id).populate('delivery');

    // Real-time notifications via Socket
    sendToUser(driverId, 'notification', notif);
    sendToUser(driverId, 'delivery_updated', populatedDelivery);
    broadcastToRole('admin', 'delivery_updated', populatedDelivery);

    res.status(200).json({ success: true, data: populatedDelivery });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update delivery status
 * @route   PUT /api/deliveries/:id/status
 * @access  Private (Admin/Superadmin/Driver)
 */
const updateDeliveryStatus = async (req, res, next) => {
  const { status, comment, cancellationReason, rejectionReason } = req.body;

  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    // Verification: Customer cannot update delivery status
    if (req.user.role === 'customer') {
      return res.status(403).json({ success: false, message: 'Access denied: customers cannot update delivery status' });
    }

    // Verification: Driver can only update their assigned deliveries
    if (req.user.role === 'driver' && delivery.assignedDriver?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied: not your assigned delivery' });
    }

    if (status === 'cancelled') {
      if (!cancellationReason) {
        return res.status(400).json({ success: false, message: 'Cancellation reason is required' });
      }

      const validReasons = [
        'Customer not available',
        'Customer requested cancellation',
        'Incorrect delivery address',
        'Vehicle breakdown',
        'Package damaged',
        'Unable to contact customer',
        'Duplicate order',
        'Out of delivery area',
        'Safety concern',
        'Other'
      ];

      if (!validReasons.includes(cancellationReason)) {
        return res.status(400).json({ success: false, message: 'Invalid cancellation reason' });
      }

      if (cancellationReason === 'Other' && (!comment || !comment.trim())) {
        return res.status(400).json({ success: false, message: 'Comments are required when choosing Other' });
      }

      delivery.cancellationDetails = {
        cancelledBy: req.user.id,
        driverId: delivery.assignedDriver || null,
        reason: cancellationReason,
        comments: comment || '',
        timestamp: new Date()
      };
    }

    if (status === 'pending_admin_approval') {
      if (['picked_up', 'in_transit', 'delivered', 'cancelled', 'rejected_by_driver', 'pending_admin_approval'].includes(delivery.status)) {
        return res.status(400).json({ success: false, message: 'Rejection is only allowed before pickup starts' });
      }

      if (!rejectionReason) {
        return res.status(400).json({ success: false, message: 'Rejection reason is required' });
      }

      const validRejectionReasons = [
        'Vehicle Breakdown',
        'Personal Emergency',
        'Health Issue',
        'Out of Delivery Radius',
        'Heavy Traffic',
        'Pickup Location Inaccessible',
        'Capacity Full',
        'Shift Ended',
        'Already Assigned Another Delivery',
        'Technical Issue',
        'Other'
      ];

      if (!validRejectionReasons.includes(rejectionReason)) {
        return res.status(400).json({ success: false, message: 'Invalid rejection reason' });
      }

      if (rejectionReason === 'Other' && (!comment || !comment.trim())) {
        return res.status(400).json({ success: false, message: 'Comments are required when choosing Other' });
      }

      // Check for existing pending request
      const existingRejection = await Rejection.findOne({
        delivery_id: delivery._id,
        driver_id: req.user.id,
        status: 'Pending Review'
      });

      if (existingRejection) {
        return res.status(400).json({ success: false, message: 'A rejection request has already been submitted for this delivery' });
      }

      // Create rejection log entry in DB
      await Rejection.create({
        delivery_id: delivery._id,
        driver_id: req.user.id,
        status: 'Pending Review',
        rejection_reason: rejectionReason,
        additional_comments: comment || '',
        rejected_at: new Date(),
        rejected_by: 'Driver'
      });

      // Set rejectionDetails on delivery
      delivery.rejectionDetails = {
        status: 'Pending Review',
        reason: rejectionReason,
        comments: comment || '',
        admin_comments: ''
      };
    }

    if (status === 'accepted') {
      // Clear rejectionDetails state on acceptance
      delivery.rejectionDetails = {
        status: null,
        reason: null,
        comments: null,
        admin_comments: null
      };
    }
    if (status === 'delivered') {
      const { proofOfDelivery } = req.body;
      delivery.proofOfDelivery = {
        customerSignature: proofOfDelivery?.customerSignature || null,
        deliveryPhoto: proofOfDelivery?.deliveryPhoto || null,
        otpCode: proofOfDelivery?.otpCode || null,
        packagePhoto: proofOfDelivery?.packagePhoto || null,
        location: proofOfDelivery?.location || {
          type: 'Point',
          coordinates: [77.5946, 12.9716]
        },
        timestamp: proofOfDelivery?.timestamp || new Date()
      };
    }

    delivery.status = status;
    
    let timelineComment = comment || `Status updated to ${status.replace(/_/g, ' ')}`;
    if (status === 'cancelled') {
      timelineComment = `Cancelled: ${cancellationReason}.${comment ? ` Comments: ${comment}` : ''}`;
    } else if (status === 'pending_admin_approval') {
      timelineComment = `Rejection request submitted by driver: ${rejectionReason}.${comment ? ` Comments: ${comment}` : ''}`;
    } else if (status === 'rejection_declined') {
      timelineComment = `Rejection request declined by admin.${comment ? ` Reason: ${comment}` : ''}`;
    }

    delivery.timeline.push({
      status,
      comment: timelineComment
    });

    await delivery.save();
    await syncOrderStatus(delivery);
    const populatedDelivery = await Delivery.findById(delivery._id).populate('assignedDriver', 'name email');
    await invalidateReport('dashboard_metrics');

    // Send notifications to stakeholders
    const isApprovalRequest = status === 'pending_admin_approval';
    const notifType = isApprovalRequest ? 'system_alert' : status === 'in_transit' ? 'delivery_started' : status === 'delivered' ? 'delivery_completed' : 'system_alert';
    const notifTitle = isApprovalRequest ? 'Delivery Rejection Request' : status === 'in_transit' ? 'Delivery In Transit' : status === 'delivered' ? 'Delivery Completed' : 'Delivery Update';
    const notifMessage = isApprovalRequest 
      ? `Driver ${req.user.name} submitted a rejection request for delivery ${populatedDelivery.trackingId || delivery.trackingId}. Reason: ${rejectionReason}`
      : `Delivery ${populatedDelivery.trackingId || delivery.trackingId} is now ${status.replace(/_/g, ' ')}`;
    
    // Save system alerts for administrative viewing
    const notif = await Notification.create({
      recipient: null, // Broadcast to all admins
      title: notifTitle,
      message: notifMessage,
      type: notifType,
      delivery: delivery._id
    });

    broadcastToRole('admin', 'notification', notif);
    broadcastToRole('admin', 'delivery_updated', populatedDelivery);
    
    // Notify the user who updated/rejected it
    sendToUser(req.user.id, 'delivery_updated', populatedDelivery);

    if (populatedDelivery.assignedDriver) {
      sendToUser(populatedDelivery.assignedDriver._id.toString(), 'delivery_updated', populatedDelivery);
    }
    
    // Send socket update directly to the customer room tracking this delivery
    sendToDeliveryRoom(populatedDelivery.id, 'status_updated', {
      status,
      timeline: populatedDelivery.timeline,
      eta: populatedDelivery.eta
    });

    res.status(200).json({ success: true, data: populatedDelivery });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete delivery order
 * @route   DELETE /api/deliveries/:id
 * @access  Private (Admin/Superadmin)
 */
const deleteDelivery = async (req, res, next) => {
  try {
    const delivery = await Delivery.findByIdAndDelete(req.params.id);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    await invalidateReport('dashboard_metrics');
    broadcastToRole('admin', 'delivery_deleted', { id: req.params.id });

    res.status(200).json({ success: true, message: 'Delivery deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Review driver rejection request
 * @route   PUT /api/deliveries/:id/rejection-review
 * @access  Private (Admin/Superadmin)
 */
const reviewRejection = async (req, res, next) => {
  const { action, adminComment } = req.body;

  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    if (delivery.status !== 'pending_admin_approval') {
      return res.status(400).json({ success: false, message: 'No pending rejection request for this delivery' });
    }

    // Find the pending rejection log
    const rejection = await Rejection.findOne({
      delivery_id: delivery._id,
      status: 'Pending Review'
    });

    if (!rejection) {
      return res.status(404).json({ success: false, message: 'Rejection request record not found' });
    }

    const driverId = rejection.driver_id.toString();

    if (action === 'approve') {
      // 1. Update rejection log
      rejection.status = 'Approved';
      rejection.reviewed_by = req.user.id;
      rejection.reviewed_at = new Date();
      await rejection.save();

      // 2. Clear assigned driver and reset status to pending
      delivery.assignedDriver = null;
      delivery.status = 'pending';
      delivery.rejectionDetails = {
        status: 'Approved',
        reason: '',
        comments: '',
        admin_comments: ''
      };

      delivery.timeline.push({
        status: 'pending',
        comment: `Rejection approved by Super Admin. Released driver.`
      });

      await delivery.save();
      await syncOrderStatus(delivery);
      const populatedDelivery = await Delivery.findById(delivery._id).populate('assignedDriver', 'name email');
      await invalidateReport('dashboard_metrics');

      // Create notification for driver
      const driverNotif = await Notification.create({
        recipient: driverId,
        title: 'Rejection Request Approved',
        message: `Your rejection request for delivery ${delivery.trackingId} has been approved. The delivery has been removed from your list.`,
        type: 'system_alert',
        delivery: delivery._id
      });

      sendToUser(driverId, 'notification', driverNotif);
      sendToUser(driverId, 'delivery_updated', populatedDelivery);
      broadcastToRole('admin', 'delivery_updated', populatedDelivery);

      res.status(200).json({ success: true, data: populatedDelivery });
    } else if (action === 'decline') {
      if (!adminComment || !adminComment.trim()) {
        return res.status(400).json({ success: false, message: 'Declining a rejection request requires a comment' });
      }

      // 1. Update rejection log
      rejection.status = 'Declined';
      rejection.admin_comments = adminComment;
      rejection.reviewed_by = req.user.id;
      rejection.reviewed_at = new Date();
      await rejection.save();

      // 2. Set status to rejection_declined
      delivery.status = 'rejection_declined';
      delivery.rejectionDetails.status = 'Declined';
      delivery.rejectionDetails.admin_comments = adminComment;

      delivery.timeline.push({
        status: 'rejection_declined',
        comment: `Rejection request declined by Super Admin. Reason: ${adminComment}`
      });

      await delivery.save();
      await syncOrderStatus(delivery);
      const populatedDelivery = await Delivery.findById(delivery._id).populate('assignedDriver', 'name email');
      await invalidateReport('dashboard_metrics');

      // Create notification for driver
      const driverNotif = await Notification.create({
        recipient: driverId,
        title: 'Rejection Request Declined',
        message: `Your rejection request for delivery ${delivery.trackingId} has been declined. Reason: "${adminComment}". Please complete the assigned delivery.`,
        type: 'system_alert',
        delivery: delivery._id
      });

      sendToUser(driverId, 'notification', driverNotif);
      sendToUser(driverId, 'delivery_updated', populatedDelivery);
      broadcastToRole('admin', 'delivery_updated', populatedDelivery);

      res.status(200).json({ success: true, data: populatedDelivery });
    } else {
      res.status(400).json({ success: false, message: 'Invalid action. Must be approve or decline' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all rejection requests
 * @route   GET /api/deliveries/rejections
 * @access  Private (Admin/Superadmin)
 */
const getRejectionRequests = async (req, res, next) => {
  try {
    const rejections = await Rejection.find()
      .populate({
        path: 'delivery_id',
        select: 'trackingId customer status'
      })
      .populate('driver_id', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: rejections.length, data: rejections });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDelivery,
  getDeliveries,
  getDeliveryById,
  updateDelivery,
  assignDriver,
  updateDeliveryStatus,
  deleteDelivery,
  reviewRejection,
  getRejectionRequests
};
