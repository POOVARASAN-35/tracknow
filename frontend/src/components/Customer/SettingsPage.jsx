import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  FormControlLabel,
  Switch,
  TextField,
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PaletteIcon from '@mui/icons-material/Palette';
import LanguageIcon from '@mui/icons-material/Language';
import SecurityIcon from '@mui/icons-material/Security';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

const SettingsPage = ({ currentThemeMode = 'dark', onToggleTheme }) => {
  const isDark = currentThemeMode === 'dark';

  // Toggle states
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [pushAlerts, setPushAlerts] = useState(true);
  
  const [language, setLanguage] = useState('en');
  const [privacyProfile, setPrivacyProfile] = useState(true);

  // Dialog State
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  return (
    <Card sx={{ 
      p: 2, 
      bgcolor: isDark ? '#0f1424' : '#fff',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
      boxShadow: 'none'
    }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        
        {/* Notification Alerts */}
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={2}>
            <NotificationsIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Alert Notification Preferences
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" gap={1}>
            <FormControlLabel
              control={<Switch checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} />}
              label="Email delivery notifications"
            />
            <FormControlLabel
              control={<Switch checked={smsAlerts} onChange={(e) => setSmsAlerts(e.target.checked)} />}
              label="SMS delivery notifications"
            />
            <FormControlLabel
              control={<Switch checked={pushAlerts} onChange={(e) => setPushAlerts(e.target.checked)} />}
              label="Web push dashboard updates"
            />
          </Box>
        </Box>

        <Divider />

        {/* Styling/Theme */}
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={2}>
            <PaletteIcon color="secondary" />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Theme Interface Mode
            </Typography>
          </Box>
          <FormControlLabel
            control={<Switch checked={isDark} onChange={onToggleTheme} />}
            label={isDark ? 'Dark Mode Enabled (Cosmic)' : 'Light Mode Enabled (Slate)'}
          />
        </Box>

        <Divider />

        {/* Language Selection */}
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
            <LanguageIcon color="info" />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Language Selection
            </Typography>
          </Box>
          <Box maxWidth={200}>
            <TextField
              select
              size="small"
              fullWidth
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <MenuItem value="en">English (US)</MenuItem>
              <MenuItem value="es">Español</MenuItem>
              <MenuItem value="fr">Français</MenuItem>
              <MenuItem value="hi">हिन्दी</MenuItem>
            </TextField>
          </Box>
        </Box>

        <Divider />

        {/* Privacy */}
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={2}>
            <SecurityIcon color="warning" />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Privacy & Security Settings
            </Typography>
          </Box>
          <FormControlLabel
            control={<Switch checked={privacyProfile} onChange={(e) => setPrivacyProfile(e.target.checked)} />}
            label="Make profile stats visible to dispatcher services"
          />
        </Box>

        <Divider />

        {/* Danger Zone */}
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={2} sx={{ color: '#EF4444' }}>
            <DeleteForeverIcon />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Danger Zone
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            Once you delete your account, there is no going back. All delivery histories will be purged.
          </Typography>
          <Button variant="contained" color="error" onClick={() => setOpenDeleteDialog(true)}>
            Delete Account
          </Button>
        </Box>

      </CardContent>

      {/* Delete confirmation dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle sx={{ fontWeight: 800, color: '#EF4444' }}>Permanently Delete Account?</DialogTitle>
        <DialogContent sx={{ minWidth: 320, pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Are you absolutely sure you want to delete your TrackFlow account? This action is irreversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={() => setOpenDeleteDialog(false)} variant="contained" color="error">Yes, Delete</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default SettingsPage;
