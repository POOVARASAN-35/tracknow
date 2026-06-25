import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress
} from '@mui/material';
import { motion } from 'framer-motion';

// Icons
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CancelIcon from '@mui/icons-material/Cancel';
import PeopleIcon from '@mui/icons-material/People';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import GroupsIcon from '@mui/icons-material/Groups';
import PaidIcon from '@mui/icons-material/Paid';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';

const SummaryCards = ({
  stats,
  themeMode = 'light'
}) => {
  const summary = stats?.summary || {
    totalDeliveries: 0,
    activeDeliveries: 0,
    completedDeliveries: 0,
    cancelledDeliveries: 0,
    totalDrivers: 0,
    activeDrivers: 0,
    totalRevenue: 0
  };

  const cards = [
    { title: 'Total Deliveries', value: summary.totalDeliveries, icon: <AssignmentIcon />, color: '#2563EB', pct: 85, change: '+12.5%', glow: 'rgba(37,99,235,0.08)' },
    { title: 'Active Deliveries', value: summary.activeDeliveries, icon: <LocalShippingIcon />, color: '#3B82F6', pct: 60, change: 'Active runs', glow: 'rgba(59,130,246,0.08)' },
    { title: 'Completed Deliveries', value: summary.completedDeliveries, icon: <CheckCircleIcon />, color: '#10B981', pct: 90, change: '94% On-Time', glow: 'rgba(16,185,129,0.08)' },
    { title: 'Cancelled Deliveries', value: summary.cancelledDeliveries, icon: <CancelIcon />, color: '#EF4444', pct: 10, change: '-4% decrease', glow: 'rgba(239,68,68,0.08)' },
    { title: 'Total Drivers', value: summary.totalDrivers || 1, icon: <PeopleIcon />, color: '#8B5CF6', pct: 100, change: 'Fleet capacity', glow: 'rgba(139,92,246,0.08)' },
    { title: 'Drivers Online', value: summary.activeDrivers, icon: <ToggleOnIcon />, color: '#6366F1', pct: (summary.activeDrivers / (summary.totalDrivers || 1)) * 100, change: 'Available status', glow: 'rgba(99,102,241,0.08)' },
    { title: 'Active Vehicles', value: 3, icon: <DirectionsCarIcon />, color: '#EC4899', pct: 100, change: '100% Utilized', glow: 'rgba(236,72,153,0.08)' },
    { title: 'Total Customers', value: 4, icon: <GroupsIcon />, color: '#14B8A6', pct: 75, change: '+24% growth', glow: 'rgba(20,184,166,0.08)' },
    { title: 'Total Revenue', value: `$${(summary.totalRevenue || 0).toLocaleString()}`, icon: <PaidIcon />, color: '#10B981', pct: 88, change: '+18.4% profit', glow: 'rgba(16,185,129,0.08)' },
    { title: 'Pending Payments', value: '$254.50', icon: <CreditCardIcon />, color: '#F59E0B', pct: 15, change: 'Escrow logs', glow: 'rgba(245,158,11,0.08)' },
    { title: 'Support Tickets', value: 2, icon: <ConfirmationNumberIcon />, color: '#F59E0B', pct: 30, change: 'Pending response', glow: 'rgba(245,158,11,0.08)' },
    { title: 'System Health', value: '99.9%', icon: <HealthAndSafetyIcon />, color: '#10B981', pct: 99.9, change: 'API Operational', glow: 'rgba(16,185,129,0.08)' }
  ];

  return (
    <Grid container spacing={2.5}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
          <Card
            component={motion.div}
            whileHover={{ y: -4, boxShadow: `0 12px 30px ${card.glow}` }}
            sx={{
              bgcolor: themeMode === 'light' ? '#FFFFFF' : '#1E293B',
              border: `1px solid ${themeMode === 'light' ? '#E2E8F0' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: '16px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                    {card.title}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, mt: 0.5, color: themeMode === 'light' ? '#1E293B' : '#FFFFFF' }}>
                    {card.value}
                  </Typography>
                </Box>
                <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: `${card.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
                  {card.icon}
                </Box>
              </Box>

              <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mt: 1.5 }}>
                <Box sx={{ width: '70%' }}>
                  <LinearProgress variant="determinate" value={card.pct} sx={{ height: 4, borderRadius: 2, bgcolor: themeMode === 'light' ? '#E2E8F0' : '#334155', '& .MuiLinearProgress-bar': { bgcolor: card.color } }} />
                </Box>
                <Typography variant="caption" sx={{ color: card.color, fontWeight: 800 }}>
                  {card.change}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default SummaryCards;
export { SummaryCards };
