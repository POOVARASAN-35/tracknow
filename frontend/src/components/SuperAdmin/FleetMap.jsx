import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  IconButton,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Tooltip,
  Zoom
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle';
import ExploreIcon from '@mui/icons-material/Explore';
import RefreshIcon from '@mui/icons-material/Refresh';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const FleetMap = ({
  deliveries = [],
  drivers = [],
  themeMode = 'light',
  onRefresh
}) => {
  const mapRef = useRef(null);
  const [zoom, setZoom] = useState(13);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('all');

  // Check Google Maps API Key
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const isKeyValid = apiKey && apiKey !== 'your_google_maps_api_key_placeholder';

  // Load Google Maps API Script
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: isKeyValid ? apiKey : '',
    id: 'google-map-script'
  });

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 1, 20));
    if (mapRef.current) mapRef.current.setZoom(zoom + 1);
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 1, 1));
    if (mapRef.current) mapRef.current.setZoom(zoom - 1);
  };

  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.panTo({ lat: 12.9716, lng: 77.5946 }); // Default Bengaluru Center
    }
  };

  // Find active deliveries coordinates to show on map
  const activeRoutes = deliveries.filter(d => 
    ['assigned', 'accepted', 'picked_up', 'in_transit'].includes(d.status)
  );

  // Map coordinate center logic
  const centerCoords = { lat: 12.9716, lng: 77.5946 };

  // Filter deliveries based on query and selection
  const filteredActiveRuns = activeRoutes.filter(run => {
    const driverName = run.assignedDriver?.name || 'Unassigned';
    const matchSearch = run.trackingId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        driverName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDriver = selectedDriverId === 'all' || run.assignedDriver?._id === selectedDriverId;
    return matchSearch && matchDriver;
  });

  // Normalize coordinates for relative SVG plotting
  const minLng = 77.5500;
  const maxLng = 77.6800;
  const minLat = 12.9300;
  const maxLat = 13.0200;

  const getSvgX = (lng) => {
    const factor = (lng - minLng) / (maxLng - minLng);
    return 50 + factor * 400;
  };

  const getSvgY = (lat) => {
    const factor = (lat - minLat) / (maxLat - minLat);
    return 450 - factor * 400; // Inverted
  };

  const darkMapStyle = [
    { elementType: 'geometry', stylers: [{ color: '#1f2937' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#9ca3af' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#374151' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#111827' }] }
  ];

  return (
    <Card sx={{ borderRadius: '16px', border: themeMode === 'light' ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.08)', bgcolor: themeMode === 'light' ? '#FFFFFF' : '#1E293B', overflow: 'hidden' }}>
      <CardContent sx={{ p: 2.5 }}>
        
        {/* MAP FILTERS PANEL */}
        <Grid container spacing={2} sx={{ mb: 2.5 }} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              size="small"
              placeholder="Search ID, Courier..."
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              size="small"
              label="Track Agent"
              fullWidth
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
            >
              <MenuItem value="all">Track All Fleet</MenuItem>
              {drivers.map(drv => (
                <MenuItem key={drv.user?._id} value={drv.user?._id}>
                  {drv.user?.name} ({drv.status})
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4} display="flex" gap={1.5}>
            <IconButton onClick={onRefresh} sx={{ bgcolor: themeMode === 'light' ? '#F1F5F9' : '#334155' }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, my: 'auto' }}>
              Updating live telemetry coordinates every 5s
            </Typography>
          </Grid>
        </Grid>

        {/* MAP DRAW CONTAINER */}
        <Box sx={{ height: 420, width: '100%', position: 'relative', borderRadius: '12px', overflow: 'hidden', border: themeMode === 'light' ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.06)' }}>
          {isKeyValid && isLoaded ? (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={centerCoords}
              zoom={zoom}
              onLoad={(map) => { mapRef.current = map; }}
              options={{
                disableDefaultUI: true,
                styles: themeMode === 'dark' ? darkMapStyle : []
              }}
            >
              {filteredActiveRuns.map((run, idx) => {
                const [pLng, pLat] = run.pickupAddress?.coordinates || [77.5946, 12.9716];
                const [dLng, dLat] = run.deliveryAddress?.coordinates || [77.6412, 12.9784];
                return (
                  <React.Fragment key={idx}>
                    <Marker position={{ lat: pLat, lng: pLng }} label="P" />
                    <Marker position={{ lat: dLat, lng: dLng }} label="D" />
                  </React.Fragment>
                );
              })}
            </GoogleMap>
          ) : (
            /* FALLBACK SVG radar mapping simulation grid */
            <Box sx={{ width: '100%', height: '100%', bgcolor: themeMode === 'light' ? '#F8FAFC' : '#0F172A' }}>
              <svg width="100%" height="100%" viewBox="0 0 500 500" style={{ pointerEvents: 'none' }}>
                <defs>
                  <pattern id="fleetGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke={themeMode === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.03)'} strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#fleetGrid)" />

                {/* Draw mock tracking coordinates */}
                {filteredActiveRuns.map((run, idx) => {
                  const [pLng, pLat] = run.pickupAddress?.coordinates || [77.5946, 12.9716];
                  const [dLng, dLat] = run.deliveryAddress?.coordinates || [77.6412, 12.9784];
                  const pickupX = getSvgX(pLng);
                  const pickupY = getSvgY(pLat);
                  const destX = getSvgX(dLng);
                  const destY = getSvgY(dLat);

                  return (
                    <g key={idx}>
                      {/* Connection Route Polyline */}
                      <line x1={pickupX} y1={pickupY} x2={destX} y2={destY} stroke="rgba(37,99,235,0.4)" strokeWidth="3" strokeDasharray="5,4" />
                      
                      {/* Pickup marker */}
                      <circle cx={pickupX} cy={pickupY} r="7" fill="#10B981" />
                      
                      {/* Destination marker */}
                      <circle cx={destX} cy={destY} r="7" fill="#EF4444" />

                      {/* Moving driver vehicle marker pulse */}
                      <g transform={`translate(${pickupX + (destX - pickupX) * 0.45}, ${pickupY + (destY - pickupY) * 0.45})`}>
                        <circle cx="0" cy="0" r="10" fill="rgba(37,99,235,0.2)" stroke="#2563EB" strokeWidth="1">
                          <animate attributeName="r" values="8;16;8" dur="2s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="0" cy="0" r="5" fill="#2563EB" />
                      </g>
                    </g>
                  );
                })}
              </svg>

              {/* Float radar feed overlay */}
              <Box sx={{ position: 'absolute', top: 16, left: 16, bgcolor: themeMode === 'light' ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.85)', px: 2, py: 0.5, borderRadius: 20, display: 'flex', gap: 1, alignItems: 'center', border: `1px solid ${themeMode === 'light' ? '#E2E8F0' : 'rgba(255,255,255,0.08)'}` }}>
                <Box sx={{ width: 8, height: 8, bgcolor: '#10B981', borderRadius: '50%', boxShadow: '0 0 8px #10B981', animation: 'fleetPulse 2s infinite' }} />
                <Typography variant="caption" sx={{ fontWeight: 800 }}>LIVE CONTROL RADAR FEED</Typography>
              </Box>
            </Box>
          )}

          {/* FLOATING ZOOM AND MAP CONTROLS */}
          <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Tooltip title="Zoom In" placement="left" TransitionComponent={Zoom}>
              <IconButton onClick={handleZoomIn} sx={{ bgcolor: themeMode === 'light' ? '#FFF' : '#1E293B', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <ZoomInIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Zoom Out" placement="left" TransitionComponent={Zoom}>
              <IconButton onClick={handleZoomOut} sx={{ bgcolor: themeMode === 'light' ? '#FFF' : '#1E293B', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <ZoomOutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Recenter Base" placement="left" TransitionComponent={Zoom}>
              <IconButton onClick={handleRecenter} sx={{ bgcolor: themeMode === 'light' ? '#FFF' : '#1E293B', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <MyLocationIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

      </CardContent>

      <style>{`
        @keyframes fleetPulse {
          0% { opacity: 0.3; }
          50% { opacity: 1; }
          100% { opacity: 0.3; }
        }
      `}</style>
    </Card>
  );
};

export default FleetMap;
export { FleetMap };
