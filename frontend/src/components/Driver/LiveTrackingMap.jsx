import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, IconButton, Tooltip, Zoom } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import RefreshIcon from '@mui/icons-material/Refresh';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import DirectionsIcon from '@mui/icons-material/Directions';
import { GoogleMap, Marker, Polyline, useJsApiLoader } from '@react-google-maps/api';

const LiveTrackingMap = ({
  pickup, // [lng, lat]
  destination, // [lng, lat]
  driverLocation, // { longitude, latitude, speed }
  polyline, // Encoded polyline string
  themeMode = 'light',
  onRefresh
}) => {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  
  const [zoom, setZoom] = useState(14);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [googleLoadError, setGoogleLoadError] = useState(false);

  // Check Google Maps API Key
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const isKeyValid = apiKey && apiKey !== 'your_google_maps_api_key_placeholder';

  // Load Google Maps API Script
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: isKeyValid ? apiKey : '',
    id: 'google-map-script'
  });

  const [pLng, pLat] = pickup || [77.5946, 12.9716];
  const [dLng, dLat] = destination || [77.6412, 12.9784];
  const driverLng = driverLocation?.longitude || pLng;
  const driverLat = driverLocation?.latitude || pLat;

  // Sync zoom control with map object
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 1, 20));
    if (mapRef.current) {
      mapRef.current.setZoom(zoom + 1);
    }
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 1, 1));
    if (mapRef.current) {
      mapRef.current.setZoom(zoom - 1);
    }
  };

  // Center on Driver / Current Location
  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.panTo({ lat: driverLat, lng: driverLng });
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Standard Maps Style themes
  const darkMapStyle = [
    { elementType: 'geometry', stylers: [{ color: '#1f2937' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#111827' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#9ca3af' }] },
    { featureType: 'administrative', elementType: 'labels.text.fill', stylers: [{ color: '#e5e7eb' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#374151' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#111827' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca3af' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#111827' }] }
  ];

  // SVG Coordinates Normalization (For High-Fidelity simulated SVG grid map)
  const minLng = Math.min(pLng, dLng, driverLng) - 0.008;
  const maxLng = Math.max(pLng, dLng, driverLng) + 0.008;
  const minLat = Math.min(pLat, dLat, driverLat) - 0.008;
  const maxLat = Math.max(pLat, dLat, driverLat) + 0.008;

  const getSvgX = (lng) => {
    if (maxLng === minLng) return 250;
    const padding = 60;
    const factor = (lng - minLng) / (maxLng - minLng);
    return padding + factor * (500 - 2 * padding);
  };

  const getSvgY = (lat) => {
    if (maxLat === minLat) return 250;
    const padding = 60;
    const factor = (lat - minLat) / (maxLat - minLat);
    // SVG y-axis is inverted: top is 0, bottom is height
    return 500 - (padding + factor * (500 - 2 * padding));
  };

  const pX = getSvgX(pLng);
  const pY = getSvgY(pLat);
  const dX = getSvgX(dLng);
  const dY = getSvgY(dLat);
  const drX = getSvgX(driverLng);
  const drY = getSvgY(driverLat);

  // Decode points if polyline is passed for high fidelity SVG polyline drawing
  const decodePolyline = (str) => {
    if (!str) return [];
    let index = 0, len = str.length;
    let lat = 0, lng = 0;
    const coordinates = [];
    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = str.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;
      shift = 0;
      result = 0;
      do {
        b = str.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;
      coordinates.push({ latitude: lat / 1E5, longitude: lng / 1E5 });
    }
    return coordinates;
  };

  const decodedPoints = decodePolyline(polyline);
  const svgPolylinePoints = decodedPoints.length > 0 
    ? decodedPoints.map(p => `${getSvgX(p.longitude)},${getSvgY(p.latitude)}`).join(' ') 
    : `${pX},${pY} ${drX},${drY} ${dX},${dY}`;

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        borderRadius: isFullscreen ? 0 : '16px',
        overflow: 'hidden',
        border: themeMode === 'light' ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        bgcolor: themeMode === 'light' ? '#FFFFFF' : '#0F172A'
      }}
    >
      {/* GOOGLE MAP CANVAS */}
      {isKeyValid && isLoaded && !googleLoadError ? (
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={{ lat: driverLat, lng: driverLng }}
          zoom={zoom}
          onLoad={(map) => { mapRef.current = map; }}
          options={{
            disableDefaultUI: true,
            styles: themeMode === 'dark' ? darkMapStyle : []
          }}
        >
          {/* Pickup Marker */}
          <Marker
            position={{ lat: pLat, lng: pLng }}
            label={{ text: 'P', color: '#FFF', fontWeight: 'bold' }}
            icon="https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
          />

          {/* Destination Marker */}
          <Marker
            position={{ lat: dLat, lng: dLng }}
            label={{ text: 'D', color: '#FFF', fontWeight: 'bold' }}
            icon="https://maps.google.com/mapfiles/ms/icons/red-dot.png"
          />

          {/* Driver Location Marker */}
          <Marker
            position={{ lat: driverLat, lng: driverLng }}
            icon={{
              path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
              scale: 8,
              fillColor: '#2563EB',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2
            }}
          />

          {/* Polyline Route Path */}
          {polyline && (
            <Polyline
              path={decodedPoints.map(p => ({ lat: p.latitude, lng: p.longitude }))}
              options={{
                strokeColor: '#2563EB',
                strokeOpacity: 0.8,
                strokeWeight: 4
              }}
            />
          )}
        </GoogleMap>
      ) : (
        /* FALLBACK HIGH-FIDELITY VECTOR SVG TELEMETRY MAP */
        <Box sx={{ width: '100%', height: '100%', bgcolor: themeMode === 'light' ? '#F8FAFC' : '#0F172A', position: 'relative' }}>
          <svg width="100%" height="100%" viewBox="0 0 500 500" style={{ pointerEvents: 'none' }}>
            <defs>
              <pattern id="radarGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path
                  d="M 30 0 L 0 0 0 30"
                  fill="none"
                  stroke={themeMode === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.03)'}
                  strokeWidth="1"
                />
              </pattern>
              <radialGradient id="aurora" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
              </radialGradient>
            </defs>
            
            {/* Background pattern grid */}
            <rect width="100%" height="100%" fill="url(#radarGrid)" />

            {/* Glowing Aurora pulse from courier driver location */}
            <circle cx={drX} cy={drY} r="160" fill="url(#aurora)" />

            {/* Optimized Route Polyline (dashed & solid) */}
            <polyline
              points={svgPolylinePoints}
              fill="none"
              stroke={themeMode === 'light' ? 'rgba(37, 99, 235, 0.3)' : 'rgba(37, 99, 235, 0.2)'}
              strokeWidth="4"
              strokeDasharray="6,4"
            />
            <polyline
              points={`${pX},${pY} ${drX},${drY}`}
              fill="none"
              stroke="#2563EB"
              strokeWidth="4"
            />

            {/* Pickup Marker */}
            <g transform={`translate(${pX}, ${pY})`}>
              <circle cx="0" cy="0" r="10" fill="#10B981" stroke="#FFFFFF" strokeWidth="2.5" />
              <circle cx="0" cy="0" r="3" fill="#FFFFFF" />
              <text x="14" y="4" fill="#10B981" fontSize="10" fontWeight="900" letterSpacing="0.05em">
                PICKUP address
              </text>
            </g>

            {/* Destination Marker */}
            <g transform={`translate(${dX}, ${dY})`}>
              <circle cx="0" cy="0" r="10" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2.5" />
              <polygon points="-4,-4 4,-4 0,5" fill="#FFFFFF" />
              <text x="14" y="4" fill="#EF4444" fontSize="10" fontWeight="900" letterSpacing="0.05em">
                DROP address
              </text>
            </g>

            {/* Courier driver vehicle marker (Animated vehicle icon pointer) */}
            <g transform={`translate(${drX}, ${drY})`}>
              <circle cx="0" cy="0" r="14" fill="rgba(37, 99, 235, 0.2)" stroke="#2563EB" strokeWidth="1.5">
                <animate attributeName="r" values="10;22;10" dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.2;1" dur="2.5s" repeatCount="indefinite" />
              </circle>
              <circle cx="0" cy="0" r="8" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="0" cy="0" r="3" fill="#FFFFFF" />
              <text x="14" y="4" fill="#2563EB" fontSize="10" fontWeight="900" letterSpacing="0.05em">
                VEHICLE PULSE {driverLocation?.speed ? `(${driverLocation.speed} km/h)` : ''}
              </text>
            </g>

          </svg>
        </Box>
      )}

      {/* TOP FLOATING RADAR STATUS OVERLAY */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 10,
          bgcolor: themeMode === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(8px)',
          border: `1px solid ${themeMode === 'light' ? '#E2E8F0' : 'rgba(255, 255, 255, 0.08)'}`,
          px: 2,
          py: 0.75,
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: driverLocation?.speed > 0 ? '#10B981' : '#2563EB',
            boxShadow: `0 0 10px ${driverLocation?.speed > 0 ? '#10B981' : '#2563EB'}`,
            animation: 'gpsPulse 1.5s infinite'
          }}
        />
        <Typography variant="caption" sx={{ fontWeight: 800, color: themeMode === 'light' ? '#1E293B' : '#FFFFFF', letterSpacing: '0.05em' }}>
          {driverLocation?.speed > 0 ? 'TELEMETRY TRANSIT ACTIVE' : 'LIVE GPS CONNECTED'}
        </Typography>
      </Box>

      {/* RIGHT SIDE FLOATING CONTROLS PANEL */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        <Tooltip title="Zoom In" placement="left" TransitionComponent={Zoom}>
          <IconButton
            onClick={handleZoomIn}
            sx={{
              bgcolor: themeMode === 'light' ? '#FFFFFF' : '#1E293B',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              border: `1px solid ${themeMode === 'light' ? '#E2E8F0' : 'rgba(255, 255, 255, 0.08)'}`,
              color: themeMode === 'light' ? '#1E293B' : '#FFFFFF',
              '&:hover': { bgcolor: themeMode === 'light' ? '#F1F5F9' : '#334155' }
            }}
          >
            <ZoomInIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Zoom Out" placement="left" TransitionComponent={Zoom}>
          <IconButton
            onClick={handleZoomOut}
            sx={{
              bgcolor: themeMode === 'light' ? '#FFFFFF' : '#1E293B',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              border: `1px solid ${themeMode === 'light' ? '#E2E8F0' : 'rgba(255, 255, 255, 0.08)'}`,
              color: themeMode === 'light' ? '#1E293B' : '#FFFFFF',
              '&:hover': { bgcolor: themeMode === 'light' ? '#F1F5F9' : '#334155' }
            }}
          >
            <ZoomOutIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Center Location" placement="left" TransitionComponent={Zoom}>
          <IconButton
            onClick={handleRecenter}
            sx={{
              bgcolor: themeMode === 'light' ? '#FFFFFF' : '#1E293B',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              border: `1px solid ${themeMode === 'light' ? '#E2E8F0' : 'rgba(255, 255, 255, 0.08)'}`,
              color: '#2563EB',
              '&:hover': { bgcolor: themeMode === 'light' ? '#F1F5F9' : '#334155' }
            }}
          >
            <MyLocationIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Recalculate Route" placement="left" TransitionComponent={Zoom}>
          <IconButton
            onClick={onRefresh}
            sx={{
              bgcolor: themeMode === 'light' ? '#FFFFFF' : '#1E293B',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              border: `1px solid ${themeMode === 'light' ? '#E2E8F0' : 'rgba(255, 255, 255, 0.08)'}`,
              color: themeMode === 'light' ? '#1E293B' : '#FFFFFF',
              '&:hover': { bgcolor: themeMode === 'light' ? '#F1F5F9' : '#334155' }
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Map"} placement="left" TransitionComponent={Zoom}>
          <IconButton
            onClick={toggleFullscreen}
            sx={{
              bgcolor: themeMode === 'light' ? '#FFFFFF' : '#1E293B',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              border: `1px solid ${themeMode === 'light' ? '#E2E8F0' : 'rgba(255, 255, 255, 0.08)'}`,
              color: themeMode === 'light' ? '#1E293B' : '#FFFFFF',
              '&:hover': { bgcolor: themeMode === 'light' ? '#F1F5F9' : '#334155' }
            }}
          >
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* FLOATING GPS ACCURACY AND SATELLITE DETAILS PANEL */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          zIndex: 10,
          bgcolor: themeMode === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${themeMode === 'light' ? '#E2E8F0' : 'rgba(255, 255, 255, 0.08)'}`,
          p: 1.5,
          borderRadius: 3,
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          pointerEvents: 'none',
          minWidth: 160
        }}
      >
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', fontSize: '0.65rem' }}>
          GPS SAT TELEMETRY
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#2563EB', fontSize: '0.75rem', mt: 0.5 }}>
          LAT: {driverLat.toFixed(6)}
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#2563EB', fontSize: '0.75rem' }}>
          LNG: {driverLng.toFixed(6)}
        </Typography>
        <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 800, mt: 0.5, display: 'block', fontSize: '0.65rem' }}>
          SPEED: {driverLocation?.speed !== undefined ? `${driverLocation.speed} KM/H` : '0 KM/H'}
        </Typography>
      </Box>

      {/* Global CSS animations */}
      <style>{`
        @keyframes gpsPulse {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }
      `}</style>
    </Box>
  );
};

export default LiveTrackingMap;
