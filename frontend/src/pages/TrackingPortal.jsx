import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Paper,
  Divider
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LiveMap from '../components/Map/LiveMap';

const TrackingPortal = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const trackingIdParam = searchParams.get('id') || '';

  const [trackingId, setTrackingId] = useState(trackingIdParam);
  const [delivery, setDelivery] = useState(null);
  const [liveLocation, setLiveLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);

  const fetchTracking = async (searchId) => {
    if (!searchId) return;
    setLoading(true);
    setError('');
    setDelivery(null);
    setLiveLocation(null);

    try {
      const res = await axios.get(`/api/customer/track/${searchId}`);
      if (res.data.success) {
        setDelivery(res.data.data);
        if (res.data.data.liveLocation) {
          setLiveLocation(res.data.data.liveLocation);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Shipment not found. Please verify tracking ID.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trackingIdParam) {
      fetchTracking(trackingIdParam);
    }
  }, [trackingIdParam]);

  // Connect to the delivery namespace socket room for real-time telemetry updates
  useEffect(() => {
    if (!delivery) return;

    // Connect to local websocket client
    const newSocket = io(import.meta.env.VITE_SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Public socket tracking channel connected');
      newSocket.emit('join_delivery_room', delivery.id);
    });

    newSocket.on('location_update', (telemetry) => {
      console.log('Telemetry received:', telemetry);
      setLiveLocation(telemetry);
    });

    newSocket.on('status_updated', (update) => {
      setDelivery((prev) => prev ? {
        ...prev,
        status: update.status,
        timeline: update.timeline,
        eta: update.eta
      } : null);
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leave_delivery_room', delivery.id);
      newSocket.disconnect();
    };
  }, [delivery?.id]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    setSearchParams({ id: trackingId.trim() });
  };

  // Stepper steps configuration
  const steps = ['Order Created', 'Assigned', 'Picked Up', 'In Transit', 'Delivered'];
  const getActiveStep = (status) => {
    switch (status) {
      case 'pending': return 0;
      case 'assigned': return 1;
      case 'picked_up': return 2;
      case 'in_transit': return 3;
      case 'delivered': return 5; // Finish
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  return (
    <Box
      minHeight="100vh"
      sx={{
        backgroundColor: '#070a13',
        pb: 6,
        px: 2,
        pt: 4
      }}
    >
      <Box maxWidth="lg" mx="auto">
        {/* Navigation back option */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Button
            component={Link}
            to="/login"
            startIcon={<ArrowBackIcon />}
            sx={{ color: 'text.secondary', fontWeight: 600 }}
          >
            Portal Login
          </Button>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(90deg, #00e5ff 0%, #6366f1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            TrackNow System
          </Typography>
        </Box>

        {/* Tracking Search Card */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Search Consignment
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              Enter your tracking identifier to trace package status and live ETA details.
            </Typography>
            <Box component="form" onSubmit={handleSearchSubmit} display="flex" gap={2}>
              <TextField
                fullWidth
                label="Tracking ID (e.g. TRK-XXXXXXXX)"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="TRK-12345678"
                required
              />
              <Button type="submit" variant="contained" size="large" sx={{ px: 4 }}>
                Track
              </Button>
            </Box>
          </CardContent>
        </Card>

        {loading && (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress color="primary" />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {delivery && (
          <Grid container spacing={4}>
            {/* Left Column: Shipment Status details */}
            <Grid item xs={12} md={5}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                    Delivery Timeline
                  </Typography>

                  {delivery.status === 'cancelled' ? (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      This shipment order has been cancelled.
                    </Alert>
                  ) : (
                    <Box sx={{ mb: 4 }}>
                      <Stepper activeStep={getActiveStep(delivery.status)} orientation="vertical">
                        {steps.map((label, index) => (
                          <Step key={label}>
                            <StepLabel>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{label}</Typography>
                            </StepLabel>
                          </Step>
                        ))}
                      </Stepper>
                    </Box>
                  )}

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                    Shipment Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Courier Driver</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {delivery.assignedDriver?.name || 'Awaiting Assignment'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Estimated ETA</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                        {delivery.eta ? new Date(delivery.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Calculating...'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Destination Address</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {delivery.deliveryAddress.text}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                    Status History
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    {delivery.timeline.map((log, idx) => (
                      <Box key={idx} display="flex" justifyContent="space-between">
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {log.status.replace('_', ' ').toUpperCase()}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {log.comment}
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Right Column: Google Maps live vehicle tracking */}
            <Grid item xs={12} md={7}>
              <Card sx={{ height: 500 }}>
                <CardContent sx={{ p: 0, height: '100%', position: 'relative' }}>
                  <LiveMap
                    pickup={delivery.pickupAddress.coordinates}
                    destination={delivery.deliveryAddress.coordinates}
                    driverLocation={liveLocation}
                    polyline={delivery.route?.polyline}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default TrackingPortal;
export { TrackingPortal };
