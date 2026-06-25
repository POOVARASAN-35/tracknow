const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['open', 'pending', 'resolved'],
      default: 'open'
    },
    category: {
      type: String,
      enum: ['Customer Complaint', 'Driver Complaint', 'System Feedback'],
      default: 'System Feedback'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
