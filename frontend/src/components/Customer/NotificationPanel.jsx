import React from 'react';
import { Drawer, Box, Typography, IconButton, List, ListItem, ListItemText, Divider, Badge } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationPanel = ({ open, onClose, notifications = [], onMarkAsRead, currentThemeMode = 'dark' }) => {
  const isDark = currentThemeMode === 'dark';

  const getIcon = (type) => {
    switch (type) {
      case 'delivery_assigned':
        return <AssignmentTurnedInIcon sx={{ color: '#2563EB' }} />;
      case 'delivery_started':
        return <LocalShippingIcon sx={{ color: '#F59E0B' }} />;
      case 'driver_near':
        return <LocationOnIcon sx={{ color: '#EF4444' }} />;
      case 'delivery_completed':
        return <CheckCircleIcon sx={{ color: '#10B981' }} />;
      default:
        return <NotificationsActiveIcon sx={{ color: '#2563EB' }} />;
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 360 },
          bgcolor: isDark ? '#0a0e1a' : '#fff',
          borderLeft: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
          backgroundImage: 'none'
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3, borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}` }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <NotificationsActiveIcon sx={{ color: '#2563EB' }} />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Live Feed Alerts
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <List disablePadding>
          <AnimatePresence>
            {notifications.map((notif, index) => (
              <ListItem
                key={notif.id || index}
                component={motion.li}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                sx={{
                  p: 3,
                  borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
                  bgcolor: notif.read ? 'transparent' : isDark ? 'rgba(37, 99, 235, 0.03)' : 'rgba(37, 99, 235, 0.02)',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)'
                  }
                }}
                onClick={() => onMarkAsRead && onMarkAsRead(notif.id || index)}
              >
                <Box display="flex" gap={2} alignItems="flex-start" width="100%">
                  <Box sx={{ mt: 0.5 }}>
                    {getIcon(notif.type)}
                  </Box>
                  <Box width="100%">
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography variant="body2" sx={{ fontWeight: notif.read ? 600 : 800 }}>
                        {notif.title}
                      </Typography>
                      {!notif.read && (
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#EF4444' }} />
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      {notif.message}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.7rem' }}>
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </AnimatePresence>
          {notifications.length === 0 && (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8} px={4}>
              <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                No active notifications received. Your real-time updates will show up here.
              </Typography>
            </Box>
          )}
        </List>
      </Box>
    </Drawer>
  );
};

export default NotificationPanel;
