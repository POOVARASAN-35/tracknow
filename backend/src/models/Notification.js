const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null // Null means broadcast to all admins/superadmins
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['delivery_assigned', 'delivery_started', 'delivery_completed', 'route_deviation', 'driver_offline', 'system_alert'],
      required: true
    },
    read: {
      type: Boolean,
      default: false
    },
    delivery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Delivery',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexing for notifications query efficiency
notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
