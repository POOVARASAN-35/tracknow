import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Grid, Avatar, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import NavigationIcon from '@mui/icons-material/Navigation';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import StarIcon from '@mui/icons-material/Star';

import AnimatedBackground from '../components/AnimatedBackground';
import LoginForm from '../components/LoginForm';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import LanguageSelector from '../components/LanguageSelector';
import { usePortalTheme } from '../context/ThemeContext';

const DriverLogin = () => {
  const { t, mode } = usePortalTheme();
  const navigate = useNavigate();

  // News headlines ticker state
  const [activeNews, setActiveNews] = useState(0);
  const news = [
    "New highway bypass reduces route transit by 15 mins.",
    "Driver safety guidelines updated for the monsoon season.",
    "TrackFlow rewards top 10 fleet drivers this weekend!"
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveNews((prev) => (prev + 1) % news.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        p: { xs: 2, md: 4 }
      }}
    >
      {/* Dark City Background */}
      <AnimatedBackground type="driver" />

      {/* Floating Top Header bar */}
      <Box
        sx={{
          position: 'absolute',
          top: 24,
          left: 24,
          right: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10
        }}
      >
        <Logo size="medium" />

        {/* Portal Switcher & Settings */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '24px',
              p: '4px',
              gap: '4px'
            }}
          >
            {[
              { id: 'customer', label: 'Customer', path: '/login' },
              { id: 'driver', label: 'Driver', path: '/login/driver' },
              { id: 'admin', label: 'Super Admin', path: '/login/admin' }
            ].map((p) => (
              <Box
                key={p.id}
                onClick={() => navigate(p.path)}
                sx={{
                  px: 2,
                  py: 0.75,
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  backgroundColor: p.id === 'driver' ? '#F97316' : 'transparent',
                  color: p.id === 'driver' ? '#ffffff' : '#9ca3af',
                  '&:hover': {
                    backgroundColor: p.id === 'driver' ? '#F97316' : 'rgba(255, 255, 255, 0.04)'
                  }
                }}
              >
                {p.label}
              </Box>
            ))}
          </Box>
          <LanguageSelector />
          <ThemeToggle />
        </Box>
      </Box>

      {/* Grid Layout */}
      <Grid
        container
        spacing={4}
        sx={{
          maxWidth: 1200,
          zIndex: 1,
          mt: { xs: 8, md: 0 },
          alignItems: 'center'
        }}
      >
        {/* Left Column: Form Card with driver photo avatar */}
        <Grid item xs={12} md={5.5}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card
              sx={{
                background: 'rgba(11, 15, 25, 0.75)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(249, 115, 22, 0.15)',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)'
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                {/* Driver Portal avatar design */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                  <motion.div
                    animate={{ boxShadow: ['0 0 0 0px rgba(249,115,22,0.4)', '0 0 0 10px rgba(249,115,22,0)', '0 0 0 0px rgba(249,115,22,0.4)'] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    style={{ borderRadius: '50%' }}
                  >
                    <Avatar
                      sx={{
                        width: 72,
                        height: 72,
                        bgcolor: '#F97316',
                        border: '3px solid #1f2937',
                        mb: 1.5
                      }}
                    >
                      <NavigationIcon sx={{ fontSize: 36, transform: 'rotate(45deg)' }} />
                    </Avatar>
                  </motion.div>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#F9FAFB', fontFamily: '"Outfit", sans-serif' }}>
                    {t('driverPortal')}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#F97316', fontWeight: 700, letterSpacing: '0.05em' }}>
                    SECURE GATEWAY
                  </Typography>
                </Box>

                <LoginForm role="driver" />
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Right Column: Driver Dashboard telemetries */}
        <Grid item xs={12} md={6.5} sx={{ display: { xs: 'none', md: 'block' } }}>
          <Grid container spacing={3}>
            {/* Live Dashboard Card */}
            <Grid item xs={12}>
              <Card
                sx={{
                  background: 'rgba(17, 24, 39, 0.7)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  p: 3
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#F9FAFB' }}>
                    Live Driver Dashboard Preview
                  </Typography>
                  {/* Glowing GPS Connection Signal badge */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, background: 'rgba(16,185,129,0.1)', px: 1.5, py: 0.5, borderRadius: '12px' }}>
                    <SignalCellularAltIcon sx={{ fontSize: 16, color: '#10B981' }} />
                    <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 800 }}>
                      GPS SIGNAL GOOD
                    </Typography>
                    <motion.div
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10B981' }}
                    />
                  </Box>
                </Box>

                {/* Dashboard Stats */}
                <Grid container spacing={2}>
                  {[
                    { title: t('todaysDeliveries'), val: '18 / 24', sub: '6 Remaining', color: '#F97316' },
                    { title: t('completedOrders'), val: '142', sub: 'This Week', color: '#10B981' },
                    { title: t('currentLocation'), val: 'Sector-4 Hub', sub: 'Zone A GPS Coordinates', color: '#00E5FF' },
                    { title: t('rating'), val: '4.95 ★', sub: 'Top Tier Driver', color: '#FBBF24' }
                  ].map((stat, i) => (
                    <Grid item xs={6} key={i}>
                      <Box
                        sx={{
                          background: 'rgba(3, 7, 18, 0.5)',
                          borderRadius: 3,
                          p: 2,
                          borderLeft: `4px solid ${stat.color}`
                        }}
                      >
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                          {stat.title}
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#F9FAFB', my: 0.5 }}>
                          {stat.val}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                          {stat.sub}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Card>
            </Grid>

            {/* Weather + Shift Widgets row */}
            <Grid item xs={6}>
              <Card sx={{ background: 'rgba(17, 24, 39, 0.7)', p: 2.5, border: '1px solid rgba(255,255,255,0.06)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <WbSunnyIcon sx={{ color: '#FBBF24' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#F9FAFB' }}>
                    {t('weather')}
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#F9FAFB' }}>
                  Rainy • 18°C
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  High humidity. Drive with safety care.
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={6}>
              <Card sx={{ background: 'rgba(17, 24, 39, 0.7)', p: 2.5, border: '1px solid rgba(255,255,255,0.06)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <QueryBuilderIcon sx={{ color: '#00E5FF' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#F9FAFB' }}>
                    {t('shift')}
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#F9FAFB' }}>
                  08:00 - 16:00
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Active Shift: Morning Rotation
                </Typography>
              </Card>
            </Grid>

            {/* News Ticker Card */}
            <Grid item xs={12}>
              <Card sx={{ background: 'rgba(17, 24, 39, 0.7)', p: 2, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 2 }}>
                <NewspaperIcon sx={{ color: '#F97316' }} />
                <Box sx={{ flex: 1, overflow: 'hidden', height: 24, position: 'relative' }}>
                  <motion.div
                    key={activeNews}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ position: 'absolute', width: '100%' }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#cbd5e1', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {news[activeNews]}
                    </Typography>
                  </motion.div>
                </Box>
              </Card>
            </Grid>

            {/* Emergency Hotline contact button */}
            <Grid item xs={12}>
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
                  borderRadius: 4,
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 8px 20px rgba(239, 68, 68, 0.25)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 25px rgba(239, 68, 68, 0.4)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <PhoneInTalkIcon sx={{ color: '#ffffff' }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#ffffff' }}>
                      {t('emergencyContact')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                      Instant dispatcher emergency call line
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 900, color: '#ffffff', letterSpacing: '0.05em' }}>
                  SOS 911
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DriverLogin;
