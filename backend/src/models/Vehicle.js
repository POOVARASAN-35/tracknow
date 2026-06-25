const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    vehicleNumber: {
      type: String,
      required: [true, 'Please add a vehicle registration number'],
      unique: true,
      trim: true,
      uppercase: true
    },
    model: {
      type: String,
      required: [true, 'Please add a vehicle model']
    },
    type: {
      type: String,
      enum: ['bike', 'car', 'van', 'truck'],
      default: 'van'
    },
    status: {
      type: String,
      enum: ['active', 'maintenance', 'inactive'],
      default: 'active'
    },
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
