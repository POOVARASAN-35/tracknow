const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true }
    },
    pickupAddress: {
      text: { type: String, required: true },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true
      }
    },
    deliveryAddress: {
      text: { type: String, required: true },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true
      }
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'accepted', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'rejected_by_driver', 'pending_admin_approval', 'rejection_declined'],
      default: 'pending'
    },
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    route: {
      distance: { type: Number, default: 0 }, // in km
      duration: { type: Number, default: 0 }, // in minutes
      polyline: { type: String, default: '' } // encoded Google Maps polyline
    },
    timeline: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        comment: { type: String }
      }
    ],
    eta: {
      type: Date,
      default: null
    },
    cancellationDetails: {
      cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
      },
      driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
      },
      reason: {
        type: String,
        default: null
      },
      comments: {
        type: String,
        default: null
      },
      timestamp: {
        type: Date,
        default: null
      }
    },
    rejectionDetails: {
      status: {
        type: String,
        enum: ['Pending Review', 'Approved', 'Declined', null],
        default: null
      },
      reason: {
        type: String,
        default: null
      },
      comments: {
        type: String,
        default: null
      },
      admin_comments: {
        type: String,
        default: null
      }
    },
    proofOfDelivery: {
      customerSignature: { type: String, default: null },
      deliveryPhoto: { type: String, default: null },
      otpCode: { type: String, default: null },
      packagePhoto: { type: String, default: null },
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }
      },
      timestamp: { type: Date, default: null }
    }
  },
  {
    timestamps: true
  }
);

// Indexing for faster lookups by tracking ID and driver assignments
deliverySchema.index({ trackingId: 1 });
deliverySchema.index({ assignedDriver: 1 });
deliverySchema.index({ status: 1 });

module.exports = mongoose.model('Delivery', deliverySchema);
