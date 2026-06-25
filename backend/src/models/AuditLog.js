const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1'
    },
    status: {
      type: String,
      enum: ['Success', 'Failed'],
      default: 'Success'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
