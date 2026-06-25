const mongoose = require('mongoose');

const customerWalletSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    balance: {
      type: Number,
      default: 0
    },
    cashback: {
      type: Number,
      default: 0
    },
    history: [
      {
        type: {
          type: String,
          enum: ['credit', 'debit'],
          required: true
        },
        amount: {
          type: Number,
          required: true
        },
        description: {
          type: String,
          required: true
        },
        date: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('CustomerWallet', customerWalletSchema);
