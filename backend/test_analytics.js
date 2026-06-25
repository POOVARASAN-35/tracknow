const axios = require('axios');

const test = async () => {
  try {
    console.log('Logging in...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'superadmin@tracknow.com',
      password: 'Password123'
    });

    const token = loginRes.data.accessToken;
    console.log('Token acquired. Fetching dashboard stats...');

    const statsRes = await axios.get('http://localhost:5000/api/analytics/dashboard', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Stats Response Status:', statsRes.status);
    console.log('Stats Data:', JSON.stringify(statsRes.data, null, 2));
  } catch (err) {
    console.error('Error fetching analytics:', err.response?.data || err.message);
  }
};

test();
