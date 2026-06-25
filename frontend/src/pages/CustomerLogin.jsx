import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Grid, useTheme } from '@mui/material';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import StarIcon from '@mui/icons-material/Star';
import SpeedIcon from '@mui/icons-material/Speed';

import AnimatedBackground from '../components/AnimatedBackground';
import LoginForm from '../components/LoginForm';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import LanguageSelector from '../components/LanguageSelector';
import { usePortalTheme } from '../context/ThemeContext';

const CustomerLogin = () => {
  const { t, mode } = usePortalTheme();
  const theme = useTheme();
  const navigate = useNavigate();

  // Mouse Parallax coordinates
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (event) => {
    const { clientX, clientY } = event;
    const { innerWidth, innerHeight } = window;
    // Normalize coordinates around center of the screen
    const x = (clientX - innerWidth / 2) / (innerWidth / 2);
    const y = (clientY - innerHeight / 2) / (innerHeight / 2);
    mouseX.set(x * 12); // float range
    mouseY.set(y * 12);
  };

  // Parallax transformations for floating cards
  const transX1 = useTransform(mouseX, (v) => -v);
  const transY1 = useTransform(mouseY, (v) => -v);
  const transX2 = useTransform(mouseX, (v) => v * 1.5);
  const transY2 = useTransform(mouseY, (v) => v * 1.5);

  return (
    <Box
      onMouseMove={handleMouseMove}
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
      {/* Background Graphic */}
      <AnimatedBackground type="customer" />

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

        {/* Portal switcher pill + settings toggles */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Custom Portal switcher */}
          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              background: mode === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.5)',
              backdropFilter: 'blur(8px)',
              border: '1px solid',
              borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.06)',
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
                  backgroundColor: p.id === 'customer' ? 'primary.main' : 'transparent',
                  color: p.id === 'customer' 
                    ? '#ffffff' 
                    : mode === 'light' ? '#475569' : '#9ca3af',
                  '&:hover': {
                    backgroundColor: p.id === 'customer' ? 'primary.main' : mode === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)'
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

      {/* Main Responsive Grid Container */}
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
        {/* Left Column: Form Card */}
        <Grid item xs={12} md={5.5}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <Card
              sx={{
                background: mode === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.4)',
                backdropFilter: 'blur(20px)',
                border: '1px solid',
                borderColor: mode === 'light' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.08)',
                boxShadow: mode === 'light' 
                  ? '0 20px 40px -15px rgba(37, 99, 235, 0.08)' 
                  : '0 20px 40px -15px rgba(0, 0, 0, 0.6)'
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, fontFamily: '"Outfit", sans-serif' }}>
                    {t('welcomeBack')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    {t('trackRealTime')}
                  </Typography>
                </Box>

                <LoginForm role="customer" />
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Right Column: Dynamic Tracking graphic illustration */}
        <Grid item xs={12} md={6.5} sx={{ display: { xs: 'none', md: 'block' } }}>
          <Box sx={{ position: 'relative', height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            
            {/* Base Glass Card map */}
            <motion.div
              style={{ x: transX1, y: transY1, width: '100%', height: '100%' }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            >
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 6,
                  background: mode === 'light' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(15, 23, 42, 0.35)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid',
                  borderColor: mode === 'light' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                  p: 4
                }}
              >
                {/* SVG Route Pathway */}
                <svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" style={{ position: 'absolute', top: 0, left: 0 }}>
                  {/* Outer Map Contour curves */}
                  <path d="M 0 100 C 100 150, 150 50, 300 120 C 400 180, 200 300, 400 400" stroke={mode === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)'} strokeWidth="6" />
                  
                  {/* Delivery Route Path */}
                  <path id="delivery-route" d="M 50 300 Q 150 100 220 220 T 350 150" stroke={mode === 'light' ? '#e2e8f0' : 'rgba(255, 255, 255, 0.06)'} strokeWidth="4" strokeLinecap="round" />
                  
                  {/* Active Delivery Progress overlay */}
                  <motion.path
                    d="M 50 300 Q 150 100 220 220 T 350 150"
                    stroke={`url(#customer-route-glow)`}
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: [0, 1, 1, 0], pathOffset: [0, 0, 0.5, 0.5] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                  />

                  {/* Route Start Point */}
                  <circle cx="50" cy="300" r="6" fill="#7C3AED" />
                  
                  {/* Route Intermediate Hub Point */}
                  <circle cx="220" cy="220" r="6" fill="#2563EB" />
                  
                  {/* Pulse circle on Destination point */}
                  <motion.circle
                    cx="350"
                    cy="150"
                    r="14"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="1.5"
                    animate={{ scale: [0.5, 2, 0.5], opacity: [1, 0, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  />
                  <circle cx="350" cy="150" r="6" fill="#00E5FF" />

                  <defs>
                    <linearGradient id="customer-route-glow" x1="0" y1="0" x2="1" y2="0">
                      <stop stopColor="#7C3AED" />
                      <stop offset="0.5" stopColor="#2563EB" />
                      <stop offset="1" stopColor="#00E5FF" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Simulated Delivery Vehicle following the path */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '40%',
                    left: '45%',
                    zIndex: 2,
                    textAlign: 'center'
                  }}
                >
                  <motion.div
                    animate={{
                      y: [0, -8, 0],
                      rotate: [0, 2, -2, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Box
                      sx={{
                        background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                        color: '#ffffff',
                        p: 1.5,
                        borderRadius: '50%',
                        boxShadow: '0 8px 24px rgba(37,99,235,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <LocalShippingIcon sx={{ fontSize: 24 }} />
                    </Box>
                  </motion.div>
                </Box>

                {/* Floating Neumorphic Logistics Stats Panel */}
                <motion.div
                  style={{ x: transX2, y: transY2, position: 'absolute', bottom: 32, left: 32, right: 32 }}
                  transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                >
                  <Box
                    sx={{
                      background: mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(15, 23, 42, 0.65)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid',
                      borderColor: mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255, 255, 255, 0.08)',
                      borderRadius: 4,
                      p: 2.5,
                      boxShadow: '0 15px 30px rgba(0,0,0,0.15)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    {[
                      { icon: <LocalShippingIcon color="primary" />, val: '15,240+', label: t('ordersDelivered') },
                      { icon: <StarIcon sx={{ color: '#FBBF24' }} />, val: '99.8%', label: t('happyCustomers') },
                      { icon: <SpeedIcon sx={{ color: '#10B981' }} />, val: '< 24h', label: t('fastDelivery') }
                    ].map((stat, i) => (
                      <Box key={i} sx={{ textAlign: 'center', flex: 1 }}>
                        <Box sx={{ display: 'inline-flex', mb: 0.5 }}>{stat.icon}</Box>
                        <Typography variant="body1" sx={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', lineHeight: 1 }}>
                          {stat.val}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.7rem' }}>
                          {stat.label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </motion.div>
              </Box>
            </motion.div>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CustomerLogin;
