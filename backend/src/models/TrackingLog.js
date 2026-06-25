const mongoose = require('mongoose');

const trackingLogSchema = new mongoose.Schema(
  {
    deliveryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Delivery',
      required: true
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true
      }
    },
    speed: {
      type: Number, // in km/h
      default: 0
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false
  }
);

// Indexes for analytical path queries
trackingLogSchema.index({ deliveryId: 1, timestamp: 1 });
trackingLogSchema.index({ driverId: 1, timestamp: 1 });

module.exports = mongoose.model('TrackingLog', trackingLogSchema);
