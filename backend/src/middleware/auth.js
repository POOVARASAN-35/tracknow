const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes - Verification Middleware
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'your_jwt_access_secret_key_change_me_in_prod');

    // Attach user to req
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (user.suspended) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact administrator.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};

/**
 * Authorize specific roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'guest'}' is not authorized to access this resource`
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize
};
