import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CircleIcon from '@mui/icons-material/Circle';
import { fetchNotifications, markNotificationsAsRead, setViewingNotification } from '../../store/slices/notificationSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { notifications, unreadCount } = useSelector((state) => state.notifications);

  const [anchorElNotif, setAnchorElNotif] = useState(null);

  useEffect(() => {
    if (user) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, user]);

  const handleOpenNotifMenu = (event) => {
    setAnchorElNotif(event.currentTarget);
  };

  const handleCloseNotifMenu = () => {
    setAnchorElNotif(null);
  };

  const handleMarkAllRead = () => {
    dispatch(markNotificationsAsRead());
    handleCloseNotifMenu();
  };

  const handleNotifClick = (notif) => {
    dispatch(setViewingNotification(notif));
    handleCloseNotifMenu();
  };

  if (!user) return null;

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - 240px)` },
        ml: { sm: `240px` },
        backgroundColor: 'rgba(15, 20, 36, 0.7)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: 'none'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6" component="div" sx={{ color: 'text.primary', fontWeight: 600 }}>
          System Monitor
        </Typography>

        <Box display="flex" alignItems="center" gap={2}>
          {/* Role Chip representation */}
          <Chip
            label={user.role.toUpperCase()}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: '0.65rem',
              letterSpacing: '0.05em',
              background: user.role === 'superadmin' || user.role === 'admin'
                ? 'linear-gradient(135deg, #00e5ff 0%, #00b2cc 100%)'
                : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: '#070a13'
            }}
          />

          {/* Notifications Trigger */}
          <IconButton size="large" color="inherit" onClick={handleOpenNotifMenu}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon sx={{ color: unreadCount > 0 ? '#00e5ff' : 'text.secondary' }} />
            </Badge>
          </IconButton>

          {/* User Profile avatar */}
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar
              src={user.profileImage}
              sx={{ bgcolor: 'secondary.main', width: 36, height: 36, fontSize: '1rem', fontWeight: 600 }}
            >
              {!user.profileImage && user.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box display={{ xs: 'none', md: 'block' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {user.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: -0.5 }}>
                {user.email}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Notifications Dropdown Panel */}
        <Menu
          anchorEl={anchorElNotif}
          open={Boolean(anchorElNotif)}
          onClose={handleCloseNotifMenu}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              width: 320,
              maxHeight: 400,
              backgroundColor: '#0f1424',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
              mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1
              }
            }
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Alert Center ({unreadCount} new)
            </Typography>
            {unreadCount > 0 && (
              <Typography
                variant="caption"
                sx={{ color: '#00e5ff', cursor: 'pointer', fontWeight: 600 }}
                onClick={handleMarkAllRead}
              >
                Clear all
              </Typography>
            )}
          </Box>
          <Divider />
          {notifications.length === 0 ? (
            <MenuItem disabled sx={{ justifyContent: 'center', py: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No active notifications
              </Typography>
            </MenuItem>
          ) : (
            <List disablePadding sx={{ maxHeight: 300, overflow: 'auto' }}>
              {notifications.map((notif, index) => (
                <ListItem
                  key={index}
                  divider={index !== notifications.length - 1}
                  onClick={() => handleNotifClick(notif)}
                  sx={{
                    py: 1,
                    px: 2,
                    cursor: 'pointer',
                    backgroundColor: notif.read ? 'transparent' : 'rgba(0, 229, 255, 0.03)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)'
                    }
                  }}
                >
                  <CircleIcon
                    sx={{
                      fontSize: 8,
                      mr: 1.5,
                      color: notif.type === 'route_deviation' ? 'error.main' : notif.type === 'delivery_completed' ? 'success.main' : 'primary.main',
                      visibility: notif.read ? 'hidden' : 'visible'
                    }}
                  />
                  <ListItemText
                    primary={notif.title}
                    secondary={notif.message}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: notif.read ? 500 : 700, color: 'text.primary' }}
                    secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
export { Navbar };
