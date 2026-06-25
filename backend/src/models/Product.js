const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Please provide price'],
      min: [0, 'Price cannot be negative']
    },
    image: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      default: 'General'
    },
    weightClass: {
      type: String,
      enum: ['light', 'medium', 'heavy'],
      default: 'light'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Product', productSchema);
