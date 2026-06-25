/**
 * Global centralized error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev mode
  console.error(err.stack || err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new Error(message);
    res.statusCode = 404;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value entered: '${field}'. Please use another value.`;
    error = new Error(message);
    res.statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    error = new Error(message);
    res.statusCode = 400;
  }

  // JWT expired error
  if (err.name === 'TokenExpiredError') {
    const message = 'Your session has expired. Please log in again.';
    error = new Error(message);
    res.statusCode = 401;
  }

  // JWT web token error
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid session token. Please log in again.';
    error = new Error(message);
    res.statusCode = 401;
  }

  res.status(res.statusCode && res.statusCode !== 200 ? res.statusCode : 500).json({
    success: false,
    message: error.message || 'Server Error'
  });
};

module.exports = errorHandler;
