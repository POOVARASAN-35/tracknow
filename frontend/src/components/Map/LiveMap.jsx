import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

const LiveMap = ({ pickup, destination, driverLocation, polyline }) => {
  const [mapError, setMapError] = useState(false);

  // We check if a Google Maps API Key is available
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const isKeyValid = apiKey && apiKey !== 'your_google_maps_api_key_placeholder';

  // Fallback: If no API key, we draw a beautiful futuristic vector tracking dashboard
  // pickup and destination are [longitude, latitude] arrays
  const [pLng, pLat] = pickup || [77.5946, 12.9716];
  const [dLng, dLat] = destination || [77.6412, 12.9784];
  const driverLng = driverLocation?.longitude || pLng;
  const driverLat = driverLocation?.latitude || pLat;

  // Normalize coordinates for relative SVG plotting
  // Map range to 100-400 SVG box
  const minLng = Math.min(pLng, dLng, driverLng) - 0.01;
  const maxLng = Math.max(pLng, dLng, driverLng) + 0.01;
  const minLat = Math.min(pLat, dLat, driverLat) - 0.01;
  const maxLat = Math.max(pLat, dLat, driverLat) + 0.01;

  const getX = (lng) => {
    if (maxLng === minLng) return 250;
    return 50 + ((lng - minLng) / (maxLng - minLng)) * 400;
  };

  const getY = (lat) => {
    if (maxLat === minLat) return 250;
    // SVG y-axis is inverted: top is 0, bottom is height
    return 450 - ((lat - minLat) / (maxLat - minLat)) * 400;
  };

  const pickupX = getX(pLng);
  const pickupY = getY(pLat);
  const destX = getX(dLng);
  const destY = getY(dLat);
  const driverX = getX(driverLng);
  const driverY = getY(driverLat);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        backgroundColor: '#0c101d',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: 4
      }}
    >
      {/* SVG Canvas Map Fallback / Visual presentation */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 500 500"
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
      >
        {/* Grid lines to make it feel like a radar/map grid */}
        <defs>
          <pattern id="radarGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#radarGrid)" />

        {/* Route Polyline line */}
        <line
          x1={pickupX}
          y1={pickupY}
          x2={destX}
          y2={destY}
          stroke="rgba(99, 102, 241, 0.4)"
          strokeWidth="3"
          strokeDasharray="6,4"
        />

        {/* Driver current tracking path */}
        <line
          x1={pickupX}
          y1={pickupY}
          x2={driverX}
          y2={driverY}
          stroke="#00e5ff"
          strokeWidth="4"
        />

        {/* Pickup point marker */}
        <circle cx={pickupX} cy={pickupY} r="8" fill="#818cf8" stroke="#070a13" strokeWidth="2" />
        <text x={pickupX + 12} y={pickupY + 4} fill="#818cf8" fontSize="10" fontWeight="bold">
          PICKUP
        </text>

        {/* Destination point marker */}
        <circle cx={destX} cy={destY} r="8" fill="#ef4444" stroke="#070a13" strokeWidth="2" />
        <text x={destX + 12} y={destY + 4} fill="#ef4444" fontSize="10" fontWeight="bold">
          DESTINATION
        </text>

        {/* Driver vehicle pointer */}
        <g transform={`translate(${driverX - 10}, ${driverY - 10})`}>
          <circle cx="10" cy="10" r="10" fill="#00e5ff" stroke="#070a13" strokeWidth="2">
            <animate
              attributeName="r"
              values="8;13;8"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="1;0.4;1"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          {/* Inner point representation */}
          <circle cx="10" cy="10" r="4" fill="#070a13" />
        </g>
        <text x={driverX + 14} y={driverY + 4} fill="#00e5ff" fontSize="10" fontWeight="bold">
          COURIER {driverLocation?.speed ? `(${driverLocation.speed} km/h)` : ''}
        </text>
      </svg>

      {/* Floating coordinates dashboard */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          zIndex: 2,
          backgroundColor: 'rgba(15, 20, 36, 0.85)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 2,
          p: 2,
          pointerEvents: 'none'
        }}
      >
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
          GPS Satellite Telemetry
        </Typography>
        <Typography variant="body2" sx={{ color: '#00e5ff', fontFamily: 'monospace', mt: 0.5 }}>
          LAT: {driverLat.toFixed(6)}
        </Typography>
        <Typography variant="body2" sx={{ color: '#00e5ff', fontFamily: 'monospace' }}>
          LNG: {driverLng.toFixed(6)}
        </Typography>
        {driverLocation?.speed !== undefined && (
          <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 700, mt: 0.5, display: 'block' }}>
            SPEED: {driverLocation.speed} KM/H
          </Typography>
        )}
      </Box>

      {/* Live radar sweep animation overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          backgroundColor: 'rgba(15, 20, 36, 0.6)',
          borderRadius: 20,
          px: 1.5,
          py: 0.5
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: '#00e5ff',
            boxShadow: '0 0 8px #00e5ff',
            animation: 'pulse 1.5s infinite'
          }}
        />
        <Typography variant="caption" sx={{ fontWeight: 700, color: '#f3f4f6', letterSpacing: '0.05em' }}>
          LIVE FEED
        </Typography>
      </Box>

      <style>{`
        @keyframes pulse {
          0% { opacity: 0.3; }
          50% { opacity: 1; }
          100% { opacity: 0.3; }
        }
      `}</style>
    </Box>
  );
};

export default LiveMap;
export { LiveMap };
