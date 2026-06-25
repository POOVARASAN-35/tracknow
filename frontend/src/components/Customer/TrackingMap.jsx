import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Grid, Typography, Avatar, Divider, Chip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SpeedIcon from '@mui/icons-material/Speed';
import TimerIcon from '@mui/icons-material/Timer';
import RouteIcon from '@mui/icons-material/Route';
import LiveMap from '../Map/LiveMap';
import { io } from 'socket.io-client';

const TrackingMap = ({ activeDelivery, currentThemeMode = 'dark' }) => {
  const [liveLocation, setLiveLocation] = useState(null);

  useEffect(() => {
    if (!activeDelivery) return;
    if (activeDelivery.liveLocation) {
      setLiveLocation(activeDelivery.liveLocation);
    }

    const socket = io(window.location.origin, {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      socket.emit('join_delivery_room', activeDelivery._id || activeDelivery.id);
    });

    socket.on('location_update', (telemetry) => {
      setLiveLocation(telemetry);
    });

    return () => {
      socket.emit('leave_delivery_room', activeDelivery._id || activeDelivery.id);
      socket.disconnect();
    };
  }, [activeDelivery]);

  if (!activeDelivery) {
    return (
      <Card sx={{ 
        height: '400px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        bgcolor: currentThemeMode === 'light' ? '#fff' : '#0f1424',
        border: `1px solid ${currentThemeMode === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.06)'}`
      }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Select an active delivery to track live shipment status.
        </Typography>
      </Card>
    );
  }

  const pickupCoords = activeDelivery.pickupAddress?.coordinates || [77.5946, 12.9716];
  const destCoords = activeDelivery.deliveryAddress?.coordinates || [77.6412, 12.9784];

  // Mock details if not fully present in schema
  const driverName = activeDelivery.assignedDriver?.name || 'Awaiting Assignment';
  const vehicleNo = activeDelivery.vehicleNumber || 'KA-01-MJ-5432';
  const speed = liveLocation?.speed !== undefined ? `${liveLocation.speed} km/h` : '0 km/h';
  const distanceRemaining = activeDelivery.route?.distance ? `${activeDelivery.route.distance} km` : '12.4 km';
  const eta = activeDelivery.eta ? new Date(activeDelivery.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Calculating...';

  return (
    <Card sx={{ 
      overflow: 'hidden', 
      bgcolor: currentThemeMode === 'light' ? '#fff' : '#0f1424',
      border: `1px solid ${currentThemeMode === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.06)'}`
    }}>
      <Box sx={{ height: 350, position: 'relative' }}>
        <LiveMap 
          pickup={pickupCoords}
          destination={destCoords}
          driverLocation={liveLocation}
          polyline={activeDelivery.route?.polyline}
        />
      </Box>
      <Divider />
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Driver details */}
          <Grid item xs={12} sm={6} md={3} display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: '#2563EB', width: 44, height: 44 }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                Courier Driver
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {driverName}
              </Typography>
            </Box>
          </Grid>

          {/* Vehicle Number */}
          <Grid item xs={12} sm={6} md={2.25} display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: '#1E40AF', width: 44, height: 44 }}>
              <LocalShippingIcon />
            </Avatar>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                Vehicle Number
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {vehicleNo}
              </Typography>
            </Box>
          </Grid>

          {/* Current Speed */}
          <Grid item xs={6} sm={4} md={2.25} display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: '#10B981', width: 44, height: 44 }}>
              <SpeedIcon />
            </Avatar>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                Current Speed
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#10B981' }}>
                {speed}
              </Typography>
            </Box>
          </Grid>

          {/* Distance remaining */}
          <Grid item xs={6} sm={4} md={2.25} display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: '#F59E0B', width: 44, height: 44 }}>
              <RouteIcon />
            </Avatar>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                Distance Left
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {distanceRemaining}
              </Typography>
            </Box>
          </Grid>

          {/* ETA */}
          <Grid item xs={12} sm={4} md={2.25} display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: '#EF4444', width: 44, height: 44 }}>
              <TimerIcon />
            </Avatar>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                Estimated ETA
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#EF4444' }}>
                {eta}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default TrackingMap;
