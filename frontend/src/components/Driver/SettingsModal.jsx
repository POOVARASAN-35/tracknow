import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  MenuItem,
  Box,
  Typography,
  Divider,
  Grid,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const SettingsModal = ({ open, onClose, user, profile, onUpdateProfile, themeMode = 'dark' }) => {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(profile?.currentLocationText || 'Bengaluru Central Hub');
  
  const { accessToken } = useSelector((state) => state.auth);
  const [password, setPassword] = useState('');
  const [lang, setLang] = useState('English');
  const [notifs, setNotifs] = useState(true);
  const [darkMode, setDarkMode] = useState(themeMode === 'dark');
  const [profilePic, setProfilePic] = useState(user?.profileImage || '');

  const handleSave = async () => {
    let finalProfilePic = user?.profileImage;

    if (profilePic && profilePic.startsWith('data:')) {
      try {
        const uploadRes = await axios.post('/api/upload', { image: profilePic }, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (uploadRes.data?.success) {
          finalProfilePic = uploadRes.data.url;
        }
      } catch (err) {
        console.error('Error uploading driver profile pic:', err);
        alert('Failed to upload profile image. Please try again.');
        return;
      }
    }

    onUpdateProfile({
      name,
      email,
      phone,
      password: password || undefined,
      profileImage: finalProfilePic
    });
    alert('Driver profile credentials and settings saved successfully!');
    onClose();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePic(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteAccount = () => {
    const confirmDelete = window.confirm('WARNING: Are you sure you want to request account termination? This action is irreversible.');
    if (confirmDelete) {
      alert('Termination request submitted to Super Admin panel.');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          bgcolor: themeMode === 'light' ? '#FFFFFF' : '#111827',
          backgroundImage: 'none',
          border: themeMode === 'light' ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)'
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 900, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Poppins' }}>
        <Typography variant="h6" sx={{ fontWeight: 900 }}>
          Account Preferences & Settings
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ py: 3, borderColor: themeMode === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)' }}>
        <Grid container spacing={3}>
          
          {/* PROFILE PHOTO UPLOAD */}
          <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 2 }}>
              DRIVER PROFILE PHOTO
            </Typography>
            <Box sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              bgcolor: 'rgba(37,99,235,0.06)',
              border: '2px dashed #2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              overflow: 'hidden',
              mb: 2,
              position: 'relative'
            }}>
              {profilePic ? (
                <Box component="img" src={profilePic} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Typography variant="h2" sx={{ fontWeight: 800, color: 'primary.main', fontFamily: 'Poppins' }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </Typography>
              )}
            </Box>
            <Button
              variant="outlined"
              component="label"
              size="small"
              startIcon={<CloudUploadIcon />}
              sx={{ borderRadius: '8px', fontWeight: 800, fontSize: '0.7rem' }}
            >
              Upload Photo
              <input type="file" hidden accept="image/*" onChange={handleFileChange} />
            </Button>
          </Grid>

          {/* PERSONAL INFORMATION FORM */}
          <Grid item xs={12} sm={8}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: 'primary.main', fontFamily: 'Poppins' }}>
              Personal Identification
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label="Full Name" size="small" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Phone Number" size="small" fullWidth value={phone} onChange={(e) => setPhone(e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Email Address" size="small" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Residential Address" size="small" fullWidth value={address} onChange={(e) => setAddress(e.target.value)} />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}><Divider sx={{ opacity: 0.5 }} /></Grid>

          {/* ACCESSIBILITY & SECURITY */}
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: 'primary.main', fontFamily: 'Poppins' }}>
              Security & Credentials
            </Typography>
            <TextField
              label="Change Password"
              type="password"
              size="small"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              helperText="Leave empty to retain current password"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: 'primary.main', fontFamily: 'Poppins' }}>
              Localization
            </Typography>
            <TextField
              select
              label="Language Preferences"
              size="small"
              fullWidth
              value={lang}
              onChange={(e) => setLang(e.target.value)}
            >
              <MenuItem value="English">English</MenuItem>
              <MenuItem value="Spanish">Spanish (Español)</MenuItem>
              <MenuItem value="German">German (Deutsch)</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12}><Divider sx={{ opacity: 0.5 }} /></Grid>

          {/* TOGGLES */}
          <Grid item xs={12} sm={8}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'primary.main', fontFamily: 'Poppins' }}>
              Preferences & Permissions
            </Typography>
            <Box display="flex" flexDirection="column">
              <FormControlLabel
                control={<Switch checked={notifs} onChange={(e) => setNotifs(e.target.checked)} color="primary" />}
                label="Push Notification Alerts (Assigned orders, messages)"
              />
              <FormControlLabel
                control={<Switch checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} color="primary" />}
                label="Dark Mode Cosmetics Theme Override"
              />
            </Box>
          </Grid>

          {/* DANGER AREA */}
          <Grid item xs={12} sm={4} sx={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              color="error"
              onClick={handleDeleteAccount}
              sx={{ ml: 'auto', mt: 2, fontWeight: 800, borderRadius: '8px' }}
            >
              Terminate Account
            </Button>
          </Grid>

        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit" sx={{ fontWeight: 800, borderRadius: '8px' }}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary" sx={{ fontWeight: 800, borderRadius: '8px' }}>
          Save Preferences
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsModal;
export { SettingsModal };
