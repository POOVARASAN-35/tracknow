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
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  TextField,
  InputAdornment
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EmailIcon from '@mui/icons-material/Email';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LanguageIcon from '@mui/icons-material/Language';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

// Sidebar navigation icons
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PeopleIcon from '@mui/icons-material/People';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import GroupsIcon from '@mui/icons-material/Groups';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import MapIcon from '@mui/icons-material/Map';
import BarChartIcon from '@mui/icons-material/BarChart';
import ExploreIcon from '@mui/icons-material/Explore';
import PaidIcon from '@mui/icons-material/Paid';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import SecurityIcon from '@mui/icons-material/Security';
import TuneIcon from '@mui/icons-material/Tune';

import { setLogoutConfirmOpen } from '../../store/slices/authSlice';

const drawerWidthExpanded = 260;
const drawerWidthCollapsed = 70;

const DashboardLayout = ({
  children,
  currentTab,
  setCurrentTab,
  themeMode,
  toggleThemeMode,
  notifications = [],
  onOpenNotifications
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { user } = useSelector((state) => state.auth);

  const [time, setTime] = useState(new Date());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [anchorElProfile, setAnchorElProfile] = useState(null);
  const [anchorElLang, setAnchorElLang] = useState(null);
  const [language, setLanguage] = useState('EN');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    dispatch(setLogoutConfirmOpen(true));
  };

  const menuItems = [
    { label: 'Dashboard', icon: <SpaceDashboardIcon />, value: 0 },
    { label: 'Deliveries', icon: <LocalShippingIcon />, value: 1 },
    { label: 'Drivers', icon: <PeopleIcon />, value: 2 },
    { label: 'Vehicles', icon: <DirectionsCarIcon />, value: 3 },
    { label: 'Customers', icon: <GroupsIcon />, value: 4 },
    { label: 'Rejections', icon: <AdminPanelSettingsIcon />, value: 5 },
    { label: 'Analytics', icon: <BarChartIcon />, value: 6 },
    { label: 'Live Fleet Tracking', icon: <ExploreIcon />, value: 7 },
    { label: 'Payments', icon: <PaidIcon />, value: 8 },
    { label: 'Support Tickets', icon: <ConfirmationNumberIcon />, value: 9 },
    { label: 'Reports', icon: <AssessmentIcon />, value: 10 },
    { label: 'Settings', icon: <SettingsIcon />, value: 11 },
    { label: 'Audit Logs', icon: <SecurityIcon />, value: 12 },
    { label: 'System Config', icon: <TuneIcon />, value: 13 }
  ];

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: themeMode === 'light' ? '#F8FAFC' : '#0F172A', color: themeMode === 'light' ? '#1E293B' : '#F8FAFC' }}>
      
      {/* TOP HEADER NAVIGATION BAR */}
      <AppBar
        position="fixed"
        sx={{
          width: isMobile 
            ? '100%' 
            : `calc(100% - ${sidebarCollapsed ? drawerWidthCollapsed : drawerWidthExpanded}px)`,
          ml: isMobile 
            ? 0 
            : `${sidebarCollapsed ? drawerWidthCollapsed : drawerWidthExpanded}px`,
          backgroundColor: themeMode === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${themeMode === 'light' ? '#E2E8F0' : 'rgba(255, 255, 255, 0.08)'}`,
          boxShadow: 'none',
          color: themeMode === 'light' ? '#1E293B' : '#F8FAFC',
          zIndex: theme.zIndex.drawer + 1,
          transition: 'width 0.2s ease-in-out, margin-left 0.2s ease-in-out'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
          
          {/* Collapse sidebar and global search */}
          <Box display="flex" alignItems="center" gap={2} sx={{ flexGrow: 1 }}>
            {!isMobile && (
              <IconButton onClick={() => setSidebarCollapsed(!sidebarCollapsed)} size="small" sx={{ border: `1px solid ${themeMode === 'light' ? '#E2E8F0' : 'rgba(255,255,255,0.08)'}` }}>
                {sidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </IconButton>
            )}
            
            <TextField
              placeholder="Search Deliveries, Drivers, Shipments..."
              size="small"
              sx={{
                width: { xs: 150, sm: 260, md: 320 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '20px',
                  bgcolor: themeMode === 'light' ? '#F1F5F9' : 'rgba(255,255,255,0.03)'
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
          </Box>

          <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 2 }}>
            
            {/* Clock ticker */}
            <Typography variant="body2" sx={{ display: { xs: 'none', lg: 'inline-block' }, color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem', bgcolor: themeMode === 'light' ? '#EDF2F7' : 'rgba(255, 255, 255, 0.05)', px: 1.5, py: 0.5, borderRadius: 2 }}>
              {time.toLocaleDateString([], { month: 'short', day: 'numeric' })} • {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Typography>

            {/* Dark / Light Toggle */}
            <IconButton onClick={toggleThemeMode} color="inherit">
              {themeMode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>

            {/* Language Selector */}
            <IconButton onClick={(e) => setAnchorElLang(e.currentTarget)} color="inherit" sx={{ gap: 0.5 }}>
              <LanguageIcon fontSize="small" />
              <Typography variant="caption" sx={{ fontWeight: 800 }}>{language}</Typography>
            </IconButton>
            <Menu
              anchorEl={anchorElLang}
              open={Boolean(anchorElLang)}
              onClose={() => setAnchorElLang(null)}
              PaperProps={{ sx: { borderRadius: '8px', mt: 1 } }}
            >
              <MenuItem onClick={() => { setLanguage('EN'); setAnchorElLang(null); }}>English</MenuItem>
              <MenuItem onClick={() => { setLanguage('ES'); setAnchorElLang(null); }}>Spanish</MenuItem>
              <MenuItem onClick={() => { setLanguage('HI'); setAnchorElLang(null); }}>Hindi</MenuItem>
            </Menu>

            {/* Notifications panel */}
            <IconButton color="inherit" onClick={onOpenNotifications}>
              <Badge badgeContent={unreadNotifCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 24, my: 'auto' }} />

            {/* Profile Menus */}
            <Box display="flex" alignItems="center" gap={1} onClick={(e) => setAnchorElProfile(e.currentTarget)} sx={{ cursor: 'pointer' }}>
              <Avatar sx={{ bgcolor: '#2563EB', width: 36, height: 36, fontSize: '0.95rem', fontWeight: 800 }}>
                {user?.name?.charAt(0).toUpperCase() || 'SA'}
              </Avatar>
              <Box display={{ xs: 'none', lg: 'block' }}>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                  {user?.name || 'Super Admin'}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: -0.5, textTransform: 'capitalize' }}>
                  {user?.role}
                </Typography>
              </Box>
            </Box>

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
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {user?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {user?.email}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => { setCurrentTab(11); setAnchorElProfile(null); }}>
                <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="System Settings" />
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <ListItemIcon><ExitToAppIcon fontSize="small" color="error" /></ListItemIcon>
                <ListItemText primary="Sign Out" />
              </MenuItem>
            </Menu>

          </Box>
        </Toolbar>
      </AppBar>

      {/* COLLAPSIBLE DRAWER SIDEBAR */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: sidebarCollapsed ? drawerWidthCollapsed : drawerWidthExpanded,
            flexShrink: 0,
            transition: 'width 0.2s ease-in-out',
            [`& .MuiDrawer-paper`]: {
              width: sidebarCollapsed ? drawerWidthCollapsed : drawerWidthExpanded,
              boxSizing: 'border-box',
              backgroundColor: themeMode === 'light' ? '#FFFFFF' : '#0F172A',
              borderRight: `1px solid ${themeMode === 'light' ? '#E2E8F0' : 'rgba(255, 255, 255, 0.08)'}`,
              transition: 'width 0.2s ease-in-out',
              overflowX: 'hidden'
            }
          }}
        >
          <Toolbar sx={{ py: 3, px: 2, display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 900,
                background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: sidebarCollapsed ? 'none' : 'block'
              }}
            >
              TrackFlow
            </Typography>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: '#2563EB',
                display: sidebarCollapsed ? 'flex' : 'none',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                fontWeight: 900
              }}
            >
              T
            </Box>
          </Toolbar>
          <Divider />

          <List sx={{ px: 1, overflowY: 'auto', flexGrow: 1, '&::-webkit-scrollbar': { width: '4px' } }}>
            {menuItems.map((item) => (
              <ListItem key={item.value} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={currentTab === item.value}
                  onClick={() => setCurrentTab(item.value)}
                  sx={{
                    borderRadius: '8px',
                    py: 1.1,
                    px: sidebarCollapsed ? 1.5 : 2,
                    color: currentTab === item.value ? '#2563EB' : 'text.secondary',
                    justifyContent: sidebarCollapsed ? 'center' : 'initial',
                    '&.Mui-selected': {
                      backgroundColor: themeMode === 'light' ? 'rgba(37, 99, 235, 0.08)' : 'rgba(37, 99, 235, 0.15)',
                      color: '#2563EB',
                      borderLeft: '4px solid #2563EB',
                      borderRadius: '0 8px 8px 0',
                      ml: -1,
                      pl: sidebarCollapsed ? 1.5 : 2.5
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: currentTab === item.value ? '#2563EB' : 'text.secondary', minWidth: sidebarCollapsed ? 0 : 36, justifyContent: 'center' }}>
                    {item.icon}
                  </ListItemIcon>
                  {!sidebarCollapsed && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: '0.85rem',
                        fontWeight: currentTab === item.value ? 700 : 500
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </List>

        </Drawer>
      )}

      {/* MAIN VIEW CONTROLLER */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2.5, sm: 3, md: 4 },
          pt: { xs: 10, md: 11 },
          width: isMobile 
            ? '100%' 
            : `calc(100% - ${sidebarCollapsed ? drawerWidthCollapsed : drawerWidthExpanded}px)`,
          transition: 'all 0.2s ease-in-out'
        }}
      >
        {children}
      </Box>

    </Box>
  );
};

export default DashboardLayout;
