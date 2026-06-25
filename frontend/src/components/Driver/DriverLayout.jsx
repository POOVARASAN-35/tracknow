import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  Switch,
  FormControlLabel,
  Divider,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import NavigationIcon from '@mui/icons-material/Navigation';
import HistoryIcon from '@mui/icons-material/History';
import BarChartIcon from '@mui/icons-material/BarChart';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import TimeToLeaveIcon from '@mui/icons-material/TimeToLeave';
import { setLogoutConfirmOpen } from '../../store/slices/authSlice';
import { updateMyProfile } from '../../store/slices/driverSlice';

const drawerWidth = 260;

const DriverLayout = ({
  children,
  currentTab,
  setCurrentTab,
  themeMode,
  toggleThemeMode,
  unreadCount,
  onOpenNotifications,
  onlineStatus,
  onToggleOnlineStatus
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { user } = useSelector((state) => state.auth);
  const { profile } = useSelector((state) => state.drivers);

  const [time, setTime] = useState(new Date());
  const [anchorElProfile, setAnchorElProfile] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    dispatch(setLogoutConfirmOpen(true));
  };

  const navItems = [
    { label: 'Dashboard', icon: <SpaceDashboardIcon />, value: 0 },
    { label: 'Deliveries', icon: <NavigationIcon />, value: 1 },
    { label: 'History', icon: <HistoryIcon />, value: 2 },
    { label: 'Performance', icon: <BarChartIcon />, value: 3 },
    { label: 'Profile', icon: <PersonIcon />, value: 4 },
    { label: 'Settings', icon: <SettingsIcon />, value: 5 }
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: themeMode === 'light' ? '#F8FAFC' : '#0F172A', color: themeMode === 'light' ? '#1E293B' : '#F8FAFC' }}>
      
      {/* HEADER NAVBAR */}
      <AppBar
        position="fixed"
        sx={{
          width: isMobile ? '100%' : `calc(100% - ${drawerWidth}px)`,
          ml: isMobile ? 0 : `${drawerWidth}px`,
          backgroundColor: themeMode === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${themeMode === 'light' ? '#E2E8F0' : 'rgba(255, 255, 255, 0.08)'}`,
          boxShadow: 'none',
          color: themeMode === 'light' ? '#1E293B' : '#F8FAFC',
          zIndex: theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
          
          {/* Logo or page name */}
          <Box display="flex" alignItems="center" gap={1}>
            {isMobile && (
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mr: 1
                }}
              >
                TrackFlow
              </Typography>
            )}
            {!isMobile && (
              <Typography variant="h6" sx={{ fontWeight: 800, color: themeMode === 'light' ? '#1E293B' : '#F8FAFC' }}>
                Driver Control Center
              </Typography>
            )}
            
            {/* Real-time date and clock */}
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'inline-block' }, color: 'text.secondary', ml: 2, bgcolor: themeMode === 'light' ? '#EDF2F7' : 'rgba(255, 255, 255, 0.05)', px: 1.5, py: 0.5, borderRadius: 2, fontSize: '0.75rem', fontWeight: 600 }}>
              {time.toLocaleDateString([], { month: 'short', day: 'numeric' })} • {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 2 }}>
            
            {/* ONLINE / OFFLINE TOGGLE */}
            <Chip
              label={onlineStatus === 'offline' ? 'OFFLINE' : onlineStatus === 'busy' ? 'ON DELIVERY' : 'ONLINE'}
              color={onlineStatus === 'offline' ? 'default' : onlineStatus === 'busy' ? 'warning' : 'success'}
              size="small"
              sx={{ fontWeight: 800, fontSize: '0.65rem', height: 24, cursor: 'pointer' }}
              onClick={onToggleOnlineStatus}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={onlineStatus !== 'offline'}
                  onChange={onToggleOnlineStatus}
                  color="success"
                  size="small"
                />
              }
              label={onlineStatus !== 'offline' ? "Online" : "Offline"}
              labelPlacement="start"
              sx={{ m: 0, '& .MuiFormControlLabel-label': { fontSize: '0.8rem', fontWeight: 600, color: 'text.secondary', display: { xs: 'none', md: 'inline' }, mr: 1 } }}
            />

            {/* Notification Trigger */}
            <IconButton size="large" color="inherit" onClick={onOpenNotifications}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon sx={{ color: unreadCount > 0 ? '#2563EB' : 'text.secondary' }} />
              </Badge>
            </IconButton>

            {/* User profile dropdown trigger */}
            <Box display="flex" alignItems="center" gap={1} onClick={(e) => setAnchorElProfile(e.currentTarget)} sx={{ cursor: 'pointer' }}>
              <Avatar sx={{ bgcolor: onlineStatus === 'offline' ? 'grey.600' : '#2563EB', width: 36, height: 36, fontSize: '1rem', fontWeight: 700 }}>
                {user?.name?.charAt(0).toUpperCase() || 'D'}
              </Avatar>
            </Box>

            {/* Profile Menu */}
            <Menu
              anchorEl={anchorElProfile}
              open={Boolean(anchorElProfile)}
              onClose={() => setAnchorElProfile(null)}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: {
                  width: 220,
                  borderRadius: '12px',
                  bgcolor: themeMode === 'light' ? '#FFF' : '#1E293B',
                  border: `1px solid ${themeMode === 'light' ? '#E2E8F0' : 'rgba(255, 255, 255, 0.08)'}`,
                  mt: 1.5,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                }
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: themeMode === 'light' ? '#1E293B' : '#F8FAFC' }}>
                  {user?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Driver ID: {profile?.licenseNumber || 'N/A'}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => { setCurrentTab(4); setAnchorElProfile(null); }}>
                <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="My Profile" />
              </MenuItem>
              <MenuItem onClick={() => { setCurrentTab(5); setAnchorElProfile(null); }}>
                <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="Settings" />
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <ListItemIcon><ExitToAppIcon fontSize="small" color="error" /></ListItemIcon>
                <ListItemText primary="Logout" />
              </MenuItem>
            </Menu>

          </Box>
        </Toolbar>
      </AppBar>

      {/* DESKTOP SIDEBAR DRAWER */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: 'border-box',
              backgroundColor: themeMode === 'light' ? '#FFF' : '#0F172A',
              borderRight: `1px solid ${themeMode === 'light' ? '#E2E8F0' : 'rgba(255, 255, 255, 0.08)'}`,
            }
          }}
        >
          <Toolbar sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 900,
                background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '0.05em'
              }}
            >
              TrackFlow
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mt: 0.5 }}>
              Driver Portal
            </Typography>
          </Toolbar>
          <Divider />
          <Box display="flex" flexDirection="column" justifyContent="space-between" height="100%" pb={2}>
            <List sx={{ px: 1 }}>
              {navItems.map((item) => (
                <ListItem key={item.value} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    selected={currentTab === item.value}
                    onClick={() => setCurrentTab(item.value)}
                    sx={{
                      borderRadius: '8px',
                      py: 1.25,
                      px: 2,
                      color: currentTab === item.value ? '#2563EB' : 'text.secondary',
                      backgroundColor: currentTab === item.value 
                        ? (themeMode === 'light' ? 'rgba(37, 99, 235, 0.08)' : 'rgba(37, 99, 235, 0.15)') 
                        : 'transparent',
                      '&:hover': {
                        backgroundColor: themeMode === 'light' ? '#EDF2F7' : 'rgba(255, 255, 255, 0.05)',
                        color: themeMode === 'light' ? '#1E293B' : '#FFF'
                      },
                      '&.Mui-selected': {
                        borderLeft: '4px solid #2563EB',
                        borderRadius: '0 8px 8px 0',
                        ml: -1,
                        pl: 2.5,
                        backgroundColor: themeMode === 'light' ? 'rgba(37, 99, 235, 0.08)' : 'rgba(37, 99, 235, 0.15)',
                        color: '#2563EB',
                        '&:hover': {
                          backgroundColor: themeMode === 'light' ? 'rgba(37, 99, 235, 0.12)' : 'rgba(37, 99, 235, 0.2)'
                        }
                      }
                    }}
                  >
                    <ListItemIcon sx={{ color: currentTab === item.value ? '#2563EB' : 'text.secondary', minWidth: 36 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: currentTab === item.value ? 700 : 500
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            <List sx={{ px: 1 }}>
              <ListItem disablePadding>
                <ListItemButton onClick={handleLogout} sx={{ borderRadius: '8px', py: 1.25, px: 2, color: 'error.main' }}>
                  <ListItemIcon sx={{ color: 'error.main', minWidth: 36 }}>
                    <ExitToAppIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Logout"
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </Drawer>
      )}

      {/* MAIN CONTENT PORT */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          pt: { xs: 10, md: 11 },
          pb: isMobile ? 10 : 4,
          width: isMobile ? '100%' : `calc(100% - ${drawerWidth}px)`,
          transition: 'all 0.2s ease-in-out'
        }}
      >
        {children}
      </Box>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      {isMobile && (
        <Paper
          elevation={10}
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: theme.zIndex.drawer + 2,
            borderTop: `1px solid ${themeMode === 'light' ? '#E2E8F0' : 'rgba(255, 255, 255, 0.08)'}`,
            borderRadius: '16px 16px 0 0',
            overflow: 'hidden'
          }}
        >
          <BottomNavigation
            value={currentTab}
            onChange={(event, newValue) => setCurrentTab(newValue)}
            sx={{
              height: 64,
              backgroundColor: themeMode === 'light' ? '#FFF' : '#1E293B',
              '& .MuiBottomNavigationAction-root': {
                color: 'text.secondary',
                minWidth: 'auto',
                py: 1,
                '&.Mui-selected': {
                  color: '#2563EB',
                  '& .MuiSvgIcon-root': {
                    transform: 'scale(1.15)',
                    transition: 'transform 0.2s'
                  }
                }
              }
            }}
          >
            {navItems.map((item) => (
              <BottomNavigationAction
                key={item.value}
                label={item.label}
                icon={item.icon}
                value={item.value}
                sx={{
                  '& .MuiBottomNavigationAction-label': {
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    mt: 0.5,
                    '&.Mui-selected': {
                      fontSize: '0.7rem',
                      fontWeight: 700
                    }
                  }
                }}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}

    </Box>
  );
};

export default DriverLayout;
