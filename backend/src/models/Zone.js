const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a zone name'],
      trim: true,
      unique: true
    },
    description: {
      type: String
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Polygon'],
        default: 'Polygon'
      },
      coordinates: {
        type: [[[Number]]], // Array of arrays of [lng, lat]
        required: true
      }
    }
  },
  {
    timestamps: true
  }
);

// 2dsphere index for point-in-polygon calculations
zoneSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('Zone', zoneSchema);
