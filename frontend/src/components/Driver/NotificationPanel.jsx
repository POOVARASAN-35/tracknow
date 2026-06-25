import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CircleIcon from '@mui/icons-material/Circle';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';

const NotificationPanel = ({
  open,
  onClose,
  notifications = [],
  onMarkAllRead,
  onMarkRead,
  themeMode = 'light'
}) => {
  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 360 },
          bgcolor: themeMode === 'light' ? '#FFFFFF' : '#1E293B',
          borderLeft: `1px solid ${themeMode === 'light' ? '#E2E8F0' : 'rgba(255, 255, 255, 0.08)'}`,
          backgroundImage: 'none'
        }
      }}
    >
      {/* DRAWER HEADER */}
      <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            Alerts Hub
          </Typography>
          {unreadNotifications.length > 0 && (
            <Box sx={{ bgcolor: 'error.main', color: '#FFF', fontSize: '0.65rem', fontWeight: 800, px: 1, py: 0.2, borderRadius: 10 }}>
              {unreadNotifications.length} NEW
            </Box>
          )}
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />

      {/* NOTIFICATIONS CONTAINER */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
        {notifications.length === 0 ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ height: '80%', py: 8, opacity: 0.5 }}>
            <NotificationsOffIcon sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              All caught up!
            </Typography>
            <Typography variant="caption" sx={{ mt: 0.5 }}>
              No notifications logs active.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {notifications.map((notif, index) => (
              <ListItem
                key={notif._id || notif.id || index}
                onClick={() => onMarkRead && onMarkRead(notif._id || notif.id)}
                sx={{
                  py: 2,
                  px: 2.5,
                  borderRadius: '12px',
                  mb: 1,
                  cursor: 'pointer',
                  backgroundColor: notif.read 
                    ? 'transparent' 
                    : (themeMode === 'light' ? 'rgba(37,99,235,0.03)' : 'rgba(37,99,235,0.06)'),
                  '&:hover': {
                    backgroundColor: themeMode === 'light' ? '#F8FAFC' : 'rgba(255,255,255,0.03)'
                  },
                  transition: 'background-color 0.2s'
                }}
              >
                <Box display="flex" alignItems="flex-start" gap={2} width="100%">
                  
                  {/* Read indicator */}
                  <CircleIcon
                    sx={{
                      fontSize: 8,
                      mt: 0.8,
                      color: notif.type === 'route_deviation' ? 'error.main' : notif.type === 'delivery_completed' ? 'success.main' : '#2563EB',
                      opacity: notif.read ? 0 : 1
                    }}
                  />

                  <ListItemText
                    primary={notif.title}
                    secondary={notif.message}
                    primaryTypographyProps={{
                      variant: 'body2',
                      fontWeight: notif.read ? 600 : 800,
                      color: themeMode === 'light' ? '#1E293B' : '#FFFFFF'
                    }}
                    secondaryTypographyProps={{
                      variant: 'caption',
                      color: 'text.secondary',
                      sx: { display: 'block', mt: 0.5 }
                    }}
                  />

                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* DRAWER FOOTER */}
      {unreadNotifications.length > 0 && (
        <Box sx={{ p: 2, borderTop: `1px solid ${themeMode === 'light' ? '#E2E8F0' : 'rgba(255, 255, 255, 0.08)'}` }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={onMarkAllRead}
            sx={{ fontWeight: 700, borderRadius: '8px' }}
          >
            Clear All Alerts
          </Button>
        </Box>
      )}

    </Drawer>
  );
};

export default NotificationPanel;
export { NotificationPanel };
