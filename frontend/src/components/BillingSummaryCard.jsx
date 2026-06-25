import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';

const BillingSummaryCard = ({ title, amount, pctChange, icon, color, isCurrency = true }) => {
  const isPositive = !pctChange.startsWith('-');

  const formattedAmount = isCurrency
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
    : amount;

  return (
    <Card
      component={motion.div}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '-20%',
          right: '-20%',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
          filter: 'blur(15px)',
          zIndex: 0
        }}
      />

      <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </Typography>
          <Box
            component={motion.div}
            whileHover={{ rotate: 15, scale: 1.15 }}
            sx={{
              p: 1.25,
              borderRadius: '10px',
              bgcolor: `${color}15`,
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.02em', color: '#fff' }}>
          {formattedAmount}
        </Typography>

        <Box display="flex" alignItems="center" gap={0.5}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              color: isPositive ? '#10B981' : '#EF4444',
              bgcolor: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              px: 1,
              py: 0.25,
              borderRadius: '4px'
            }}
          >
            {pctChange}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            vs last month
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BillingSummaryCard;
