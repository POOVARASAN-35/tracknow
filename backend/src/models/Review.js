const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
reviewSchema.index({ driverId: 1 });
reviewSchema.index({ orderId: 1 });

module.exports = mongoose.model('Review', reviewSchema);
