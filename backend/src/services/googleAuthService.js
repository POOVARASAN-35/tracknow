const axios = require('axios');

/**
 * Verify access token with Google Userinfo API
 * @param {string} token 
 * @returns {Promise<Object>} Google user profile data
 */
const verifyToken = async (token) => {
  // If it's a mock token, bypass real verification (caller handles mock)
  if (token.startsWith('mock_token_')) {
    return null;
  }

  try {
    const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Google Userinfo verification failed:', error.message);
    throw new Error('Invalid Google access token');
  }
};

module.exports = {
  verifyToken
};
