import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Box,
  TextField,
  MenuItem
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import LanguageIcon from '@mui/icons-material/Language';
import DirectionsIcon from '@mui/icons-material/Directions';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { setLogoutConfirmOpen } from '../../store/slices/authSlice';

const SettingsPage = ({
  themeMode = 'light',
  toggleThemeMode,
  settings = {
    notificationsEnabled: true,
    locationPermission: true,
    autoNavigation: false,
    language: 'English'
  },
  onUpdateSettings
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(setLogoutConfirmOpen(true));
  };

  const handleToggle = (settingKey) => {
    onUpdateSettings({
      ...settings,
      [settingKey]: !settings[settingKey]
    });
  };

  const handleLanguageChange = (e) => {
    onUpdateSettings({
      ...settings,
      language: e.target.value
    });
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Card
        sx={{
          borderRadius: '16px',
          bgcolor: themeMode === 'light' ? '#FFFFFF' : '#1E293B',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          border: themeMode === 'light' ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.08)',
          p: 2
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
            Portal Preferences
          </Typography>

          <List sx={{ p: 0 }}>
            {/* Dark Mode Preference */}
            <ListItem sx={{ px: 0, py: 1.5 }}>
              <ListItemIcon><DarkModeIcon color="primary" /></ListItemIcon>
              <ListItemText
                primary="Dark Mode Theme"
                secondary="Toggle between dark-cosmic and light-minimal aesthetics"
                primaryTypographyProps={{ variant: 'body2', fontWeight: 700 }}
              />
              <Switch
                edge="end"
                checked={themeMode === 'dark'}
                onChange={toggleThemeMode}
                color="primary"
              />
            </ListItem>
            <Divider />

            {/* Notification Alerts */}
            <ListItem sx={{ px: 0, py: 1.5 }}>
              <ListItemIcon><NotificationsIcon color="primary" /></ListItemIcon>
              <ListItemText
                primary="Push Notification Alerts"
                secondary="Receive real-time notifications for new shipments, admin alerts, and route changes"
                primaryTypographyProps={{ variant: 'body2', fontWeight: 700 }}
              />
              <Switch
                edge="end"
                checked={settings.notificationsEnabled}
                onChange={() => handleToggle('notificationsEnabled')}
                color="primary"
              />
            </ListItem>
            <Divider />

            {/* Location Tracking Scopes */}
            <ListItem sx={{ px: 0, py: 1.5 }}>
              <ListItemIcon><GpsFixedIcon color="primary" /></ListItemIcon>
              <ListItemText
                primary="Browser Location Tracking"
                secondary="Enable real-time background location updates every 5 seconds"
                primaryTypographyProps={{ variant: 'body2', fontWeight: 700 }}
              />
              <Switch
                edge="end"
                checked={settings.locationPermission}
                onChange={() => handleToggle('locationPermission')}
                color="primary"
              />
            </ListItem>
            <Divider />

            {/* Auto Navigation */}
            <ListItem sx={{ px: 0, py: 1.5 }}>
              <ListItemIcon><DirectionsIcon color="primary" /></ListItemIcon>
              <ListItemText
                primary="Auto-Launch Navigation"
                secondary="Automatically open maps view when starting delivery"
                primaryTypographyProps={{ variant: 'body2', fontWeight: 700 }}
              />
              <Switch
                edge="end"
                checked={settings.autoNavigation}
                onChange={() => handleToggle('autoNavigation')}
                color="primary"
              />
            </ListItem>
            <Divider />

            {/* Language Preferences */}
            <ListItem sx={{ px: 0, py: 2.5 }}>
              <ListItemIcon><LanguageIcon color="primary" /></ListItemIcon>
              <ListItemText
                primary="Language"
                secondary="Select your preferred application display language"
                primaryTypographyProps={{ variant: 'body2', fontWeight: 700 }}
                sx={{ mr: 2 }}
              />
              <TextField
                select
                size="small"
                value={settings.language || 'English'}
                onChange={handleLanguageChange}
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="English">English</MenuItem>
                <MenuItem value="Spanish">Spanish</MenuItem>
                <MenuItem value="Hindi">Hindi</MenuItem>
                <MenuItem value="Kannada">Kannada</MenuItem>
                <MenuItem value="Tamil">Tamil</MenuItem>
              </TextField>
            </ListItem>
            <Divider sx={{ mb: 4 }} />

            {/* Sign Out Trigger */}
            <ListItem sx={{ px: 0, py: 0 }}>
              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<ExitToAppIcon />}
                onClick={handleLogout}
                sx={{ py: 1.5, borderRadius: '8px', fontWeight: 700 }}
              >
                Sign Out from TrackFlow Portal
              </Button>
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SettingsPage;
export { SettingsPage };
