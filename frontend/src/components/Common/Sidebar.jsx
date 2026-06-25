import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Box
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PeopleIcon from '@mui/icons-material/People';
import MapIcon from '@mui/icons-material/Map';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { setLogoutConfirmOpen } from '../../store/slices/authSlice';

const drawerWidth = 240;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  if (!user) return null;

  const handleLogout = () => {
    dispatch(setLogoutConfirmOpen(true));
  };

  // Define sidebar menu options depending on role clearances
  const menuItems = [];

  if (user.role === 'superadmin' || user.role === 'admin') {
    menuItems.push(
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
      { text: 'Deliveries', icon: <LocalShippingIcon />, path: '/deliveries' },
      { text: 'Drivers', icon: <PeopleIcon />, path: '/drivers' },
      { text: 'Rejection Requests', icon: <RateReviewIcon />, path: '/rejections' },
      { text: 'Zones (Geofences)', icon: <MapIcon />, path: '/zones' },
      { text: 'Analytics & Reports', icon: <BarChartIcon />, path: '/analytics' }
    );
  } else if (user.role === 'driver') {
    menuItems.push(
      { text: 'My Deliveries', icon: <LocalShippingIcon />, path: '/deliveries' }
    );
  } else if (user.role === 'customer') {
    menuItems.push(
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
      { text: 'My Deliveries', icon: <LocalShippingIcon />, path: '/deliveries' }
    );
  }

  menuItems.push({ text: 'Settings', icon: <SettingsIcon />, path: '/settings' });

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#0f1424',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)'
        }
      }}
    >
      <Toolbar sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', py: 2 }}>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            fontWeight: 800,
            background: 'linear-gradient(90deg, #00e5ff 0%, #6366f1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.05em'
          }}
        >
          TRACKNOW
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Logistics Control Center
        </Typography>
      </Toolbar>
      <Divider />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', pb: 2 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon sx={{ color: location.pathname === item.path ? '#00e5ff' : 'text.secondary', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: location.pathname === item.path ? 600 : 400
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon sx={{ color: 'error.main', minWidth: 40 }}>
                <ExitToAppIcon />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'error.main'
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
export { drawerWidth };
