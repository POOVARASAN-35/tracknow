import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Typography, Alert } from '@mui/material';

const GeofenceEditor = ({ onSaveCoordinates }) => {
  const [points, setPoints] = useState([]);
  const canvasRef = useRef(null);

  // Default coordinate center (Bengaluru)
  const baseLng = 77.5946;
  const baseLat = 12.9716;

  // Convert SVG/Canvas click points to actual GPS coordinates
  // Canvas width: 500, height: 400
  // Each pixel translates to offset from base coordinates
  const convertPixelToGPS = (x, y) => {
    const lngOffset = (x - 250) * 0.0002;
    const latOffset = (200 - y) * 0.0002; // inverted y axis
    return [+(baseLng + lngOffset).toFixed(6), +(baseLat + latOffset).toFixed(6)];
  };

  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking near the first point to close the polygon
    if (points.length >= 3) {
      const firstPoint = points[0];
      const distance = Math.hypot(x - firstPoint.x, y - firstPoint.y);
      if (distance < 12) {
        // Close polygon - trigger saving sequence
        handleSave();
        return;
      }
    }

    setPoints([...points, { x, y }]);
  };

  const handleClear = () => {
    setPoints([]);
  };

  const handleSave = () => {
    if (points.length < 3) {
      alert('A polygon boundary must have at least 3 vertices!');
      return;
    }

    // Convert all points to coordinates
    const gpsPoints = points.map((p) => convertPixelToGPS(p.x, p.y));
    
    // Close the GeoJSON Polygon: first point must equal last point
    gpsPoints.push([...gpsPoints[0]]);

    // GeoJSON Polygon coordinate format is [[[lng, lat], [lng, lat], ...]]
    onSaveCoordinates([gpsPoints]);
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2} height="100%">
      <Alert severity="info" sx={{ width: '100%' }}>
        Click inside the radar grid below to plot geofence boundaries. Click the first point (highlighted green) to complete and save.
      </Alert>

      <Box
        ref={canvasRef}
        onClick={handleCanvasClick}
        sx={{
          width: '100%',
          maxWidth: 500,
          height: 350,
          backgroundColor: '#0c101d',
          border: '2px solid rgba(0, 229, 255, 0.2)',
          borderRadius: 3,
          position: 'relative',
          cursor: 'crosshair',
          overflow: 'hidden'
        }}
      >
        {/* Render grid vector */}
        <svg width="100%" height="100%" style={{ pointerEvents: 'none' }}>
          <defs>
            <pattern id="editorGrid" width="25" height="25" patternUnits="userSpaceOnUse">
              <path d="M 25 0 L 0 0 0 25" fill="none" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#editorGrid)" />

          {/* Renders line loops */}
          {points.length > 1 && (
            <path
              d={`M ${points.map((p) => `${p.x} ${p.y}`).join(' L ')} ${points.length >= 3 ? 'Z' : ''}`}
              fill="rgba(0, 229, 255, 0.04)"
              stroke="#00e5ff"
              strokeWidth="2.5"
            />
          )}

          {/* Render point nodes */}
          {points.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r={idx === 0 ? 6 : 4}
              fill={idx === 0 ? '#10b981' : '#6366f1'}
              stroke="#070a13"
              strokeWidth="1.5"
            />
          ))}
        </svg>

        {points.length === 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              opacity: 0.3
            }}
          >
            <Typography variant="body2" sx={{ textAlign: 'center' }}>
              Click to plot first vertex
            </Typography>
          </Box>
        )}
      </Box>

      <Box display="flex" gap={2} width="100%" justifyContent="center">
        <Button variant="outlined" color="inherit" onClick={handleClear} disabled={points.length === 0}>
          Clear Points
        </Button>
        <Button variant="contained" color="primary" onClick={handleSave} disabled={points.length < 3}>
          Save Geofence Coordinates
        </Button>
      </Box>
    </Box>
  );
};

export default GeofenceEditor;
export { GeofenceEditor };
