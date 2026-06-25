import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { ThemeProvider } from '@mui/material/styles';
import { getTheme } from '../theme';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  IconButton,
  Alert,
  Tooltip,
  Divider
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import {
  fetchDeliveries,
  updateDeliveryStatus
} from '../store/slices/deliverySlice';
import {
  fetchDriverProfile,
  updateMyProfile,
  uploadMyDocuments
} from '../store/slices/driverSlice';

// Icons
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import StarRateIcon from '@mui/icons-material/StarRate';
import WarningIcon from '@mui/icons-material/Warning';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import SignalCellularConnectedNoInternet4BarIcon from '@mui/icons-material/SignalCellularConnectedNoInternet4Bar';
import SyncIcon from '@mui/icons-material/Sync';
import SecurityIcon from '@mui/icons-material/Security';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import CarRepairIcon from '@mui/icons-material/CarRepair';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import HelpIcon from '@mui/icons-material/Help';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CloseIcon from '@mui/icons-material/Close';

// Import Custom Reusable Driver Components
import DriverLayout from '../components/Driver/DriverLayout';
import LiveTrackingMap from '../components/Driver/LiveTrackingMap';
import ActiveDeliveryCard from '../components/Driver/ActiveDeliveryCard';
import DeliveryTimeline from '../components/Driver/DeliveryTimeline';
import DeliveryTable from '../components/Driver/DeliveryTable';
import PerformanceChart from '../components/Driver/PerformanceChart';
import NotificationPanel from '../components/Driver/NotificationPanel';
import RejectDeliveryModal from '../components/Driver/RejectDeliveryModal';
import CancelDeliveryModal from '../components/Driver/CancelDeliveryModal';
import DriverProfile from './DriverProfile';
import SettingsPage from '../components/Driver/SettingsPage';

