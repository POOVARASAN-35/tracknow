import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Box, Grid, Card, CardContent, Typography, Avatar, Button, Chip, IconButton, useTheme, useMediaQuery, Alert, Divider } from '@mui/material';
import { motion } from 'framer-motion';

// Icons
import EditIcon from '@mui/icons-material/Edit';
import ShareIcon from '@mui/icons-material/Share';
import BadgeIcon from '@mui/icons-material/Badge';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import SpeedIcon from '@mui/icons-material/Speed';
import TimerIcon from '@mui/icons-material/Timer';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import WarningIcon from '@mui/icons-material/Warning';
import CarRepairIcon from '@mui/icons-material/CarRepair';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import StarRateIcon from '@mui/icons-material/StarRate';

// Redux Actions
import { setLogoutConfirmOpen } from '../store/slices/authSlice';

// Subcomponents
import VehicleCard from '../components/Driver/VehicleCard';
import DocumentCard from '../components/Driver/DocumentCard';
import PerformanceCard from '../components/Driver/PerformanceCard';
import AnalyticsChart from '../components/Driver/AnalyticsChart';
import EarningsCard from '../components/Driver/EarningsCard';
import DeliveryHistoryTable from '../components/Driver/DeliveryHistoryTable';
import SettingsModal from '../components/Driver/SettingsModal';

