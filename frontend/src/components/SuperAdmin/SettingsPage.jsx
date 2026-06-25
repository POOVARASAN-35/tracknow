import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  MenuItem,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import EmailIcon from '@mui/icons-material/Email';
import StorageIcon from '@mui/icons-material/Storage';
import ApiIcon from '@mui/icons-material/Api';

const SettingsPage = ({
  settings = {},
  themeMode = 'light',
  onSaveSettings
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    jwtExpiration: '24h',
    googleMapsApiKey: '',
    redisHost: '127.0.0.1',
    redisPort: 6379,
    smtpServer: '',
    smtpPort: 587,
    smtpUser: '',
    smsGatewayUrl: '',
    notificationsEnabled: true,
    themeModeDefault: 'light',
    defaultLanguage: 'English'
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setFormData({
        jwtExpiration: settings.jwtExpiration || '24h',
        googleMapsApiKey: settings.googleMapsApiKey || '',
        redisHost: settings.redisHost || '127.0.0.1',
        redisPort: settings.redisPort || 6379,
        smtpServer: settings.smtpServer || '',
        smtpPort: settings.smtpPort || 587,
        smtpUser: settings.smtpUser || '',
        smsGatewayUrl: settings.smsGatewayUrl || '',
        notificationsEnabled: settings.notificationsEnabled !== false,
        themeModeDefault: settings.themeModeDefault || 'light',
        defaultLanguage: settings.defaultLanguage || 'English'
      });
    }
  }, [settings]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  return (
    <Box>
      <Box mb={3.5}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Global Control Room Configuration
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Configure security authorization keys, SMTP services, telemetry endpoints, and system behaviors.
        </Typography>
      </Box>

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: '12px', fontWeight: 700 }}>
          Global control settings updated and logged in security trail!
        </Alert>
      )}

      <Card
        sx={{
          borderRadius: '16px',
          border: `1px solid ${themeMode === 'light' ? '#E2E8F0' : 'rgba(255,255,255,0.06)'}`,
          bgcolor: themeMode === 'light' ? '#FFFFFF' : '#1E293B',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: themeMode === 'light' ? '#F8FAFC' : '#0F172A' }}>
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            sx={{ px: 2 }}
          >
            <Tab icon={<SettingsIcon fontSize="small" />} iconPosition="start" label="General Preferences" sx={{ fontWeight: 700, fontSize: '0.8rem', py: 2 }} />
            <Tab icon={<EmailIcon fontSize="small" />} iconPosition="start" label="SMTP Server Setup" sx={{ fontWeight: 700, fontSize: '0.8rem', py: 2 }} />
            <Tab icon={<StorageIcon fontSize="small" />} iconPosition="start" label="Database & Cache" sx={{ fontWeight: 700, fontSize: '0.8rem', py: 2 }} />
            <Tab icon={<ApiIcon fontSize="small" />} iconPosition="start" label="Third-Party APIs" sx={{ fontWeight: 700, fontSize: '0.8rem', py: 2 }} />
          </Tabs>
        </Box>

        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            {activeTab === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    name="jwtExpiration"
                    label="User Access Token Expiration (JWT)"
                    fullWidth
                    value={formData.jwtExpiration}
                    onChange={handleChange}
                  >
                    <MenuItem value="1h">1 Hour (High Security)</MenuItem>
                    <MenuItem value="12h">12 Hours</MenuItem>
                    <MenuItem value="24h">24 Hours (Standard)</MenuItem>
                    <MenuItem value="7d">7 Days</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    name="defaultLanguage"
                    label="System Standard Language"
                    fullWidth
                    value={formData.defaultLanguage}
                    onChange={handleChange}
                  >
                    <MenuItem value="English">English (EN)</MenuItem>
                    <MenuItem value="Spanish">Spanish (ES)</MenuItem>
                    <MenuItem value="Hindi">Hindi (HI)</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    name="themeModeDefault"
                    label="Default Dashboard Color Profile"
                    fullWidth
                    value={formData.themeModeDefault}
                    onChange={handleChange}
                  >
                    <MenuItem value="light">Always Light Mode</MenuItem>
                    <MenuItem value="dark">Always Dark Mode</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} display="flex" alignItems="center">
                  <FormControlLabel
                    control={
                      <Switch
                        name="notificationsEnabled"
                        checked={formData.notificationsEnabled}
                        onChange={handleChange}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>Enable Real-Time Alerts</Typography>
                        <Typography variant="caption" color="text.secondary">Send instant socket push banners to drivers and admins</Typography>
                      </Box>
                    }
                  />
                </Grid>
              </Grid>
            )}

            {activeTab === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={8}>
                  <TextField
                    name="smtpServer"
                    label="SMTP Dispatch Server Hostname"
                    fullWidth
                    value={formData.smtpServer}
                    onChange={handleChange}
                    placeholder="smtp.mailgun.org"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    name="smtpPort"
                    label="SMTP Port"
                    type="number"
                    fullWidth
                    value={formData.smtpPort}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="smtpUser"
                    label="Sender Authorization Username (Email)"
                    fullWidth
                    value={formData.smtpUser}
                    onChange={handleChange}
                    placeholder="postmaster@trackflow.com"
                  />
                </Grid>
              </Grid>
            )}

            {activeTab === 2 && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={8}>
                  <TextField
                    name="redisHost"
                    label="Redis Memory Cache Endpoint"
                    fullWidth
                    value={formData.redisHost}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    name="redisPort"
                    label="Redis Database Port"
                    type="number"
                    fullWidth
                    value={formData.redisPort}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
            )}

            {activeTab === 3 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    name="googleMapsApiKey"
                    label="Google Maps Javascript API Key"
                    type="password"
                    fullWidth
                    value={formData.googleMapsApiKey}
                    onChange={handleChange}
                    placeholder="AIzaSy..."
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="smsGatewayUrl"
                    label="SMS Alerts Notification Endpoint Gateway"
                    fullWidth
                    value={formData.smsGatewayUrl}
                    onChange={handleChange}
                    placeholder="https://api.twilio.com/v1/dispatch"
                  />
                </Grid>
              </Grid>
            )}

            <Box sx={{ mt: 5, borderTop: '1px solid', borderColor: 'divider', pt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ fontWeight: 800, borderRadius: '8px', px: 4, py: 1 }}
              >
                Save Configurations
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SettingsPage;
export { SettingsPage };
