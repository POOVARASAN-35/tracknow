import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  TextField,
  Avatar,
  Divider,
  ListItemIcon,
  useTheme,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MapIcon from '@mui/icons-material/Map';
import { setLogoutConfirmOpen } from '../../store/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';

// Nav Icons
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from '@mui/icons-material/Person';
import BarChartIcon from '@mui/icons-material/BarChart';
import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import SettingsIcon from '@mui/icons-material/Settings';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const drawerWidth = 280;

const DashboardLayout = ({
  children,
  onSearch,
  currentThemeMode,
  onToggleTheme,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  currentTab,
  setCurrentTab
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { user } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const cartCount = cart?.items?.length || 0;

  const [searchVal, setSearchVal] = useState('');
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleProfileOpen = (e) => {
    setProfileAnchor(e.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchor(null);
  };

  const handleLogout = () => {
    handleProfileClose();
    dispatch(setLogoutConfirmOpen(true));
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch && searchVal.trim()) {
      onSearch(searchVal.trim());
    }
  };

  const navItems = [
    { label: 'Dashboard', icon: <SpaceDashboardIcon fontSize="small" />, value: 0 },
    { label: 'My Orders', icon: <ListAltIcon fontSize="small" />, value: 1 },
    { label: 'History', icon: <HistoryIcon fontSize="small" />, value: 2 },
    { label: 'Profile & Saved Locations', icon: <PersonIcon fontSize="small" />, value: 3 },
    { label: 'Analytics', icon: <BarChartIcon fontSize="small" />, value: 4 },
    { label: 'Billing Logs', icon: <ReceiptLongIcon fontSize="small" />, value: 5 },
    { label: 'Support Center', icon: <HelpCenterIcon fontSize="small" />, value: 6 },
    { label: 'Settings', icon: <SettingsIcon fontSize="small" />, value: 7 },
    { label: 'Browse Products', icon: <StorefrontIcon fontSize="small" />, value: 8 },
    { label: 'Cart & Checkout', icon: (
      <Badge badgeContent={cartCount} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', height: 16, minWidth: 16 } }}>
        <ShoppingCartIcon fontSize="small" />
      </Badge>
    ), value: 9 }
  ];

  const renderDrawerContent = () => (
    <Box display="flex" flexDirection="column" height="100%" sx={{ bgcolor: currentThemeMode === 'light' ? '#ffffff' : '#0f1424' }}>
      {/* Brand Logo Header */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box 
          component={motion.div}
          whileHover={{ rotate: 15 }}
          display="flex" 
          alignItems="center" 
          justifyContent="center"
          sx={{ 
            width: 40, 
            height: 40, 
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
          }}
        >
          <MapIcon />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '0.03em', background: 'linear-gradient(90deg, #2563EB 0%, #10B981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.2 }}>
            TrackFlow
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.625rem', letterSpacing: '0.05em' }}>
            Customer Portal
          </Typography>
        </Box>
      </Box>
      
      <Divider sx={{ borderColor: currentThemeMode === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.08)' }} />
      
      {/* Navigation List */}
      <Box display="flex" flexDirection="column" justifyContent="space-between" height="100%" py={2}>
        <List sx={{ px: 1.5 }}>
          {navItems.map((item) => {
            const isSelected = currentTab === item.value;
            return (
              <ListItem key={item.value} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => {
                    setCurrentTab(item.value);
                    if (isMobile) setMobileOpen(false);
                  }}
                  sx={{
                    borderRadius: '10px',
                    py: 1.25,
                    px: 2,
                    color: isSelected 
                      ? (currentThemeMode === 'light' ? '#2563EB' : '#00e5ff') 
                      : 'text.secondary',
                    backgroundColor: isSelected 
                      ? (currentThemeMode === 'light' ? 'rgba(37, 99, 235, 0.08)' : 'rgba(0, 229, 255, 0.15)') 
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: currentThemeMode === 'light' ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.04)',
                      color: currentThemeMode === 'light' ? '#1e293b' : '#f3f4f6'
                    },
                    '&.Mui-selected': {
                      borderLeft: `4px solid ${currentThemeMode === 'light' ? '#2563EB' : '#00e5ff'}`,
                      borderRadius: '0 10px 10px 0',
                      ml: -1.5,
                      pl: 2.25,
                      backgroundColor: currentThemeMode === 'light' ? 'rgba(37, 99, 235, 0.08)' : 'rgba(0, 229, 255, 0.12)',
                      color: currentThemeMode === 'light' ? '#2563EB' : '#00e5ff',
                      '&:hover': {
                        backgroundColor: currentThemeMode === 'light' ? 'rgba(37, 99, 235, 0.12)' : 'rgba(0, 229, 255, 0.18)'
                      }
                    }
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: isSelected 
                      ? (currentThemeMode === 'light' ? '#2563EB' : '#00e5ff') 
                      : 'text.secondary', 
                    minWidth: 36 
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.825rem',
                      fontWeight: isSelected ? 800 : 600,
                      letterSpacing: '0.01em'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {/* Sidebar Footer Logout */}
        <List sx={{ px: 1.5 }}>
          <ListItem disablePadding>
            <ListItemButton 
              onClick={handleLogout} 
              sx={{ 
                borderRadius: '10px', 
                py: 1.25, 
                px: 2, 
                color: '#EF4444',
                '&:hover': {
                  backgroundColor: 'rgba(239, 68, 68, 0.08)'
                }
              }}
            >
              <ListItemIcon sx={{ color: '#EF4444', minWidth: 36 }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{
                  fontSize: '0.825rem',
                  fontWeight: 700
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: currentThemeMode === 'light' ? '#f1f5f9' : '#070a13' }}>
      
      {/* Sidebar Navigation - Drawer */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }} // Better open performance on mobile
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: `1px solid ${currentThemeMode === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.08)'}`
            }
          }}
        >
          {renderDrawerContent()}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: `1px solid ${currentThemeMode === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.08)'}`
            }
          }}
          open
        >
          {renderDrawerContent()}
        </Drawer>
      )}

      {/* Main Content Area */}
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        width: isMobile ? '100%' : `calc(100% - ${drawerWidth}px)`,
        ml: isMobile ? 0 : 0, // Handled automatically by Flexbox layout
        transition: 'all 0.3s'
      }}>
        {/* Header App Bar */}
        <AppBar position="sticky" sx={{ 
          background: currentThemeMode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(15, 20, 36, 0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${currentThemeMode === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.08)'}`,
          boxShadow: 'none',
          color: currentThemeMode === 'light' ? '#0f172a' : '#f8fafc',
          zIndex: 1100
        }}>
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: 2 }}>
            {/* Left brand toggle or title */}
            <Box display="flex" alignItems="center" gap={1}>
              {isMobile && (
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 1 }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              
              {!isMobile && (
                <Typography variant="h6" sx={{ fontWeight: 800, color: currentThemeMode === 'light' ? '#1E293B' : '#F8FAFC' }}>
                  Customer Dashboard
                </Typography>
              )}
            </Box>

            {/* Search Box */}
            <Box component="form" onSubmit={handleSearchSubmit} display="flex" alignItems="center" sx={{ 
              bgcolor: currentThemeMode === 'light' ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              px: 2,
              py: 0.5,
              width: { xs: '150px', sm: '300px' },
              border: `1px solid ${currentThemeMode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'}`,
              transition: 'all 0.3s',
              '&:hover': {
                borderColor: '#2563EB'
              }
            }}>
              <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
              <TextField
                variant="standard"
                placeholder="Search Tracking ID..."
                fullWidth
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                InputProps={{ disableUnderline: true }}
                sx={{ input: { color: 'inherit', fontSize: '0.875rem' } }}
              />
            </Box>

            {/* Right Actions */}
            <Box display="flex" alignItems="center" gap={1.5}>
              {/* Dark/Light mode toggle */}
              <IconButton onClick={onToggleTheme} sx={{ color: 'inherit' }}>
                {currentThemeMode === 'light' ? <DarkModeIcon /> : <LightModeIcon sx={{ color: '#F59E0B' }} />}
              </IconButton>

              {/* Notification Icon */}
              <IconButton onClick={onOpenNotifications} sx={{ color: 'inherit' }}>
                <Badge badgeContent={unreadNotificationsCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              {/* User Profile */}
              <IconButton onClick={handleProfileOpen} sx={{ p: 0.5 }}>
                <Avatar 
                  src={user?.profileImage}
                  sx={{ 
                    bgcolor: '#2563EB', 
                    width: 36, 
                    height: 36,
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    border: `2px solid ${currentThemeMode === 'light' ? '#2563EB' : '#1e40af'}`
                  }}
                >
                  {!user?.profileImage && (user?.name?.slice(0, 2).toUpperCase() || 'US')}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={profileAnchor}
                open={Boolean(profileAnchor)}
                onClose={handleProfileClose}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    minWidth: 200,
                    bgcolor: currentThemeMode === 'light' ? '#ffffff' : '#0f1424',
                    backgroundImage: 'none',
                    border: `1px solid ${currentThemeMode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'}`,
                    borderRadius: '12px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <Box px={2} py={1.5}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {user?.name || 'Customer'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {user?.email || 'customer@trackflow.com'}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ py: 1.25, color: '#EF4444' }}>
                  <ListItemIcon sx={{ color: '#EF4444' }}>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Main Route Content View */}
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
