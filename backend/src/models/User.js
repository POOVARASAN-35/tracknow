const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'driver', 'customer'],
      default: 'customer'
    },
    suspended: {
      type: Boolean,
      default: false
    },
    phone: {
      type: String,
      default: '+91 98765 43210'
    },
    dob: {
      type: String,
      default: '1995-08-12'
    },
    gender: {
      type: String,
      default: 'Female'
    },
    nationality: {
      type: String,
      default: 'Indian'
    },
    language: {
      type: String,
      default: 'English'
    },
    deliveryTime: {
      type: String,
      default: 'Afternoon'
    },
    contactMethod: {
      type: String,
      default: 'SMS'
    },
    instructions: {
      type: String,
      default: 'Leave at Door'
    },
    profileImage: {
      type: String,
      default: ''
    },
    addresses: [
      {
        label: { type: String, required: true },
        text: { type: String, required: true },
        isDefault: { type: Boolean, default: false }
      }
    ],
    refreshToken: {
      type: String,
      select: false
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    loginProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local'
    },
    lastLogin: {
      type: Date
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
