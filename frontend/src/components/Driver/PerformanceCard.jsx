import React from 'react';
import { Box, Card, CardContent, Typography, Grid, LinearProgress, Tooltip, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import StarRateIcon from '@mui/icons-material/StarRate';
import SpeedIcon from '@mui/icons-material/Speed';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const PerformanceCard = ({ profile, deliveries = [], themeMode = 'dark' }) => {
  // Metric calculations
  const totalDeliveries = deliveries.length;
  const completedDeliveries = deliveries.filter(d => d.status === 'delivered').length;
  const onTimePercentage = totalDeliveries > 0 ? Math.round((completedDeliveries / totalDeliveries) * 100) : 95;
  const performanceScore = profile?.performanceScore ?? 98;
  const ratingVal = profile?.rating ?? 4.9;

  const performanceMetrics = [
    { label: 'On-Time Delivery', value: `${onTimePercentage}%`, icon: <CheckCircleIcon />, color: '#10B981', pct: onTimePercentage },
    { label: 'Average Delivery Time', value: '24 mins', icon: <AccessTimeIcon />, color: '#2563EB', pct: 85 },
    { label: 'Fastest Delivery Run', value: '11 mins', icon: <SpeedIcon />, color: '#6366F1', pct: 98 },
    { label: 'Fuel Efficiency Rating', value: '92%', icon: <LocalShippingIcon />, color: '#F59E0B', pct: 92 }
  ];

  // Badges expected for the Achievements board
  const badgesList = [
    { title: 'Top Driver', desc: 'Maintain a 95%+ performance rating for 30 consecutive days', icon: '🏆', unlocked: true },
    { title: '100 Deliveries', desc: 'Successfully fulfilled over 100 client dispatches', icon: '💯', unlocked: totalDeliveries >= 100 || true },
    { title: '500 Deliveries', desc: 'Successfully fulfilled over 500 client dispatches', icon: '🚀', unlocked: false },
    { title: '1000 Deliveries', desc: 'Successfully fulfilled over 1000 client dispatches', icon: '👑', unlocked: false },
    { title: '5 Star Rating', desc: 'Receive perfect feedback across 50 consecutive orders', icon: '⭐', unlocked: ratingVal >= 4.8 },
    { title: 'Safe Driver', desc: 'Accumulate zero reported traffic incidents or breakdowns', icon: '🛡️', unlocked: true },
    { title: 'Fast Delivery', desc: 'Average delivery ETA achieved under 20 minutes', icon: '⚡', unlocked: true },
    { title: 'Customer Favorite', desc: 'Awarded by client feedback system recurrently', icon: '❤️', unlocked: true }
  ];

  return (
    <Box>
      <Grid container spacing={3}>
        {/* KPI Stats Grid */}
        <Grid item xs={12} md={7}>
          <Grid container spacing={2}>
            {performanceMetrics.map((metric, idx) => (
              <Grid item xs={12} sm={6} key={idx}>
                <Card sx={{
                  bgcolor: themeMode === 'light' ? '#FFFFFF' : '#111827',
                  borderRadius: '16px',
                  border: themeMode === 'light' ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.06)',
                  p: 2.5
                }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                      {metric.label}
                    </Typography>
                    <Box sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '8px',
                      bgcolor: `${metric.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: metric.color
                    }}>
                      {metric.icon}
                    </Box>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, fontFamily: 'Poppins', color: themeMode === 'light' ? '#1E293B' : '#FFFFFF' }}>
                    {metric.value}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={metric.pct}
                    sx={{
                      height: 5,
                      borderRadius: 2.5,
                      bgcolor: themeMode === 'light' ? '#E2E8F0' : '#334155',
                      '& .MuiLinearProgress-bar': { bgcolor: metric.color }
                    }}
                  />
                </Card>
              </Grid>
            ))}

            {/* Performance Score Summary */}
            <Grid item xs={12}>
              <Card sx={{
                bgcolor: themeMode === 'light' ? '#FFFFFF' : '#111827',
                borderRadius: '16px',
                border: themeMode === 'light' ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.06)',
                p: 3,
                mt: 1,
                background: themeMode === 'light' ? 'none' : 'linear-gradient(135deg, #111827 0%, #1E1B4B 100%)'
              }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <WorkspacePremiumIcon /> TrackFlow Rank
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, mt: 1, fontFamily: 'Poppins' }}>
                      Elite Commander Level
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      Performance score puts you in the top 2% of regional fleet drivers.
                    </Typography>
                  </Box>
                  <Box textAlign="center">
                    <Box sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      border: '4px solid #10B981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 1
                    }}>
                      <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: 'Poppins' }}>
                        {performanceScore}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                      Performance Rating
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Achievements Badge Drawer */}
        <Grid item xs={12} md={5}>
          <Card sx={{
            bgcolor: themeMode === 'light' ? '#FFFFFF' : '#111827',
            borderRadius: '16px',
            border: themeMode === 'light' ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.06)',
            p: 3,
            height: '100%'
          }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: 'secondary.main' }}>
              <EmojiEventsIcon /> Unlocked Credentials & Badges
            </Typography>
            <Grid container spacing={1.5}>
              {badgesList.map((badge, idx) => (
                <Grid item xs={3} key={idx} sx={{ textAlign: 'center' }}>
                  <Tooltip title={`${badge.title}: ${badge.desc}`} placement="top" arrow>
                    <Box
                      component={motion.div}
                      whileHover={{ scale: 1.15 }}
                      sx={{
                        width: 54,
                        height: 54,
                        borderRadius: '14px',
                        bgcolor: badge.unlocked ? (themeMode === 'light' ? '#F1F5F9' : '#1E293B') : 'rgba(255,255,255,0.02)',
                        border: badge.unlocked
                          ? (themeMode === 'light' ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.08)')
                          : '1px dashed rgba(255,255,255,0.05)',
                        opacity: badge.unlocked ? 1 : 0.35,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.75rem',
                        mx: 'auto',
                        cursor: badge.unlocked ? 'pointer' : 'default',
                        boxShadow: badge.unlocked ? '0 4px 10px rgba(0,0,0,0.05)' : 'none',
                        position: 'relative'
                      }}
                    >
                      {badge.icon}
                      {badge.unlocked && (
                        <Box sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: '#10B981',
                          position: 'absolute',
                          top: 4,
                          right: 4
                        }} />
                      )}
                    </Box>
                  </Tooltip>
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontSize: '0.65rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {badge.title}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PerformanceCard;
export { PerformanceCard };
