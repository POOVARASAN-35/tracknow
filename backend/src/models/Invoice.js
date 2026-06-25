const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    dueDate: {
      type: Date,
      default: () => new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    },
    status: {
      type: String,
      enum: ['Paid', 'Pending', 'Refunded', 'Cancelled', 'Failed'],
      default: 'Pending'
    },
    subtotal: {
      type: Number,
      required: true
    },
    tax: {
      type: Number,
      required: true
    },
    deliveryCharge: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    couponCode: {
      type: String,
      default: ''
    },
    totalAmount: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      required: true,
      default: 'UPI'
    },
    transactionId: {
      type: String,
      default: ''
    },
    trackingId: {
      type: String,
      default: ''
    },
    billingAddress: {
      text: { type: String, default: '' }
    },
    deliveryAddress: {
      text: { type: String, default: '' }
    }
  },
  {
    timestamps: true
  }
);

invoiceSchema.index({ invoiceId: 1 });
invoiceSchema.index({ customer: 1 });
invoiceSchema.index({ status: 1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
