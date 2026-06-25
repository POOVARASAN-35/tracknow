const express = require('express');
const router = express.Router();
const {
  register,
  login,
  googleLogin,
  refresh,
  logout,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const verifyGoogleToken = require('../middleware/verifyGoogleToken');

// Security rate limiter applied to login/register routes
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google', authLimiter, verifyGoogleToken, googleLogin);
router.get('/config', (req, res) => {
  res.json({ googleClientId: process.env.GOOGLE_CLIENT_ID || 'your_google_client_id_placeholder' });
});
router.post('/refresh', refresh);
router.post('/logout', protect, logout);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:resetToken', authLimiter, resetPassword);

module.exports = router;