const DriverDashboard = () => {
  const dispatch = useDispatch();
  const socket = useSocket();

  // Redux Selectors
  const { user, accessToken } = useSelector((state) => state.auth);
  const { profile } = useSelector((state) => state.drivers);
  const { deliveries } = useSelector((state) => state.deliveries);

  // Canvas drawing references & state
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSigName('');
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const response = await axios.post('/api/upload', {
          image: reader.result
        }, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (type === 'delivery') {
          setPhotoUrl(response.data.url);
        } else if (type === 'package') {
          setPackagePhotoUrl(response.data.url);
        }
      } catch (err) {
        alert('Image upload failed: ' + (err.response?.data?.message || err.message));
      }
    };
    reader.readAsDataURL(file);
  };

  // Layout & Styling States
  const [currentTab, setCurrentTab] = useState(0);
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('driverThemeMode') || 'light');
  const localTheme = useMemo(() => getTheme(themeMode), [themeMode]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Delivery Assigned', message: 'You have a new shipment TRK-48192 available.', type: 'info', read: false },
    { id: 2, title: 'Route Recalculated', message: 'Admin optimized your shipping polyline route.', type: 'info', read: true }
  ]);

  // Settings states
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    locationPermission: true,
    autoNavigation: true,
    language: 'English'
  });

  // Rejection & Complete Dialogs States
  const [rejectOpen, setRejectOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  
  // Proof of Delivery Input States
  const [sigName, setSigName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [packagePhotoUrl, setPackagePhotoUrl] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');

  // GPS Locations States
  const [gpsLatitude, setGpsLatitude] = useState(12.9716); // Default Bengaluru
  const [gpsLongitude, setGpsLongitude] = useState(77.5946);
  const [gpsSpeed, setGpsSpeed] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [distanceTravelled, setDistanceTravelled] = useState(0.0);

  // Network Offline sync states
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);
  const [syncQueue, setSyncQueue] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('driverSyncQueue')) || [];
    } catch {
      return [];
    }
  });

  // Load basic driver info
  useEffect(() => {
    dispatch(fetchDriverProfile());
    dispatch(fetchDeliveries());
  }, [dispatch]);

  // Socket triggers and indicators
  useEffect(() => {
    if (socket) {
      socket.on('notification', (newNotif) => {
        setNotifications(prev => [
          {
            id: Date.now(),
            title: newNotif.title,
            message: newNotif.message,
            type: newNotif.type || 'info',
            read: false
          },
          ...prev
        ]);
      });
    }
  }, [socket]);

  // Online / Offline monitor
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerSyncQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncQueue]);

  // Save Sync Queue to localStorage when changed
  useEffect(() => {
    localStorage.setItem('driverSyncQueue', JSON.stringify(syncQueue));
  }, [syncQueue]);

  // Toggle Theme mode
  const handleToggleTheme = () => {
    const newTheme = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newTheme);
    localStorage.setItem('driverThemeMode', newTheme);
  };

  // Auto Tick active delivery elapsed time
  useEffect(() => {
    let timer = null;
    const activeDel = activeDelivery;
    if (activeDel && activeDel.status === 'in_transit') {
      timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
        // Simulating minor vehicle movement
        setGpsSpeed(Math.floor(25 + Math.random() * 20));
        setDistanceTravelled(prev => prev + 0.015);
        // Slowly drift coordinates
        setGpsLatitude(prev => prev + 0.00002);
        setGpsLongitude(prev => prev + 0.000025);
      }, 1000);
    } else {
      setGpsSpeed(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [deliveries]);

  // GPS 5s emission interval
  useEffect(() => {
    let interval = null;
    const activeDel = activeDelivery;
    if (activeDel && profile?.status !== 'offline') {
      interval = setInterval(() => {
        const telemetry = {
          latitude: gpsLatitude,
          longitude: gpsLongitude,
          speed: gpsSpeed,
          deliveryId: activeDel._id
        };
        // Emit location telemetry via Websockets
        if (socket && socket.connected) {
          socket.emit('driver:location_update', telemetry);
          console.log('Emitted live coordinates update telemetry:', telemetry);
        }
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [socket, deliveries, gpsLatitude, gpsLongitude, gpsSpeed, profile]);

  // Offline Caching & Sync Queue Logic
  const handleUpdateStatus = (status, payload = {}) => {
    const activeDel = activeDelivery;
    if (!activeDel) return;

    const actionData = {
      deliveryId: activeDel._id,
      status,
      ...payload
    };

    if (!isOnline) {
      // Queue local updates
      setSyncQueue(prev => [...prev, actionData]);
      
      // Optimistically update local deliveries
      const mockDelivery = {
        ...activeDel,
        status,
        ...payload,
        updatedAt: new Date().toISOString()
      };
      
      // Dispatch standard reducer updating in Redux slice locally
      dispatch({
        type: 'deliveries/updateStatus/fulfilled',
        payload: mockDelivery
      });
      return;
    }

    dispatch(updateDeliveryStatus(actionData));
  };

  // Sync queued requests once back online
  const triggerSyncQueue = async () => {
    if (syncQueue.length === 0) return;
    console.log('Restored connection. Syncing queued driver updates:', syncQueue);
    
    for (const action of syncQueue) {
      try {
        await dispatch(updateDeliveryStatus(action)).unwrap();
      } catch (err) {
        console.error('Failed to sync queued status action:', action, err);
      }
    }
    setSyncQueue([]);
  };

  // Online status switch (available, busy, offline)
  const handleToggleOnlineStatus = () => {
    const nextStatus = profile?.status === 'offline' ? 'available' : 'offline';
    dispatch(updateMyProfile({ status: nextStatus }));
  };

  // Unread Count
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Find active delivery
  const activeDelivery = useMemo(() => {
    return deliveries.find(d => ['assigned', 'accepted', 'picked_up', 'in_transit', 'rejection_declined'].includes(d.status)) || null;
  }, [deliveries]);

  // Summary Metrics calculations
  const summaryMetrics = useMemo(() => {
    const assigned = deliveries.filter(d => d.status === 'assigned').length;
    const progress = deliveries.filter(d => ['accepted', 'picked_up', 'in_transit'].includes(d.status)).length;
    const completed = deliveries.filter(d => d.status === 'delivered').length;
    const rating = profile?.rating || 5.0;

    return [
      { label: 'Assigned Deliveries', count: assigned, icon: <AssignmentIcon />, pct: 25, trend: '+2 new today', color: '#2563EB' },
      { label: 'In Progress Deliveries', count: progress, icon: <LocalShippingIcon />, pct: 45, trend: 'Active route', color: '#F59E0B' },
      { label: 'Completed Deliveries', count: completed, icon: <CheckCircleIcon />, pct: 90, trend: 'Target: 12 runs', color: '#10B981' },
      { label: 'Driver Rating', count: rating.toFixed(1), icon: <StarRateIcon />, pct: 95, trend: 'Satisfied clients', color: '#EC4899' }
    ];
  }, [deliveries, profile]);

  // Format Elapsed Duration (hh:mm:ss)
  const formatElapsedTime = (sec) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle Proof Upload Submission
  const handleCompleteSubmit = () => {
    const activeDel = activeDelivery;
    if (!activeDel) return;

    if (!photoUrl) {
      alert('Proof of Delivery photo is required to complete delivery');
      return;
    }

    if (!otpCode || otpCode.trim() !== activeDel.proofOfDelivery?.otpCode?.trim()) {
      setOtpError('Invalid OTP verification code. Please check with customer.');
      return;
    }
    setOtpError('');
    
    // Get signature canvas drawing base64
    const canvas = canvasRef.current;
    const finalSignature = canvas ? canvas.toDataURL() : (sigName || 'Digitally Signed');

    // Build proof details
    const proofOfDelivery = {
      customerSignature: finalSignature,
      deliveryPhoto: photoUrl,
      otpCode: otpCode.trim(),
      packagePhoto: packagePhotoUrl || '',
      location: {
        type: 'Point',
        coordinates: [gpsLongitude, gpsLatitude]
      },
      timestamp: new Date()
    };

    handleUpdateStatus('delivered', { proofOfDelivery, comment: 'Package safely delivered with verified proof.' });
    setCompleteOpen(false);
    // Reset forms
    setSigName('');
    setPhotoUrl('');
    setPackagePhotoUrl('');
    setOtpCode('');
  };

  // SOS Emergency Trigger
  const handleSOSAlert = (alertType) => {
    const alertMsg = `EMERGENCY ALERT: Driver ${user?.name} triggered SOS! Type: ${alertType}. Location: LAT ${gpsLatitude.toFixed(6)}, LNG ${gpsLongitude.toFixed(6)}`;
    if (socket && socket.connected) {
      socket.emit('driver:location_update', {
        latitude: gpsLatitude,
        longitude: gpsLongitude,
        speed: gpsSpeed,
        deliveryId: activeDelivery?._id
      });
    }
    alert(alertMsg + '\nAdmins notified immediately.');
  };

  return (
    <ThemeProvider theme={localTheme}>
      <DriverLayout
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        themeMode={themeMode}
        toggleThemeMode={handleToggleTheme}
        unreadCount={unreadCount}
        onOpenNotifications={() => setNotificationsOpen(true)}
        onlineStatus={profile?.status || 'offline'}
        onToggleOnlineStatus={handleToggleOnlineStatus}
      >
      
      {/* OFFLINE QUEUE SYNC BANNER */}
      {!isOnline && (
        <Alert 
          severity="warning" 
          icon={<SignalCellularConnectedNoInternet4BarIcon />}
          sx={{ mb: 3, borderRadius: '12px', fontWeight: 700 }}
        >
          Offline Mode Active. Cached status changes ({syncQueue.length}) will sync automatically once network returns.
        </Alert>
      )}

      {/* ANIMATION PRESENTATION WRAPPER */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
        >
          
          {/* TAB 0: HOME / MAP PANEL */}
          {currentTab === 0 && (
            <Grid container spacing={3}>
              
              {/* WELCOME BANNER & STATS */}
              <Grid item xs={12}>
                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={1}>
                  <Box>
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, color: 'text.secondary' }}>
                      TrackFlow Courier
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: themeMode === 'light' ? '#1E293B' : '#FFFFFF' }}>
                      Good Morning, {user?.name || 'Karthik'} 👋
                    </Typography>
                  </Box>
                  
                  <Box display="flex" gap={1.5}>
                    <Chip icon={<CloudQueueIcon />} label="28°C Partly Cloudy" sx={{ fontWeight: 700 }} />
                    <Chip label="Morning Shift" color="primary" sx={{ fontWeight: 700 }} />
                  </Box>
                </Box>
              </Grid>

              {/* SUMMARY KPI METRIC TILES */}
              {summaryMetrics.map((stat, idx) => (
                <Grid item xs={12} sm={6} md={3} key={idx}>
                  <Card
                    component={motion.div}
                    whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}
                    sx={{
                      bgcolor: themeMode === 'light' ? '#FFFFFF' : '#1E293B',
                      border: `1px solid ${themeMode === 'light' ? '#E2E8F0' : 'rgba(255,255,255,0.06)'}`,
                      borderRadius: '16px'
                    }}
                  >
                    <CardContent sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                          {stat.label}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 900, my: 0.5, color: themeMode === 'light' ? '#1E293B' : '#FFFFFF' }}>
                          {stat.count}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          {stat.trend}
                        </Typography>
                        <LinearProgress variant="determinate" value={stat.pct} sx={{ height: 4, borderRadius: 2, bgcolor: themeMode === 'light' ? '#E2E8F0' : '#334155', '& .MuiLinearProgress-bar': { bgcolor: stat.color } }} />
                      </Box>
                      <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: `${stat.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, ml: 2 }}>
                        {stat.icon}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}

              {/* ACTIVE SHIPMENT DETAIL AND TELEMETRY DRAWER */}
              <Grid item xs={12} md={5} display="flex" flexDirection="column" gap={3}>
                <ActiveDeliveryCard
                  delivery={activeDelivery}
                  themeMode={themeMode}
                  onAccept={() => handleUpdateStatus('accepted', { comment: 'Delivery assignment accepted by Courier.' })}
                  onStart={() => handleUpdateStatus('picked_up', { comment: 'Package picked up from hub. On the way.' })}
                  onComplete={() => setCompleteOpen(true)}
                  onReject={() => setRejectOpen(true)}
                  onCancel={() => setCancelOpen(true)}
                  onStatusChange={(e) => handleUpdateStatus(e.target.value, { comment: `Courier updated status to ${e.target.value}.` })}
                  onNavigate={() => {
                    handleUpdateStatus('in_transit', { comment: 'Auto-navigation launched. Driving.' });
                    window.open(`https://www.google.com/maps/dir/?api=1&origin=${gpsLatitude},${gpsLongitude}&destination=${activeDelivery.deliveryAddress?.coordinates[1]},${activeDelivery.deliveryAddress?.coordinates[0]}`, '_blank');
                  }}
                />

                {/* REAL-TIME TELEMETRY SHIELD */}
                {activeDelivery && (
                  <Card sx={{ bgcolor: themeMode === 'light' ? '#FFFFFF' : '#1E293B', border: `1px solid ${themeMode === 'light' ? '#E2E8F0' : 'rgba(255, 255, 255, 0.08)'}`, borderRadius: '16px', p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        Live Telemetry Stream
                      </Typography>
                      {profile?.status !== 'offline' ? (
                        <Chip label="Live Tracking Enabled" color="success" size="small" sx={{ fontWeight: 800, fontSize: '0.65rem' }} />
                      ) : (
                        <Chip label="Offline Caching" color="default" size="small" sx={{ fontWeight: 800, fontSize: '0.65rem' }} />
                      )}
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">LATITUDE</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: 'monospace' }}>{gpsLatitude.toFixed(6)}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">LONGITUDE</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: 'monospace' }}>{gpsLongitude.toFixed(6)}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">SPEED</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{gpsSpeed} km/h</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">DISTANCE</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{distanceTravelled.toFixed(2)} km</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">ELAPSED TIME</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#2563EB' }}>{formatElapsedTime(elapsedTime)}</Typography>
                      </Grid>
                    </Grid>
                  </Card>
                )}

                {/* EMERGENCY ALERT SOS BLOCK */}
                <Card sx={{ bgcolor: themeMode === 'light' ? '#FFFFFF' : '#1E293B', border: `1px solid ${themeMode === 'light' ? '#E2E8F0' : 'rgba(255,255,255,0.06)'}`, borderRadius: '16px', p: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#EF4444', mb: 2 }}>
                    SOS Emergency Panel
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    <Button variant="contained" color="error" startIcon={<WarningIcon />} onClick={() => handleSOSAlert('ACCIDENT')} sx={{ fontWeight: 800 }}>
                      SOS Panic
                    </Button>
                    <Button variant="outlined" color="error" startIcon={<PhoneInTalkIcon />} href="tel:+919876543210" sx={{ fontWeight: 800 }}>
                      Call Dispatch
                    </Button>
                    <Button variant="outlined" color="warning" startIcon={<CarRepairIcon />} onClick={() => handleSOSAlert('BREAKDOWN')} sx={{ fontWeight: 700 }}>
                      Breakdown
                    </Button>
                  </Box>
                </Card>

              </Grid>

              {/* MAP VISUALIZATION & JOURNEY TIMELINE */}
              <Grid item xs={12} md={7} display="flex" flexDirection="column" gap={3}>
                <Box sx={{ height: 380, position: 'relative' }}>
                  <LiveTrackingMap
                    pickup={activeDelivery?.pickupAddress?.coordinates}
                    destination={activeDelivery?.deliveryAddress?.coordinates}
                    driverLocation={{ latitude: gpsLatitude, longitude: gpsLongitude, speed: gpsSpeed }}
                    polyline={activeDelivery?.route?.polyline}
                    themeMode={themeMode}
                    onRefresh={() => dispatch(fetchDeliveries())}
                  />
                </Box>
                <DeliveryTimeline delivery={activeDelivery} themeMode={themeMode} />
              </Grid>

            </Grid>
          )}

          {/* TAB 1: TODAY'S ASSIGNED DELIVERIES TABLE */}
          {currentTab === 1 && (
            <DeliveryTable
              deliveries={deliveries}
              themeMode={themeMode}
              onSelectDelivery={(del) => {
                setSelectedDelivery(del);
                setDetailsOpen(true);
              }}
            />
          )}

          {/* TAB 2: DELIVERY HISTORY */}
          {currentTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
                  Fulfillment History
                </Typography>
              </Grid>
              {deliveries.filter(d => ['delivered', 'cancelled'].includes(d.status)).map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item._id}>
                  <Card sx={{ bgcolor: themeMode === 'light' ? '#FFFFFF' : '#1E293B', border: `1px solid ${themeMode === 'light' ? '#E2E8F0' : 'rgba(255,255,255,0.06)'}`, borderRadius: '16px', p: 3 }}>
                    <Box display="flex" justifyContent="space-between" mb={2}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#2563EB' }}>
                        ID: {item.trackingId}
                      </Typography>
                      <Chip
                        label={item.status.toUpperCase()}
                        color={item.status === 'delivered' ? 'success' : 'error'}
                        size="small"
                        sx={{ fontWeight: 800, fontSize: '0.6rem' }}
                      />
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Box display="flex" flexDirection="column" gap={1.5} mb={2}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        Customer: {item.customer?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Destination: {item.deliveryAddress?.text}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Distance Covered: {item.route?.distance || '12.4'} km
                      </Typography>
                      {item.proofOfDelivery?.timestamp && (
                        <Typography variant="caption" color="success.main" sx={{ fontWeight: 700 }}>
                          Verified: {new Date(item.proofOfDelivery.timestamp).toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                     <Divider sx={{ mb: 2 }} />
                     <Box display="flex" gap={1.5} flexWrap="wrap">
                       <Button
                         variant="contained"
                         size="small"
                         color="primary"
                         onClick={() => {
                           setSelectedDelivery(item);
                           setDetailsOpen(true);
                         }}
                         sx={{ fontWeight: 700, borderRadius: '8px' }}
                       >
                         View Details
                       </Button>
                       <Button
                         variant="outlined"
                         size="small"
                         onClick={() => alert('Downloading manifest invoice...')}
                         sx={{ fontWeight: 700, borderRadius: '8px' }}
                       >
                         Download Manifest
                       </Button>
                     </Box>
                  </Card>
                </Grid>
              ))}
              {deliveries.filter(d => ['delivered', 'cancelled'].includes(d.status)).length === 0 && (
                <Grid item xs={12}>
                  <Card sx={{ p: 6, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No logs registered in history.
                    </Typography>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}

          {/* TAB 3: PERFORMANCE CHARTS */}
          {currentTab === 3 && (
            <PerformanceChart
              deliveries={deliveries}
              profile={profile}
              themeMode={themeMode}
            />
          )}

          {/* TAB 4: PROFILE PAGE */}
          {currentTab === 4 && (
            <DriverProfile
              user={user}
              profile={profile}
              themeMode={themeMode}
              deliveries={deliveries}
              onUpdateProfile={(payload) => dispatch(updateMyProfile(payload))}
              onUploadDoc={(payload) => dispatch(uploadMyDocuments(payload))}
            />
          )}

          {/* TAB 5: SETTINGS */}
          {currentTab === 5 && (
            <SettingsPage
              themeMode={themeMode}
              toggleThemeMode={handleToggleTheme}
              settings={settings}
              onUpdateSettings={setSettings}
            />
          )}

        </motion.div>
      </AnimatePresence>

      {/* SOCKET NOTIFICATIONS DRAWER */}
      <NotificationPanel
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
        onMarkRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))}
        themeMode={themeMode}
      />

      {/* REJECTION TRIGGER POPUP MODAL */}
      <RejectDeliveryModal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onSubmit={({ reason, comment }) => {
          handleUpdateStatus('pending_admin_approval', { rejectionReason: reason, comment });
          setRejectOpen(false);
        }}
        themeMode={themeMode}
      />

      {/* CANCELLATION TRIGGER POPUP MODAL */}
      <CancelDeliveryModal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onSubmit={({ reason, comment }) => {
          handleUpdateStatus('cancelled', { cancellationReason: reason, comment });
          setCancelOpen(false);
        }}
        themeMode={themeMode}
      />

      {/* COMPLETE SHIPMENT PROOF OF DELIVERY POPUP */}
      <Dialog
        open={completeOpen}
        onClose={() => setCompleteOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            bgcolor: themeMode === 'light' ? '#FFFFFF' : '#1E293B',
            backgroundImage: 'none',
            maxWidth: 440,
            width: '100%',
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Complete Delivery Run</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          
          <Typography variant="body2" color="text.secondary">
            Please capture proof details and verify OTP to complete the shipment task.
          </Typography>

          <TextField
            label="OTP Verification Code"
            fullWidth
            required
            type="number"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            error={Boolean(otpError)}
            helperText={otpError || "Ask customer for the 4-digit code shown on their tracking page."}
            placeholder="1234"
          />

          <Box>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 1 }}>
              RECIPIENT SIGNATURE (DRAW ON CANVAS)
            </Typography>
            <Box sx={{ border: '1px dashed rgba(255,255,255,0.15)', borderRadius: 2, bgcolor: themeMode === 'light' ? '#F8FAFC' : 'rgba(0,0,0,0.2)', position: 'relative' }}>
              <canvas
                ref={canvasRef}
                width={380}
                height={150}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                style={{ display: 'block', cursor: 'crosshair', width: '100%', height: 150 }}
              />
              <Button 
                size="small" 
                color="error" 
                onClick={clearCanvas} 
                sx={{ position: 'absolute', bottom: 8, right: 8, fontSize: '0.65rem', fontWeight: 800 }}
              >
                Clear Draw
              </Button>
            </Box>
            <TextField
              label="Or Type Recipient Name"
              fullWidth
              size="small"
              value={sigName}
              onChange={(e) => setSigName(e.target.value)}
              sx={{ mt: 1.5 }}
              placeholder="John Doe"
            />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 1 }}>
              UPLOAD CARGO / PROOF PHOTO (REQUIRED)
            </Typography>
            <Button variant="outlined" component="label" fullWidth sx={{ py: 1.2, fontWeight: 700, borderRadius: '8px' }}>
              Select Delivery Photo
              <input type="file" accept="image/*" hidden onChange={(e) => handleFileUpload(e, 'delivery')} />
            </Button>
            {photoUrl && (
              <Box sx={{ mt: 1.5, textAlign: 'center' }}>
                <Box component="img" src={photoUrl} sx={{ width: 120, height: 80, objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Typography variant="caption" display="block" color="success.main" sx={{ fontWeight: 700 }}>✓ Cargo Photo Uploaded</Typography>
              </Box>
            )}
          </Box>

          <Box>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 1 }}>
              UPLOAD PACKAGE PHOTO (OPTIONAL)
            </Typography>
            <Button variant="outlined" component="label" fullWidth sx={{ py: 1.2, fontWeight: 700, borderRadius: '8px' }}>
              Select Package Photo
              <input type="file" accept="image/*" hidden onChange={(e) => handleFileUpload(e, 'package')} />
            </Button>
            {packagePhotoUrl && (
              <Box sx={{ mt: 1.5, textAlign: 'center' }}>
                <Box component="img" src={packagePhotoUrl} sx={{ width: 120, height: 80, objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Typography variant="caption" display="block" color="success.main" sx={{ fontWeight: 700 }}>✓ Package Photo Uploaded</Typography>
              </Box>
            )}
          </Box>

        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCompleteOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleCompleteSubmit}
            variant="contained"
            color="success"
            sx={{ color: '#FFF', fontWeight: 800, borderRadius: '8px' }}
          >
            Confirm & Complete
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELIVERY DETAILS MODAL WITH CUSTOMER DETAILS */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            bgcolor: themeMode === 'light' ? '#FFFFFF' : '#111827',
            backgroundImage: 'none',
            border: themeMode === 'light' ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.08)',
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 900, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <LocalShippingIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Shipment Details
            </Typography>
          </Box>
          <IconButton onClick={() => setDetailsOpen(false)} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: themeMode === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)', py: 2.5 }}>
          {selectedDelivery && (
            <Box display="flex" flexDirection="column" gap={3}>
              {/* TRACKING ID, STATUS & PRIORITY */}
              <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, display: 'block' }}>TRACKING ID</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#2563EB' }}>
                    {selectedDelivery.trackingId}
                  </Typography>
                </Box>
                <Box display="flex" gap={1}>
                  <Chip
                    label={selectedDelivery.status?.replace(/_/g, ' ').toUpperCase()}
                    color={
                      selectedDelivery.status === 'delivered' ? 'success' :
                      selectedDelivery.status === 'cancelled' ? 'error' :
                      selectedDelivery.status === 'in_transit' ? 'warning' :
                      selectedDelivery.status === 'accepted' ? 'primary' :
                      'default'
                    }
                    size="small"
                    sx={{ fontWeight: 800, fontSize: '0.7rem' }}
                  />
                  <Chip
                    label={`Priority: ${selectedDelivery.priorityLevel?.toUpperCase() || 'MEDIUM'}`}
                    color={selectedDelivery.priorityLevel?.toLowerCase() === 'high' ? 'error' : 'default'}
                    size="small"
                    sx={{ fontWeight: 800, fontSize: '0.7rem' }}
                  />
                </Box>
              </Box>

              {/* CUSTOMER DETAILS SECTION */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon fontSize="small" /> Customer Details
                </Typography>
                <Card sx={{ bgcolor: themeMode === 'light' ? '#F8FAFC' : '#1E293B', border: 'none', borderRadius: '12px', p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700 }}>NAME</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        {selectedDelivery.customer?.name || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700 }}>PHONE</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PhoneIcon fontSize="inherit" color="action" /> {selectedDelivery.customer?.phone || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700 }}>EMAIL ADDRESS</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <EmailIcon fontSize="inherit" color="action" /> {selectedDelivery.customer?.email || 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Card>
              </Box>

              {/* ROUTE / ADDRESSES SECTION */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOnIcon fontSize="small" /> Route Locations
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pl: 1.5, borderLeft: '2px dashed #EA580C' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>Pickup Hub Address</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5 }}>
                      {selectedDelivery.pickupAddress?.text}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>Destination Address</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5 }}>
                      {selectedDelivery.deliveryAddress?.text}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* ROUTE STATISTICS & ETA */}
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Card sx={{ bgcolor: themeMode === 'light' ? '#F8FAFC' : '#1E293B', border: 'none', borderRadius: '12px', p: 1.5, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem', fontWeight: 700 }}>DISTANCE</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', mt: 0.5 }}>
                      {selectedDelivery.route?.distance || 0} km
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card sx={{ bgcolor: themeMode === 'light' ? '#F8FAFC' : '#1E293B', border: 'none', borderRadius: '12px', p: 1.5, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem', fontWeight: 700 }}>DURATION</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', mt: 0.5 }}>
                      {selectedDelivery.route?.duration || 0} mins
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card sx={{ bgcolor: themeMode === 'light' ? '#F8FAFC' : '#1E293B', border: 'none', borderRadius: '12px', p: 1.5, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem', fontWeight: 700 }}>ETA</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', mt: 0.5 }}>
                      {selectedDelivery.eta ? new Date(selectedDelivery.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </Typography>
                  </Card>
                </Grid>
              </Grid>

              {/* PROOF OF DELIVERY (IF DELIVERED) */}
              {selectedDelivery.status === 'delivered' && selectedDelivery.proofOfDelivery && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'success.main', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon fontSize="small" /> Verification & Proof Details
                  </Typography>
                  <Card sx={{ bgcolor: themeMode === 'light' ? '#F0FDF4' : 'rgba(16,185,129,0.05)', border: `1px solid ${themeMode === 'light' ? '#DCFCE7' : 'rgba(16,185,129,0.1)'}`, borderRadius: '12px', p: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700 }}>DELIVERED AT</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {selectedDelivery.proofOfDelivery.timestamp ? new Date(selectedDelivery.proofOfDelivery.timestamp).toLocaleString() : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700 }}>VERIFIED OTP CODE</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
                          {selectedDelivery.proofOfDelivery.otpCode || 'N/A'}
                        </Typography>
                      </Grid>
                      
                      {selectedDelivery.proofOfDelivery.customerSignature && (
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, fontWeight: 700 }}>CUSTOMER SIGNATURE</Typography>
                          {selectedDelivery.proofOfDelivery.customerSignature.startsWith('data:image') ? (
                            <Box component="img" src={selectedDelivery.proofOfDelivery.customerSignature} sx={{ maxHeight: 60, border: '1px solid rgba(0,0,0,0.05)', borderRadius: 1, p: 0.5, bgcolor: '#FFFFFF' }} />
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 700, fontStyle: 'italic' }}>
                              {selectedDelivery.proofOfDelivery.customerSignature}
                            </Typography>
                          )}
                        </Grid>
                      )}

                      {selectedDelivery.proofOfDelivery.deliveryPhoto && (
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, fontWeight: 700 }}>CARGO PHOTO</Typography>
                          <Box component="img" src={selectedDelivery.proofOfDelivery.deliveryPhoto} sx={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)' }} />
                        </Grid>
                      )}

                      {selectedDelivery.proofOfDelivery.packagePhoto && (
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, fontWeight: 700 }}>PACKAGE PHOTO</Typography>
                          <Box component="img" src={selectedDelivery.proofOfDelivery.packagePhoto} sx={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)' }} />
                        </Grid>
                      )}
                    </Grid>
                  </Card>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1.5 }}>
          {selectedDelivery && ['assigned', 'accepted', 'picked_up', 'in_transit', 'rejection_declined'].includes(selectedDelivery.status) && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setDetailsOpen(false);
                setCurrentTab(0); // Take user to the map & active view
              }}
              sx={{ fontWeight: 800, borderRadius: '8px' }}
            >
              Go to Navigation Map
            </Button>
          )}
          <Button onClick={() => setDetailsOpen(false)} variant="outlined" color="inherit" sx={{ fontWeight: 700, borderRadius: '8px' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      </DriverLayout>
    </ThemeProvider>
  );
};

export default DriverDashboard;
export { DriverDashboard };
