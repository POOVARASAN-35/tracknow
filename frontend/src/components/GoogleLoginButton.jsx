import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Box } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { loginWithGoogle } from '../store/slices/authSlice';
import { usePortalTheme } from '../context/ThemeContext';

const GoogleLoginButton = ({ role = 'customer' }) => {
  const { t, mode } = usePortalTheme();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);
  const [showMockModal, setShowMockModal] = useState(false);
  const [mockEmail, setMockEmail] = useState(
    role === 'customer' 
      ? 'google-customer@tracknow.com' 
      : role === 'driver' 
        ? 'driver@tracknow.com' 
        : 'superadmin@tracknow.com'
  );
  const [mockName, setMockName] = useState(
    role === 'customer'
      ? 'Google Test Customer'
      : role === 'driver'
        ? 'Courier Driver'
        : 'Super Admin'
  );

  const handleGoogleLogin = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const isGoogleLoaded = window.google && window.google.accounts && window.google.accounts.oauth2;
    const hasValidClientId = clientId && clientId !== 'your_google_client_id_placeholder' && clientId !== 'YOUR_GOOGLE_CLIENT_ID';

    if (isGoogleLoaded && hasValidClientId) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile openid',
          callback: (response) => {
            if (response && response.access_token) {
              dispatch(loginWithGoogle({ token: response.access_token, role }));
            }
          },
          error_callback: (err) => {
            console.error('Google client error:', err);
            setShowMockModal(true);
          }
        });
        client.requestAccessToken();
      } catch (err) {
        console.error('Failed to init Google client:', err);
        setShowMockModal(true);
      }
    } else {
      setShowMockModal(true);
    }
  };

  const handleMockGoogleLoginSubmit = (e) => {
    e.preventDefault();
    setShowMockModal(false);
    dispatch(loginWithGoogle({
      token: `mock_token_google_${Date.now()}`,
      email: mockEmail,
      name: mockName,
      role
    }));
  };

  return (
    <>
      <Button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        sx={{
          width: '100%',
          py: 1.5,
          background: '#ffffff',
          color: '#1f2937',
          fontWeight: 700,
          textTransform: 'none',
          fontSize: '0.95rem',
          borderRadius: '24px',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            background: '#f8fafc',
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
            borderColor: 'rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-1px)'
          },
          '&:active': {
            transform: 'translateY(1px)'
          },
          '&.Mui-disabled': {
            background: 'rgba(255, 255, 255, 0.6)',
            color: 'rgba(31, 41, 55, 0.38)'
          }
        }}
      >
        {isLoading ? (
          <CircularProgress size={20} color="inherit" />
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.08H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.92l3.66-2.82z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.08l3.66 2.82c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </>
        )}
      </Button>

      {/* Mock Google Login Modal */}
      <Dialog
        open={showMockModal}
        onClose={() => setShowMockModal(false)}
        PaperProps={{
          sx: {
            background: mode === 'light' ? '#ffffff' : 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid',
            borderColor: mode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.08)',
            borderRadius: '16px',
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1, fontFamily: '"Outfit", sans-serif' }}>
          Mock Google Sign-In ({role.toUpperCase()})
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            No Google Client ID configured in environment (`VITE_GOOGLE_CLIENT_ID`). Simulating the Google account chooser for local verification.
          </Typography>
          <Box component="form" onSubmit={handleMockGoogleLoginSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Simulated Name"
              value={mockName}
              onChange={(e) => setMockName(e.target.value)}
              fullWidth
              variant="outlined"
              size="small"
              required
            />
            <TextField
              label="Simulated Email"
              type="email"
              value={mockEmail}
              onChange={(e) => setMockEmail(e.target.value)}
              fullWidth
              variant="outlined"
              size="small"
              required
            />
            <Box sx={{ mt: 1, p: 1.5, borderRadius: '8px', bgcolor: mode === 'light' ? 'rgba(37, 99, 235, 0.05)' : 'rgba(37, 99, 235, 0.15)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <GoogleIcon sx={{ color: '#EA4335', fontSize: 20 }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>
                Note: In production, the real Google OAuth2 popup will open.
              </Typography>
            </Box>
            <DialogActions sx={{ px: 0, pt: 1 }}>
              <Button onClick={() => setShowMockModal(false)} sx={{ fontWeight: 700, color: 'text.secondary' }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary" sx={{ fontWeight: 700, borderRadius: '8px' }}>
                Sign In as Mock Google User
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GoogleLoginButton;
