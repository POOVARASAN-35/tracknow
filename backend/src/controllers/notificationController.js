const Notification = require('../models/Notification');

/**
 * @desc    Get current user's notifications (real-time/historical alerts)
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      query = {
        $or: [
          { recipient: req.user.id },
          { recipient: null }
        ]
      };
    } else {
      query = { recipient: req.user.id };
    }

    const notifications = await Notification.find(query)
      .populate('delivery')
      .sort({ createdAt: -1 })
      .limit(30);

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all notifications for the current user as read
 * @route   PUT /api/notifications
 * @access  Private
 */
const markNotificationsRead = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      query = {
        $or: [
          { recipient: req.user.id },
          { recipient: null }
        ]
      };
    } else {
      query = { recipient: req.user.id };
    }

    await Notification.updateMany(query, { read: true });

    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a single notification as read/acknowledged
 * @route   PUT /api/notifications/:id
 * @access  Private
 */
const markSingleNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    // Verify ownership
    if (notification.recipient && notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markNotificationsRead,
  markSingleNotificationRead
};
