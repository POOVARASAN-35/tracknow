const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema(
  {
    refundId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    orderId: {
      type: String,
      required: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['Success', 'Pending', 'Failed'],
      default: 'Pending'
    },
    expectedDate: {
      type: Date
    },
    method: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

refundSchema.index({ customer: 1 });

module.exports = mongoose.model('Refund', refundSchema);
