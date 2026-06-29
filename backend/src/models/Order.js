const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipientName: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    items: [
      {
        product: {
          name: { type: String, required: true },
          price: { type: Number, required: true },
          productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        }
      }
    ],
    totalAmount: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['UPI', 'Credit Card', 'Cash on Delivery'],
      default: 'UPI'
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
    specialInstructions: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Order Placed', 'Driver Assigned', 'Accepted', 'Picked Up', 'In Transit', 'Delivered', 'Cancelled', 'rejection_declined', 'pending_admin_approval'],
      default: 'Order Placed'
    },
    deliveryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Delivery',
      default: null
    },
    otpCode: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
orderSchema.index({ customer: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
