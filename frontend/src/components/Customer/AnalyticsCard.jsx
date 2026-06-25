import React from 'react';
import { Card, CardContent, Typography, Box, Grid, LinearProgress } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { motion } from 'framer-motion';

const AnalyticsCard = ({ stats, currentThemeMode = 'dark' }) => {
  const isDark = currentThemeMode === 'dark';

  const defaultStats = {
    total: 0,
    delivered: 0,
    cancelled: 0,
    active: 0,
    spending: 145.50,
    spendingLimit: 500,
    avgTime: '32 mins',
    rewards: 320,
    favAddress: '123 Pinecrest Apartments, Indiranagar'
  };

  const currentStats = { ...defaultStats, ...stats };

  const cards = [
    { title: 'Total Shipments', val: currentStats.total, icon: <ShoppingBagIcon sx={{ color: '#2563EB' }} />, glow: 'rgba(37, 99, 235, 0.08)' },
    { title: 'Delivered', val: currentStats.delivered, icon: <CheckCircleIcon sx={{ color: '#10B981' }} />, glow: 'rgba(16, 185, 129, 0.08)' },
    { title: 'Cancelled', val: currentStats.cancelled, icon: <CancelIcon sx={{ color: '#EF4444' }} />, glow: 'rgba(239, 68, 68, 0.08)' },
    { title: 'In Transit', val: currentStats.active, icon: <LocalShippingIcon sx={{ color: '#F59E0B' }} />, glow: 'rgba(245, 158, 11, 0.08)' },
  ];

  return (
    <Box>
      {/* 4 Stats Grid */}
      <Grid container spacing={2} mb={3}>
        {cards.map((c, i) => (
          <Grid item xs={6} key={i}>
            <Card
              component={motion.div}
              whileHover={{ y: -4, boxShadow: isDark ? `0 8px 25px ${c.glow}` : `0 8px 25px ${c.glow}` }}
              sx={{
                bgcolor: isDark ? 'rgba(15, 20, 36, 0.6)' : '#ffffff',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.08)'}`,
                borderRadius: '16px',
                textAlign: 'center'
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box display="flex" justifyContent="center" mb={1}>
                  <Box sx={{ p: 1, borderRadius: '50%', bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}>
                    {c.icon}
                  </Box>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900 }}>
                  {c.val}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {c.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Advanced Spend & Analytics Card */}
      <Card sx={{
        bgcolor: isDark ? 'rgba(15, 20, 36, 0.6)' : '#ffffff',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.08)'}`,
        borderRadius: '16px',
        mb: 3
      }}>
        <CardContent sx={{ p: 2.5 }}>
          {/* Spending Analysis */}
          <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
            <MonetizationOnIcon sx={{ color: '#2563EB' }} />
            <Box flexGrow={1}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                Monthly Logistics Spending
              </Typography>
              <Box display="flex" justifyContent="space-between" alignItems="baseline" mt={0.5}>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>
                  ${currentStats.spending.toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Limit: ${currentStats.spendingLimit}
                </Typography>
              </Box>
              <Box sx={{ width: '100%', mt: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min((currentStats.spending / currentStats.spendingLimit) * 100, 100)} 
                  sx={{ height: 6, borderRadius: 3, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                />
              </Box>
            </Box>
          </Box>

          <Grid container spacing={2}>
            {/* Avg Time */}
            <Grid item xs={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <AccessTimeIcon sx={{ color: '#7C3AED', fontSize: 20 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                    Avg. ETA Speed
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {currentStats.avgTime}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            {/* Rewards */}
            <Grid item xs={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <EmojiEventsIcon sx={{ color: '#F59E0B', fontSize: 20 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                    Loyalty Points
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {currentStats.rewards} pts
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card sx={{
        background: isDark ? 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(37,99,235,0.05) 100%)' : 'linear-gradient(135deg, rgba(124,58,237,0.05) 0%, rgba(37,99,235,0.03) 100%)',
        border: `1px solid ${isDark ? 'rgba(124,58,237,0.2)' : 'rgba(124,58,237,0.1)'}`,
        borderRadius: '16px'
      }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box display="flex" gap={1.5} alignItems="flex-start">
            <AutoAwesomeIcon sx={{ color: '#7C3AED', mt: 0.5 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isDark ? '#a78bfa' : '#6d28d9', mb: 0.5 }}>
                AI Smart Recommendation
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.4 }}>
                Based on your deliveries to <strong>{currentStats.favAddress.split(',')[0]}</strong>, choosing our <strong>Afternoon Slot (1 PM - 4 PM)</strong> can reduce delivery times by up to 18 mins due to lower local traffic levels.
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AnalyticsCard;
