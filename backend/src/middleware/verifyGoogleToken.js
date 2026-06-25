const googleAuthService = require('../services/googleAuthService');

const verifyGoogleToken = async (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: 'Google token is required' });
  }

  // Pass for mock tokens in non-production
  if (token.startsWith('mock_token_') && process.env.NODE_ENV !== 'production') {
    req.googleUser = {
      sub: `mock-google-id-${req.body.email || 'default'}`,
      email: req.body.email || 'google-customer@tracknow.com',
      name: req.body.name || 'Google Test Customer',
      picture: ''
    };
    return next();
  }

  try {
    const googleUser = await googleAuthService.verifyToken(token);
    req.googleUser = googleUser;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired Google token' });
  }
};

module.exports = verifyGoogleToken;
