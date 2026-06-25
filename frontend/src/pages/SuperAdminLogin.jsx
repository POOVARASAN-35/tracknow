import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';

import AnimatedBackground from '../components/AnimatedBackground';
import LoginForm from '../components/LoginForm';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import LanguageSelector from '../components/LanguageSelector';
import { usePortalTheme } from '../context/ThemeContext';

const SuperAdminLogin = () => {
  const { t, mode } = usePortalTheme();
  const navigate = useNavigate();

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
      {/* Connected Network World map background */}
      <AnimatedBackground type="admin" />

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
                  backgroundColor: p.id === 'admin' ? '#0F172A' : 'transparent',
                  color: p.id === 'admin' 
                    ? '#ffffff' 
                    : mode === 'light' ? '#475569' : '#9ca3af',
                  '&:hover': {
                    backgroundColor: p.id === 'admin' ? '#0F172A' : mode === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)'
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

      {/* Grid Layout - Enterprise Visuals on left, secure login on right */}
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
        {/* Left Column: Live Fleet charts & analytics */}
        <Grid item xs={12} md={6.5} sx={{ display: { xs: 'none', md: 'block' } }}>
          <Box sx={{ pr: { md: 4 } }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, fontFamily: '"Outfit", sans-serif', color: 'text.primary', letterSpacing: '-0.03em' }}>
                Monitor Global Fleet Operation
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, mb: 4 }}>
                Real-time command panel. Keep track of driver locations, active routes, and revenue metrics metrics.
              </Typography>
            </motion.div>

            {/* Real-time Telemetry Metrics */}
            <Grid container spacing={3}>
              {[
                { title: 'Operational Revenue', val: '$48,250.00', pct: '+2.4%', icon: <TrendingUpIcon color="success" /> },
                { title: 'Global Deliveries', val: '18,290 Completed', pct: '+4.2%', icon: <PublicIcon sx={{ color: '#06B6D4' }} /> },
                { title: 'Active Fleet Drivers', val: '842 / 900 Active', pct: '93.5% Rate', icon: <PeopleAltIcon color="primary" /> }
              ].map((metric, i) => (
                <Grid item xs={12} key={i}>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    style={{ cursor: 'pointer' }}
                  >
                    <Box
                      sx={{
                        background: mode === 'light' ? 'rgba(255,255,255,0.85)' : 'rgba(15, 23, 42, 0.55)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid',
                        borderColor: mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)',
                        borderRadius: 3,
                        p: 2.5,
                        boxShadow: '0 10px 20px rgba(0,0,0,0.02)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                        <Box sx={{ background: mode === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)', p: 1.5, borderRadius: '50%' }}>
                          {metric.icon}
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                            {metric.title}
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.2 }}>
                            {metric.val}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Small Pulsing green Sparkline chart or Badge */}
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="subtitle2" sx={{ color: 'success.main', fontWeight: 800 }}>
                          {metric.pct}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                          vs yesterday
                        </Typography>
                      </Box>
                    </Box>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>

        {/* Right Column: Secure Admin Login form */}
        <Grid item xs={12} md={5.5}>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card
              sx={{
                background: mode === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.4)',
                backdropFilter: 'blur(20px)',
                border: '1px solid',
                borderColor: mode === 'light' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.08)',
                boxShadow: mode === 'light' 
                  ? '0 20px 40px -15px rgba(15, 23, 42, 0.08)' 
                  : '0 20px 40px -15px rgba(0, 0, 0, 0.6)'
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, fontFamily: '"Outfit", sans-serif' }}>
                    {t('superAdminPortal')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    Enter credentials to access administrative fleet dashboard controls.
                  </Typography>
                </Box>

                <LoginForm role="admin" />

                {/* Security Badge indicators row */}
                <Box
                  sx={{
                    mt: 4,
                    pt: 3,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 1.5
                  }}
                >
                  {[
                    { icon: <VerifiedUserIcon sx={{ fontSize: 16, color: '#10B981' }} />, label: t('sslBadge') },
                    { icon: <LockIcon sx={{ fontSize: 16, color: 'primary.main' }} />, label: t('jwtBadge') },
                    { icon: <VpnKeyIcon sx={{ fontSize: 16, color: '#06B6D4' }} />, label: t('encBadge') },
                    { icon: <SettingsSuggestIcon sx={{ fontSize: 16, color: '#7C3AED' }} />, label: t('rbacBadge') }
                  ].map((badge, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {badge.icon}
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                        {badge.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SuperAdminLogin;
