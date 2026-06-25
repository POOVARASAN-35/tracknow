const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    licenseNumber: {
      type: String,
      required: [true, 'Please add a license number'],
      trim: true,
      unique: true
    },
    status: {
      type: String,
      enum: ['available', 'busy', 'offline'],
      default: 'offline'
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1.0,
      max: 5.0
    },
    performanceScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    },
    documents: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0] // [longitude, latitude]
      }
    }
  },
  {
    timestamps: true
  }
);

// GeoJSON 2dsphere index for geospatial searches
driverSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Driver', driverSchema);
