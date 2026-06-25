const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const axios = require('axios');
const User = require('../models/User');
const Driver = require('../models/Driver');

// Helper to generate access token
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_ACCESS_SECRET || 'your_jwt_access_secret_key_change_me_in_prod',
    { expiresIn: '15m' }
  );
};

// Helper to generate refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret_key_change_me_in_prod',
    { expiresIn: '7d' }
  );
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Role safety - only superadmin can create admins/superadmins
    // For initial setup we allow customer and driver registration.
    const userRole = role === 'admin' || role === 'superadmin' ? 'customer' : role || 'customer';

    const user = await User.create({
      name,
      email,
      password,
      role: userRole
    });

    // If driver role, create corresponding Driver profile
    if (userRole === 'driver') {
      const licenseNumber = `LIC-${Math.floor(100000 + Math.random() * 900000)}`;
      await Driver.create({
        user: user._id,
        licenseNumber
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage || '',
        phone: user.phone || ''
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.suspended) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact administrator.' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage || '',
        phone: user.phone || ''
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Refresh Token rotation
 * @route   POST /api/auth/refresh
 * @access  Public
 */
const refresh = async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'Refresh token required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret_key_change_me_in_prod');

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    // Rotate tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

/**
 * @desc    Logout user & invalidate refresh token
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot Password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account with that email exists' });
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Since this is a production mockup/prototype, we return the link directly.
    // In a full production codebase, we would email this to the user.
    res.status(200).json({
      success: true,
      message: 'Email reset link generated',
      resetLink: `/reset-password/${resetToken}`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset Password
 * @route   POST /api/auth/reset-password/:resetToken
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  const { password } = req.body;
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};


/**
 * @desc    Login with Google
 * @route   POST /api/auth/google
 * @access  Public
 */
const googleLogin = async (req, res, next) => {
  const { role } = req.body;
  const googleUser = req.googleUser;

  try {
    const { sub: googleId, email, name, picture } = googleUser;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address not provided by Google account' });
    }

    // Role mapping
    const targetRole = role === 'admin' || role === 'superadmin' ? 'superadmin' : role || 'customer';

    // Find user by googleId or email
    let user = await User.findOne({
      $or: [{ googleId }, { email }]
    });

    if (user) {
      if (user.suspended) {
        return res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact administrator.' });
      }

      // Check role verification constraints
      if (targetRole === 'driver') {
        if (user.role !== 'driver') {
          return res.status(403).json({ success: false, message: 'Only Driver accounts created by Super Admin can use Google Login' });
        }
      } else if (targetRole === 'superadmin') {
        if (user.role !== 'superadmin' && user.role !== 'admin') {
          return res.status(403).json({ success: false, message: 'Only authorized Super Admin email addresses can login using Google' });
        }
      }

      // Update OAuth and login details
      user.googleId = googleId;
      user.loginProvider = 'google';
      user.isVerified = true;
      user.lastLogin = new Date();
      if (picture && !user.profileImage) {
        user.profileImage = picture;
      }
      await user.save();
    } else {
      // Create new user (only allowed for customers)
      if (targetRole === 'driver') {
        return res.status(403).json({ success: false, message: 'Only Driver accounts created by Super Admin can use Google Login' });
      } else if (targetRole === 'superadmin') {
        return res.status(403).json({ success: false, message: 'Only authorized Super Admin email addresses can login using Google' });
      }

      const generatedPassword = crypto.randomBytes(32).toString('hex');
      user = await User.create({
        name,
        email,
        password: generatedPassword,
        googleId,
        role: 'customer',
        loginProvider: 'google',
        isVerified: true,
        lastLogin: new Date(),
        profileImage: picture || ''
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage || '',
        phone: user.phone || '',
        isVerified: user.isVerified,
        loginProvider: user.loginProvider
      }
    });
  } catch (error) {
    console.error('Google Auth Controller Error:', error.message);
    next(error);
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  refresh,
  logout,
  forgotPassword,
  resetPassword
};

