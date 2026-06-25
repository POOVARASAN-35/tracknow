import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Alert
} from '@mui/material';
import PageHeader from '../components/Common/PageHeader';
import { setSessionTimedOut } from '../store/slices/authSlice';

const Settings = () => {
  const dispatch = useDispatch();
  const [trackingInterval, setTrackingInterval] = useState(
    localStorage.getItem('sys_tracking_interval') || '5'
  );
  const [fuelMultiplier, setFuelMultiplier] = useState(
    localStorage.getItem('sys_fuel_multiplier') || '0.12'
  );
  const [baseDeliveryFare, setBaseDeliveryFare] = useState(
    localStorage.getItem('sys_base_fare') || '15'
  );
  const [distanceFareRate, setDistanceFareRate] = useState(
    localStorage.getItem('sys_distance_rate') || '1.8'
  );
  const [enableSoundAlerts, setEnableSoundAlerts] = useState(
    localStorage.getItem('sys_enable_sound') === 'true'
  );
  const [enableSmsAlerts, setEnableSmsAlerts] = useState(
    localStorage.getItem('sys_enable_sms') === 'true'
  );

  const [saved, setSaved] = useState(false);

  const handleSimulateTimeout = () => {
    dispatch(setSessionTimedOut(true));
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('sys_tracking_interval', trackingInterval);
    localStorage.setItem('sys_fuel_multiplier', fuelMultiplier);
    localStorage.setItem('sys_base_fare', baseDeliveryFare);
    localStorage.setItem('sys_distance_rate', distanceFareRate);
    localStorage.setItem('sys_enable_sound', enableSoundAlerts);
    localStorage.setItem('sys_enable_sms', enableSmsAlerts);

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Box>
      <PageHeader title="System Settings" subtitle="Configure platform variables, alerts, and fuel metrics" />

      {saved && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          System settings updated successfully!
        </Alert>
      )}

      <Card sx={{ maxWidth: 700 }}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSave}>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 700, mb: 3 }}>
              Telemetry & Caching
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="GPS Position Update Interval (seconds)"
                  type="number"
                  fullWidth
                  value={trackingInterval}
                  onChange={(e) => setTrackingInterval(e.target.value)}
                  helperText="Default recommended setting is 5 seconds."
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h6" color="primary" sx={{ fontWeight: 700, mb: 3 }}>
              Financial & Cost Calculators
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Base Order Fare ($)"
                  type="number"
                  fullWidth
                  value={baseDeliveryFare}
                  onChange={(e) => setBaseDeliveryFare(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Distance Fare Rate ($ per KM)"
                  type="number"
                  step="0.1"
                  fullWidth
                  value={distanceFareRate}
                  onChange={(e) => setDistanceFareRate(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Fuel Cost Factor ($ per KM)"
                  type="number"
                  step="0.01"
                  fullWidth
                  value={fuelMultiplier}
                  onChange={(e) => setFuelMultiplier(e.target.value)}
                  helperText="Calculated on diesel fuel average."
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h6" color="primary" sx={{ fontWeight: 700, mb: 3 }}>
              Notification Alerts Routing
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={enableSoundAlerts}
                      onChange={(e) => setEnableSoundAlerts(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Enable browser ping sound on critical geofence breach"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={enableSmsAlerts}
                      onChange={(e) => setEnableSmsAlerts(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Send SMS notifications to customers on pickup & transit start"
                />
              </Grid>
            </Grid>

            <Box mt={4} display="flex" justifyContent="flex-end">
              <Button type="submit" variant="contained" color="primary" size="large">
                Save Settings
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      <Card sx={{ maxWidth: 700, mt: 4, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" color="error" sx={{ fontWeight: 700, mb: 1 }}>
            Developer Sandbox Tools
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Use the simulator below to mock authentication, timeout events, and test boundary conditions.
          </Typography>
          <Button
            variant="outlined"
            color="error"
            onClick={handleSimulateTimeout}
            sx={{
              fontWeight: 700,
              borderColor: '#ef4444',
              color: '#ef4444',
              '&:hover': {
                borderColor: '#dc2626',
                backgroundColor: 'rgba(239, 68, 68, 0.05)'
              }
            }}
          >
            Simulate Session Timeout
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Settings;
export { Settings };