const DriverProfile = ({ user, profile, themeMode = 'dark', deliveries = [], onUpdateProfile, onUploadDoc }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

  // Modals States
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Live Status Telemetry Simulation State (Socket.io emulation)
  const [telemetry, setTelemetry] = useState({
    latitude: 12.9716,
    longitude: 77.5946,
    speed: 0,
    gpsSignal: 'Strong',
    battery: 88,
    onlineHours: 4.5
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => ({
        ...prev,
        latitude: prev.latitude + (Math.random() - 0.5) * 0.0001,
        longitude: prev.longitude + (Math.random() - 0.5) * 0.0001,
        speed: Math.floor(Math.random() * 45),
        battery: Math.max(1, prev.battery - 1)
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    dispatch(setLogoutConfirmOpen(true));
  };

  const handleShareProfile = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Driver profile links copied to clipboard!');
  };

  const handleDownloadIdCard = () => {
    alert('Generating security credentials PDF badge. ID card manifest downloaded.');
  };

  const triggerSOS = (type) => {
    alert(`SOS ALERT FIRED: Type [${type}]. Current Location coordinates Lat: ${telemetry.latitude.toFixed(5)}, Lng: ${telemetry.longitude.toFixed(5)}. Admins and emergency responders dispatched.`);
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      {/* Title */}
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: 'Poppins', letterSpacing: '-0.02em' }}>
          Driver Profile
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your personal information, credentials, and delivery performance metrics.
        </Typography>
      </Box>

      {/* Main Grid Layout */}
      <Grid container spacing={3.5}>
        
        {/* LEFT COLUMN: Profile Summary Card */}
        <Grid item xs={12} md={5} lg={3}>
          <Card sx={{
            bgcolor: themeMode === 'light' ? '#FFFFFF' : '#111827',
            borderRadius: '20px',
            textAlign: 'center',
            p: 3,
            position: 'sticky',
            top: 100
          }}>
            {/* Avatar with Online Glow */}
            <Box sx={{ position: 'relative', width: 110, height: 110, mx: 'auto', mb: 2.5 }}>
              <Avatar
                sx={{
                  width: 110,
                  height: 110,
                  bgcolor: '#2563EB',
                  fontSize: '3rem',
                  fontWeight: 900,
                  boxShadow: '0 8px 30px rgba(37,99,235,0.25)',
                  fontFamily: 'Poppins'
                }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                bgcolor: profile?.status === 'offline' ? '#94A3B8' : '#10B981',
                border: `3px solid ${themeMode === 'light' ? '#FFFFFF' : '#111827'}`,
                position: 'absolute',
                bottom: 4,
                right: 4
              }} />
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: 'Poppins' }}>
              {user?.name || 'Karthik'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              ID: {profile?._id?.slice(-8).toUpperCase() || 'TRK-4982'}
            </Typography>
            
            <Chip
              label="Verified Partner"
              color="success"
              size="small"
              sx={{ mt: 1.5, fontWeight: 900, fontSize: '0.65rem', height: 22 }}
            />

            <Box display="flex" justifyContent="center" alignItems="center" gap={0.5} sx={{ mt: 2, mb: 3 }}>
              <StarRateIcon sx={{ color: '#F59E0B', fontSize: '1.25rem' }} />
              <Typography variant="body2" sx={{ fontWeight: 800 }}>
                {profile?.rating?.toFixed(1) || '4.9'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                (450 deliveries)
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Sidebar quick info */}
            <Box display="flex" flexDirection="column" gap={1.5} sx={{ textAlign: 'left', mb: 3.5 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">SHIFT TYPE</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Morning Run (08:00 - 16:00)</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">REGION CLEARANCE</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Bengaluru Central Zone</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">VEHICLE PLATE NO</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  {profile?.vehicle?.vehicleNumber || 'KA-51-EF-9981'}
                </Typography>
              </Box>
            </Box>

            {/* Actions */}
            <Box display="flex" flexDirection="column" gap={1.2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setSettingsOpen(true)}
                sx={{ borderRadius: '10px', py: 1.2, fontWeight: 800, fontFamily: 'Poppins' }}
              >
                Edit Profile
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ShareIcon />}
                onClick={handleShareProfile}
                sx={{ borderRadius: '10px', py: 1.2, fontWeight: 800, fontFamily: 'Poppins' }}
              >
                Share Profile
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                startIcon={<BadgeIcon />}
                onClick={handleDownloadIdCard}
                sx={{ borderRadius: '10px', py: 1.2, fontWeight: 800, fontFamily: 'Poppins' }}
              >
                Download Driver ID
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<ExitToAppIcon />}
                onClick={handleLogout}
                sx={{ borderRadius: '10px', py: 1.2, fontWeight: 800, fontFamily: 'Poppins' }}
              >
                Logout Account
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* CENTER COLUMN: Personal, Driving, Vehicle, Documents, SOS */}
        <Grid item xs={12} md={7} lg={6}>
          <Box display="flex" flexDirection="column" gap={4}>
            
            {/* PERSONAL INFORMATION */}
            <Card sx={{ bgcolor: themeMode === 'light' ? '#FFFFFF' : '#111827', borderRadius: '20px', p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 2.5, fontFamily: 'Poppins' }}>
                Personal Information
              </Typography>
              <Grid container spacing={3.5}>
                {[
                  { label: 'Full Name', val: user?.name || 'Karthik Arasu' },
                  { label: 'Email Address', val: user?.email || 'driver@tracknow.com' },
                  { label: 'Phone Number', val: user?.phone || '+91 98765 43210' },
                  { label: 'Date of Birth', val: 'Oct 14, 1996' },
                  { label: 'Gender Type', val: 'Male' },
                  { label: 'Nationality', val: 'Indian' },
                  { label: 'Primary Language', val: 'English / Tamil' },
                  { label: 'Emergency Contact', val: '+91 98765 09876 (Spouse)' }
                ].map((item, idx) => (
                  <Grid item xs={12} sm={6} key={idx}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>{item.label}</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.5, fontFamily: 'Poppins' }}>
                      {item.val}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Card>

            {/* DRIVING INFORMATION */}
            <Card sx={{ bgcolor: themeMode === 'light' ? '#FFFFFF' : '#111827', borderRadius: '20px', p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 2.5, fontFamily: 'Poppins' }}>
                Driving Roster Specifications
              </Typography>
              <Grid container spacing={3.5}>
                {[
                  { label: 'License Number', val: profile?.licenseNumber || 'DL-9081248-A' },
                  { label: 'License Expiry', val: 'Jan 10, 2031' },
                  { label: 'Riding Experience', val: '6 Years Professional' },
                  { label: 'Driving Record', val: 'Clean (0 Infractions)', color: '#10B981' },
                  { label: 'Assigned Region', val: 'Central Bengaluru Cluster' },
                  { label: 'Employment Status', val: 'Full-Time Contractor' }
                ].map((item, idx) => (
                  <Grid item xs={12} sm={6} key={idx}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>{item.label}</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.5, fontFamily: 'Poppins', color: item.color || 'inherit' }}>
                      {item.val}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Card>

            {/* VEHICLE INFORMATION */}
            <VehicleCard vehicle={profile?.vehicle} themeMode={themeMode} />

            {/* DOCUMENT SECTION */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 2, fontFamily: 'Poppins' }}>
                Verification Documents
              </Typography>
              <DocumentCard documents={profile?.documents} onUploadDoc={onUploadDoc} themeMode={themeMode} />
            </Box>

            {/* EMERGENCY SECTION */}
            <Card sx={{ bgcolor: themeMode === 'light' ? '#FFFFFF' : '#111827', borderRadius: '20px', p: 3, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#EF4444', mb: 1, fontFamily: 'Poppins' }}>
                SOS Emergency Protocol Console
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
                Trigger instant panic dispatches. Telemetry coordinates will stream to admin support desks immediately.
              </Typography>
              <Grid container spacing={1.5}>
                <Grid item xs={6} sm={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="error"
                    startIcon={<WarningIcon />}
                    onClick={() => triggerSOS('SOS PANIC')}
                    sx={{ py: 1.5, fontWeight: 800, borderRadius: '8px', fontSize: '0.75rem' }}
                  >
                    SOS Panic
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={<CarRepairIcon />}
                    onClick={() => triggerSOS('BREAKDOWN')}
                    sx={{ py: 1.5, fontWeight: 800, borderRadius: '8px', fontSize: '0.75rem' }}
                  >
                    Breakdown
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={<ReportProblemIcon />}
                    onClick={() => triggerSOS('ACCIDENT')}
                    sx={{ py: 1.5, fontWeight: 800, borderRadius: '8px', fontSize: '0.75rem' }}
                  >
                    Accident
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    startIcon={<PhoneInTalkIcon />}
                    href="tel:+919876543210"
                    sx={{ py: 1.5, fontWeight: 800, borderRadius: '8px', fontSize: '0.75rem' }}
                  >
                    Call Admin
                  </Button>
                </Grid>
              </Grid>
            </Card>

          </Box>
        </Grid>

        {/* RIGHT COLUMN: Performance, Charts, Earnings, History, Live Telemetry */}
        <Grid item xs={12} lg={3}>
          <Box display="flex" flexDirection="column" gap={4}>
            
            {/* LIVE TELEMETRY RADAR SHIELD */}
            <Card sx={{ bgcolor: themeMode === 'light' ? '#FFFFFF' : '#111827', borderRadius: '20px', p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, fontFamily: 'Poppins' }}>
                  Live Telemetry Stream
                </Typography>
                <Chip
                  icon={<GpsFixedIcon sx={{ fontSize: '0.9rem !important' }} />}
                  label={telemetry.gpsSignal}
                  color="success"
                  size="small"
                  sx={{ fontWeight: 900, fontSize: '0.6rem', height: 20 }}
                />
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">COORDINATES</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.8rem', fontFamily: 'monospace' }}>
                    {telemetry.latitude.toFixed(5)}, {telemetry.longitude.toFixed(5)}
                  </Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary">VELOCITY</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                    <SpeedIcon fontSize="inherit" /> {telemetry.speed} km/h
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">BATTERY STATUS</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <BatteryChargingFullIcon fontSize="inherit" /> {telemetry.battery}%
                  </Typography>
                </Grid>
                
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary">ONLINE SESSION</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                    <TimerIcon fontSize="inherit" /> {telemetry.onlineHours} hrs
                  </Typography>
                </Grid>
              </Grid>
            </Card>

            {/* REAL-TIME SUCCESS DOUGHNUT PROGRESS */}
            <Card sx={{ bgcolor: themeMode === 'light' ? '#FFFFFF' : '#111827', borderRadius: '20px', p: 3, textAlign: 'center' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 3, alignSelf: 'flex-start', textAlign: 'left', fontFamily: 'Poppins' }}>
                Monthly Fulfillment success
              </Typography>
              <AnalyticsChart type="doughnut" deliveries={deliveries} themeMode={themeMode} />
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
                Keep success rating above 90% to maintain Elite Commander bonuses.
              </Typography>
            </Card>

            {/* PERFORMANCE ANALYSIS CHARTS */}
            <Card sx={{ bgcolor: themeMode === 'light' ? '#FFFFFF' : '#111827', borderRadius: '20px', p: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 2, fontFamily: 'Poppins' }}>
                Weekly Deliveries Performance
              </Typography>
              <AnalyticsChart type="line" deliveries={deliveries} themeMode={themeMode} />
            </Card>

            <Card sx={{ bgcolor: themeMode === 'light' ? '#FFFFFF' : '#111827', borderRadius: '20px', p: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 2, fontFamily: 'Poppins' }}>
                Daily Earnings Statistics
              </Typography>
              <AnalyticsChart type="bar" deliveries={deliveries} themeMode={themeMode} />
            </Card>

          </Box>
        </Grid>

        {/* FULL WIDTH LOWER SECTION: Earnings details, History table, Performance Badges */}
        <Grid item xs={12}>
          <Box display="flex" flexDirection="column" gap={4}>
            
            {/* EARNINGS WALLET & WITHDRAWAL */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 2, fontFamily: 'Poppins' }}>
                Wallet & Withdrawals
              </Typography>
              <EarningsCard deliveries={deliveries} themeMode={themeMode} />
            </Box>

            {/* PERFORMANCE KPI SUMMARY & ACHIEVEMENTS */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 2, fontFamily: 'Poppins' }}>
                Performance & Achievements
              </Typography>
              <PerformanceCard profile={profile} deliveries={deliveries} themeMode={themeMode} />
            </Box>

            {/* HISTORY RECORDS TABLE */}
            <Box>
              <DeliveryHistoryTable deliveries={deliveries} themeMode={themeMode} onSelectDelivery={() => {}} />
            </Box>

          </Box>
        </Grid>

      </Grid>

      {/* SETTINGS MODAL */}
      {settingsOpen && (
        <SettingsModal
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          user={user}
          profile={profile}
          onUpdateProfile={onUpdateProfile}
          themeMode={themeMode}
        />
      )}
    </Box>
  );
};

export default DriverProfile;
export { DriverProfile };
