import React from 'react';
import { Box, Typography } from '@mui/material';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PersonIcon from '@mui/icons-material/Person';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RateReviewIcon from '@mui/icons-material/RateReview';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { motion } from 'framer-motion';

const RecentActivity = ({ currentThemeMode = 'dark' }) => {
  const isDark = currentThemeMode === 'dark';

  const activities = [
    { id: 1, title: 'Review Submitted', desc: 'Rated Driver (Alex) 5 stars for order TRK-98124801', date: 'Today, 2:30 PM', icon: <RateReviewIcon sx={{ color: '#10B981', fontSize: 16 }} />, color: '#10B981' },
    { id: 2, title: 'Order Delivered', desc: 'Package dropped at Home by Driver (Alex)', date: 'Today, 2:14 PM', icon: <CheckCircleIcon sx={{ color: '#10B981', fontSize: 16 }} />, color: '#10B981' },
    { id: 3, title: 'In Transit', desc: 'Driver carrying shipment to Indiranagar Warehouse', date: 'Today, 1:45 PM', icon: <LocalShippingIcon sx={{ color: '#F59E0B', fontSize: 16 }} />, color: '#F59E0B' },
    { id: 4, title: 'Driver Assigned', desc: 'Alex Courier Partner accepted your dispatch order', date: 'Today, 1:20 PM', icon: <PersonIcon sx={{ color: '#2563EB', fontSize: 16 }} />, color: '#2563EB' },
    { id: 5, title: 'Payment Confirmed', desc: 'UPI transfer of $34.00 approved successfully', date: 'Today, 1:02 PM', icon: <MonetizationOnIcon sx={{ color: '#7C3AED', fontSize: 16 }} />, color: '#7C3AED' },
    { id: 6, title: 'Order Placed', desc: 'Logistics manifest created for order TRK-98124801', date: 'Today, 1:00 PM', icon: <ShoppingBagIcon sx={{ color: '#2563EB', fontSize: 16 }} />, color: '#2563EB' }
  ];

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
        Recent Activity Logs
      </Typography>

      <Box sx={{ position: 'relative', pl: 3.5, ml: 1.5 }}>
        {/* Continuous central vertical line */}
        <Box sx={{
          position: 'absolute',
          top: 8,
          bottom: 8,
          left: 0,
          width: 2,
          bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'
        }} />

        {/* Timeline items list */}
        {activities.map((act, index) => (
          <Box
            key={act.id}
            component={motion.div}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            sx={{ position: 'relative', mb: 3 }}
          >
            {/* Timeline node icon container */}
            <Box sx={{
              position: 'absolute',
              left: -38,
              top: 4,
              width: 26,
              height: 26,
              borderRadius: '50%',
              bgcolor: isDark ? '#0f1424' : '#ffffff',
              border: `2px solid ${act.color}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 2
            }}>
              {act.icon}
            </Box>

            {/* Timeline content details */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.85rem' }}>
                {act.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mt: 0.25 }}>
                {act.desc}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontSize: '0.65rem', fontWeight: 600 }}>
                {act.date}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default RecentActivity;
