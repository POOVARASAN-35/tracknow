const axios = require('axios');

/**
 * Calculate distance between two coordinates using the Haversine formula (mock/fallback usage)
 */
const getHaversineDistance = (coords1, coords2) => {
  const [lng1, lat1] = coords1;
  const [lng2, lat2] = coords2;

  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance in km
};

/**
 * Generate a simplified mock polyline path between two points
 */
const generateMockPolyline = (coords1, coords2) => {
  // A simple string representing a path. For mock rendering, we can send coordinates or a fake polyline.
  // In a real application, Google Maps Directions API returns an encoded polyline string.
  // Let's generate a basic set of coordinates and encode them, or just output a standard dummy string.
  return `mock_polyline_from_${coords1.join('_')}_to_${coords2.join('_')}`;
};

/**
 * Calculate Route Directions & ETA
 */
const getDirections = async (origin, destination, waypoints = []) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const isKeyConfigured = apiKey && apiKey !== 'your_google_maps_api_key_placeholder';

  if (isKeyConfigured) {
    try {
      const originStr = `${origin[1]},${origin[0]}`; // Google expects lat,lng
      const destStr = `${destination[1]},${destination[0]}`;
      let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destStr}&key=${apiKey}`;

      if (waypoints.length > 0) {
        const waypointsStr = waypoints.map((w) => `${w[1]},${w[0]}`).join('|');
        url += `&waypoints=${waypointsStr}`;
      }

      const response = await axios.get(url);
      const data = response.data;

      if (data.status === 'OK') {
        const route = data.routes[0];
        const leg = route.legs[0];

        // Total distance and duration across all legs
        let totalDistance = 0;
        let totalDuration = 0;
        route.legs.forEach((l) => {
          totalDistance += l.distance.value; // meters
          totalDuration += l.duration.value; // seconds
        });

        return {
          distance: +(totalDistance / 1000).toFixed(2), // to km
          duration: +(totalDuration / 60).toFixed(1), // to minutes
          polyline: route.overview_polyline.points,
          eta: new Date(Date.now() + totalDuration * 1000)
        };
      }
      console.warn('Google Directions API returned status:', data.status);
    } catch (error) {
      console.error('Error fetching Google Directions:', error.message);
    }
  }

  // Fallback / Mock calculations
  console.log('Using simulated routing services.');
  const baseDistance = getHaversineDistance(origin, destination);
  
  // Account for road winding (usually ~1.3x straight-line distance) and traffic
  const realDistance = +(baseDistance * 1.25).toFixed(2);
  // Average speed in urban areas (approx 35 km/h)
  const averageSpeed = 35;
  const durationMinutes = +((realDistance / averageSpeed) * 60).toFixed(1);
  const eta = new Date(Date.now() + durationMinutes * 60 * 1000);

  return {
    distance: realDistance,
    duration: durationMinutes,
    polyline: generateMockPolyline(origin, destination),
    eta
  };
};

module.exports = {
  getDirections,
  getHaversineDistance
};
