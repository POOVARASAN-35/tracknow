const io = require('socket.io-client');
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const runSimulation = async () => {
  console.log('--- Starting TrackNow Real-Time Telemetry Simulation ---');

  let driverToken = '';
  let deliveryId = '';
  let trackingId = '';

  // 1. Authenticate / Login the driver
  try {
    console.log('1. Registering/Logging in courier agent...');
    const registerRes = await axios.post(`${API_URL}/auth/register`, {
      name: 'Simulated Driver',
      email: `driver_${Date.now()}@tracknow.com`,
      password: 'Password123',
      role: 'driver'
    });

    driverToken = registerRes.data.accessToken;
    console.log('Driver successfully authenticated!');
  } catch (error) {
    console.error('Driver authentication failed. Simulation aborted.', error.response?.data || error.message);
    return;
  }

  // 2. Setup a mock delivery using the admin account
  let adminToken = '';
  try {
    console.log('2. Authenticating as Super Admin to set up shipment...');
    const adminRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'superadmin@tracknow.com',
      password: 'Password123'
    });
    adminToken = adminRes.data.accessToken;

    console.log('Creating shipment delivery order...');
    const deliveryRes = await axios.post(`${API_URL}/deliveries`, {
      customer: {
        name: 'Jane Doe',
        phone: '+1 555-0199',
        email: 'jane.doe@example.com'
      },
      pickupAddress: {
        text: 'Brigade Road, Bengaluru',
        coordinates: [77.5946, 12.9716]
      },
      deliveryAddress: {
        text: 'Indiranagar, Bengaluru',
        coordinates: [77.6412, 12.9784]
      }
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    deliveryId = deliveryRes.data.data._id;
    trackingId = deliveryRes.data.data.trackingId;
    console.log(`Shipment created! ID: ${deliveryId}, Tracking ID: ${trackingId}`);

    // Assign driver to shipment
    console.log('Assigning driver to order...');
    const decodedDriver = JSON.parse(Buffer.from(driverToken.split('.')[1], 'base64').toString());
    await axios.post(`${API_URL}/deliveries/${deliveryId}/assign`, {
      driverId: decodedDriver.id
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('Driver successfully assigned!');
  } catch (error) {
    console.error('Shipment setup failed:', error.response?.data || error.message);
    return;
  }

  // 3. Connect to Socket Gateway
  console.log('3. Opening websocket telemetry gateway...');
  const socket = io(SOCKET_URL, {
    auth: { token: driverToken },
    transports: ['websocket']
  });

  socket.on('connect', () => {
    console.log('Websocket channel established. Socket ID:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.error('Websocket connection error:', err.message);
  });

  await sleep(1500);

  // 4. Update shipment status to "In Transit"
  try {
    console.log('4. Transitioning order status to IN TRANSIT...');
    await axios.put(`${API_URL}/deliveries/${deliveryId}/status`, {
      status: 'in_transit',
      comment: 'Courier has picked up package and is in transit.'
    }, {
      headers: { Authorization: `Bearer ${driverToken}` }
    });
  } catch (error) {
    console.error('Status transition failed:', error.response?.data || error.message);
    socket.disconnect();
    return;
  }

  // 5. Stream GPS steps from pickup to destination
  console.log('5. Streaming live telemetry updates at 5-second intervals...');
  const stepsCount = 10;
  const startLng = 77.5946;
  const startLat = 12.9716;
  const endLng = 77.6412;
  const endLat = 12.9784;

  for (let i = 0; i <= stepsCount; i++) {
    const ratio = i / stepsCount;
    const currentLng = startLng + (endLng - startLng) * ratio;
    const currentLat = startLat + (endLat - startLat) * ratio;
    const speed = 40 + Math.random() * 15; // km/h

    console.log(`Sending ping ${i}/${stepsCount}: [${currentLng.toFixed(5)}, ${currentLat.toFixed(5)}] Speed: ${speed.toFixed(1)} km/h`);

    socket.emit('driver:location_update', {
      latitude: currentLat,
      longitude: currentLng,
      speed: +speed.toFixed(1),
      deliveryId
    });

    await sleep(5000);
  }

  // 6. Complete delivery
  try {
    console.log('6. Order arrived! Transitioning status to DELIVERED...');
    await axios.put(`${API_URL}/deliveries/${deliveryId}/status`, {
      status: 'delivered',
      comment: 'Consignment successfully delivered to customer.'
    }, {
      headers: { Authorization: `Bearer ${driverToken}` }
    });
    console.log('Simulation successfully completed!');
  } catch (error) {
    console.error('Final status transition failed:', error.response?.data || error.message);
  } finally {
    socket.disconnect();
  }
};

runSimulation();
