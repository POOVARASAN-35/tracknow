const mongoose = require('mongoose');

const rejectionSchema = new mongoose.Schema(
  {
    delivery_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Delivery',
      required: true
    },
    driver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['Pending Review', 'Approved', 'Declined'],
      default: 'Pending Review'
    },
    rejection_reason: {
      type: String,
      required: true
    },
    additional_comments: {
      type: String,
      default: ''
    },
    admin_comments: {
      type: String,
      default: ''
    },
    reviewed_at: {
      type: Date,
      default: null
    },
    reviewed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    rejected_at: {
      type: Date,
      default: Date.now
    },
    rejected_by: {
      type: String,
      default: 'Driver'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Rejection', rejectionSchema);
