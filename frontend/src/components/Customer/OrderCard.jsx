import React from 'react';
import { Card, CardContent, Typography, Box, Button, Rating, Chip } from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import ReplayIcon from '@mui/icons-material/Replay';
import { motion } from 'framer-motion';

const OrderCard = ({ order, onRepeatOrder, onDownloadInvoice, onRateOrder, currentThemeMode = 'dark' }) => {
  const isDark = currentThemeMode === 'dark';
  
  // Format Date and Time
  const deliveredDateObj = new Date(order.updatedAt);
  const deliveredDate = deliveredDateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  const deliveredTime = deliveredDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <Card 
      component={motion.div}
      whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}
      sx={{ 
        height: '100%',
        bgcolor: isDark ? '#0f1424' : '#fff',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)'}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: '16px'
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box 
            display="flex" 
            alignItems="center" 
            justifyContent="center" 
            sx={{ 
              width: 44, 
              height: 44, 
              borderRadius: '12px',
              bgcolor: isDark ? 'rgba(37, 99, 235, 0.1)' : 'rgba(37, 99, 235, 0.05)',
              color: '#2563EB' 
            }}
          >
            <LocalShippingIcon />
          </Box>
          <Chip 
            label="Delivered" 
            size="small" 
            color="success" 
            icon={<CheckCircleIcon style={{ fontSize: 14 }} />} 
            sx={{ fontWeight: 700, fontSize: '0.75rem' }}
          />
        </Box>

        {/* Tracking ID */}
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#2563EB', mb: 1 }}>
          {order.trackingId}
        </Typography>

        {/* Package info */}
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
          Package to {order.deliveryAddress?.text?.split(',')[0]}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Delivered on {deliveredDate} at {deliveredTime}
        </Typography>

        {/* Rating */}
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            Rating:
          </Typography>
          <Rating 
            value={order.rating || 4.5} 
            precision={0.5} 
            size="small"
            onChange={(e, newVal) => {
              if (onRateOrder) onRateOrder(order._id || order.id, newVal);
            }}
          />
        </Box>
      </CardContent>

      <Box sx={{ p: 2, pt: 0, borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)'}`, display: 'flex', gap: 1 }}>
        <Button 
          variant="outlined" 
          size="small" 
          fullWidth
          startIcon={<DownloadIcon />}
          onClick={() => onDownloadInvoice && onDownloadInvoice(order)}
          sx={{ fontSize: '0.75rem', fontWeight: 700 }}
        >
          Invoice
        </Button>
        <Button 
          variant="contained" 
          size="small" 
          fullWidth
          color="primary"
          startIcon={<ReplayIcon />}
          onClick={() => onRepeatOrder && onRepeatOrder(order)}
          sx={{ fontSize: '0.75rem', fontWeight: 700 }}
        >
          Reorder
        </Button>
      </Box>
    </Card>
  );
};

export default OrderCard;
