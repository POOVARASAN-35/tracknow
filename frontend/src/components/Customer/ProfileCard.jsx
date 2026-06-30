import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Button, Avatar, Divider, Chip, LinearProgress, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/Download';
import LogoutIcon from '@mui/icons-material/Logout';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import QRCode from '@mui/icons-material/QrCode';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api from '../api/axios';
import { updateUser, setLogoutConfirmOpen } from '../../store/slices/authSlice';

const ProfileCard = ({ user, currentThemeMode = 'dark', onSaveProfile }) => {
  const isDark = currentThemeMode === 'dark';
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { accessToken } = useSelector((state) => state.auth);

  // Dialog States
  const [openEdit, setOpenEdit] = useState(false);
  const [openShare, setOpenShare] = useState(false);
  const [openPhoto, setOpenPhoto] = useState(false);
  const [openIDCard, setOpenIDCard] = useState(false);

  // Edit fields
  const [name, setName] = useState(user?.name || 'Jane Customer');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [email, setEmail] = useState(user?.email || 'jane@trackflow.com');
  const [dob, setDob] = useState('1995-08-12');
  const [gender, setGender] = useState('Female');

  const customerId = user?.id || user?._id || 'TF-CUST-9824';
  const memberSince = 'Jun 2026';
  const deliverySuccess = 99.4; // % successful runs
  const completionPercent = 85;

  const handleLogout = () => {
    dispatch(setLogoutConfirmOpen(true));
  };

  const handleEditSave = () => {
    if (onSaveProfile) {
      onSaveProfile({ name, phone, email, dob, gender });
    }
    setOpenEdit(false);
  };

  return (
    <Card
      component={motion.div}
      whileHover={{ y: -4, boxShadow: isDark ? '0 12px 40px rgba(0, 229, 255, 0.1)' : '0 12px 40px rgba(37, 99, 235, 0.1)' }}
      sx={{
        bgcolor: isDark ? 'rgba(15, 20, 36, 0.65)' : '#ffffff',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.08)'}`,
        borderRadius: '20px',
        boxShadow: isDark ? '0 8px 32px 0 rgba(0, 0, 0, 0.3)' : '0 8px 32px 0 rgba(0, 0, 0, 0.05)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Large Profile Picture Circle with photo overlay */}
        <Box sx={{ position: 'relative', mb: 2 }}>
          <Avatar
            src={user?.profileImage}
            sx={{
              bgcolor: '#2563EB',
              width: 110,
              height: 110,
              fontSize: '2.5rem',
              fontWeight: 800,
              border: `3px solid ${isDark ? '#00e5ff' : '#2563EB'}`,
              boxShadow: '0 8px 25px rgba(37, 99, 235, 0.3)'
            }}
          >
            {!user?.profileImage && name.slice(0, 2).toUpperCase()}
          </Avatar>
          <IconButton
            size="small"
            onClick={() => setOpenPhoto(true)}
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              bgcolor: 'primary.main',
              color: '#ffffff',
              '&:hover': { bgcolor: 'primary.dark' },
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
            }}
          >
            <PhotoCameraIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>

        {/* Customer Basic Info */}
        <Typography variant="h5" sx={{ fontWeight: 900, textAlign: 'center', mb: 0.5 }}>
          {name}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, display: 'block', mb: 1.5 }}>
          ID: {customerId}
        </Typography>

        {/* Premium verified badge */}
        <Box display="flex" gap={1} mb={3}>
          <Chip
            icon={<VerifiedUserIcon sx={{ color: '#fff !important', fontSize: '0.85rem' }} />}
            label="Verified Client"
            color="success"
            size="small"
            sx={{ fontWeight: 800, fontSize: '0.65rem', height: 22 }}
          />
          <Chip
            label="Premium Member"
            color="primary"
            size="small"
            sx={{ fontWeight: 800, fontSize: '0.65rem', height: 22, background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)' }}
          />
          {user?.loginProvider === 'google' && (
            <Chip
              icon={<CheckCircleIcon sx={{ color: '#4285F4 !important', fontSize: '0.85rem' }} />}
              label="Google Verified"
              variant="outlined"
              size="small"
              sx={{ fontWeight: 800, fontSize: '0.65rem', height: 22, color: '#4285F4', borderColor: '#4285F4' }}
            />
          )}
        </Box>

        <Divider sx={{ width: '100%', mb: 2.5, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />

        {/* Info Grid */}
        <Box width="100%" display="flex" flexDirection="column" gap={1.5} mb={3}>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Email:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {email}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Phone:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{phone}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Member Since:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{memberSince}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Account Status:</Typography>
            <Chip label="ACTIVE" color="success" size="small" variant="outlined" sx={{ fontWeight: 800, fontSize: '0.55rem', height: 16 }} />
          </Box>
        </Box>

        <Divider sx={{ width: '100%', mb: 2.5, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />

        {/* Completion Progress Bar */}
        <Box width="100%" mb={3.5}>
          <Box display="flex" justifyContent="space-between" mb={0.5}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Profile Completion</Typography>
            <Typography variant="caption" color="primary" sx={{ fontWeight: 800 }}>{completionPercent}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={completionPercent} sx={{ height: 6, borderRadius: 3, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
          
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Delivery Success:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#10B981', display: 'flex', alignItems: 'center', gap: 0.25 }}>
              <CheckCircleIcon sx={{ fontSize: 14 }} /> {deliverySuccess}%
            </Typography>
          </Box>
        </Box>

        {/* Action Button Links */}
        <Box display="flex" flexDirection="column" gap={1.25} width="100%">
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => setOpenEdit(true)}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', py: 1 }}
          >
            Edit Profile
          </Button>

          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<ShareIcon />}
                onClick={() => setOpenShare(true)}
                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', py: 0.75, fontSize: '0.75rem' }}
              >
                Share
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<DownloadIcon />}
                onClick={() => setOpenIDCard(true)}
                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', py: 0.75, fontSize: '0.75rem' }}
              >
                ID Card
              </Button>
            </Grid>
          </Grid>

          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', py: 1, mt: 1 }}
          >
            Logout
          </Button>
        </Box>
      </CardContent>

      {/* Edit Profile Dialog Form */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
        <DialogTitle sx={{ fontWeight: 800 }}>Edit Personal Details</DialogTitle>
        <DialogContent sx={{ minWidth: 320, display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Full Name"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mt: 1 }}
          />
          <TextField
            label="Email Address"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Phone Number"
            fullWidth
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Date of Birth"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Gender"
                fullWidth
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={openShare} onClose={() => setOpenShare(false)}>
        <DialogTitle sx={{ fontWeight: 800 }}>Share Profile</DialogTitle>
        <DialogContent sx={{ minWidth: 320, pt: 1 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Copy your secure profile link to share with logistic dispatchers or billing managers.
          </Typography>
          <TextField
            fullWidth
            readOnly
            value={`https://trackflow.com/customer/${customerId}`}
            InputProps={{
              endAdornment: (
                <Button size="small" variant="text" onClick={() => {
                  navigator.clipboard.writeText(`https://trackflow.com/customer/${customerId}`);
                  alert('Profile URL copied!');
                }}>
                  Copy
                </Button>
              )
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenShare(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Photo Upload Dialog */}
      <Dialog open={openPhoto} onClose={() => setOpenPhoto(false)}>
        <DialogTitle sx={{ fontWeight: 800 }}>Update Profile Photo</DialogTitle>
        <DialogContent sx={{ minWidth: 320, pt: 1, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Select a new JPG/PNG profile avatar picture. (Max size: 2MB).
          </Typography>
          <Button variant="contained" component="label" sx={{ borderRadius: '8px' }}>
            Upload Picture File
            <input type="file" hidden accept="image/*" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              if (file.size > 2 * 1024 * 1024) {
                alert('File size exceeds 2MB limit.');
                return;
              }

              const reader = new FileReader();
              reader.onloadend = async () => {
                try {
                  const base64String = reader.result;
                  
                  // 1. Upload base64 image to backend uploads API
                  const uploadRes = await api.post('/upload', { image: base64String }, {
                    headers: {
                      Authorization: `Bearer ${accessToken}`
                    }
                  });
                  
                  if (uploadRes.data?.success) {
                    const imageUrl = uploadRes.data.url;
                    
                    // 2. Persist the image url inside user customer profile
                    const saveRes = await api.put('/customer/profile', { profileImage: imageUrl }, {
                      headers: {
                        Authorization: `Bearer ${accessToken}`
                      }
                    });
                    
                    if (saveRes.data?.success) {
                      dispatch(updateUser({ profileImage: imageUrl }));
                      alert('Profile picture updated successfully!');
                      setOpenPhoto(false);
                    }
                  }
                } catch (err) {
                  console.error('Error uploading profile picture:', err.response?.data?.message || err.message);
                  if (err.response?.status === 401) {
                    alert('Your session has expired. Please logout and log back in.');
                  } else {
                    alert('Failed to upload image. Please try again.');
                  }
                }
              };
              reader.readAsDataURL(file);
            }} />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPhoto(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* ID Card Download Dialog */}
      <Dialog open={openIDCard} onClose={() => setOpenIDCard(false)}>
        <DialogTitle sx={{ fontWeight: 800 }}>Digital Client ID Card</DialogTitle>
        <DialogContent sx={{ minWidth: 320, pt: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 260,
            height: 160,
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
            color: '#fff',
            borderRadius: '12px',
            p: 2,
            position: 'relative',
            boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" sx={{ fontWeight: 900, letterSpacing: '0.15em', color: '#00ffcc' }}>TRACKFLOW CLIENT</Typography>
              <QRCode sx={{ fontSize: 24, color: '#ffffff' }} />
            </Box>
            <Box my={1}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1 }}>{name}</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.6rem' }}>Premium Logistic Partner</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="flex-end">
              <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{customerId}</Typography>
              <Typography variant="caption" sx={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.5)' }}>EXPIRES: DEC 2027</Typography>
            </Box>
          </Box>
          <Button variant="contained" onClick={() => {
            alert('Downloading client ID card PDF...');
            setOpenIDCard(false);
          }} sx={{ borderRadius: '8px' }}>
            Download Card PDF
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenIDCard(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default ProfileCard;
