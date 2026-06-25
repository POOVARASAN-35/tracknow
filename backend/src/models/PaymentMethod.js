const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['upi', 'card', 'net_banking', 'wallet', 'cod'],
      required: true
    },
    details: {
      cardBrand: { type: String },
      last4: { type: String },
      expiryMonth: { type: String },
      expiryYear: { type: String },
      cardholderName: { type: String },
      upiId: { type: String },
      bankName: { type: String },
      walletName: { type: String }
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);
