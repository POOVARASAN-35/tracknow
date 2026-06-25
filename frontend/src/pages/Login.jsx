import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { loginUser, reset } from '../store/slices/authSlice';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
    return () => {
      dispatch(reset());
    };
  }, [user, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    dispatch(loginUser({ email, password }));
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        position: 'relative',
        backgroundColor: '#070a13',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-20%',
          left: '-20%',
          width: '60%',
          height: '60%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,229,255,0.08) 0%, rgba(7,10,19,0) 70%)',
          pointerEvents: 'none'
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-20%',
          right: '-20%',
          width: '60%',
          height: '60%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, rgba(7,10,19,0) 70%)',
          pointerEvents: 'none'
        }
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 420, m: 2, zIndex: 1 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Logo Brand Header */}
          <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              width={56}
              height={56}
              borderRadius="50%"
              sx={{
                background: 'linear-gradient(135deg, #00e5ff 0%, #6366f1 100%)',
                mb: 2,
                boxShadow: '0 4px 20px 0 rgba(0, 229, 255, 0.3)'
              }}
            >
              <LocalShippingIcon sx={{ fontSize: 28, color: '#070a13' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '0.02em', mb: 0.5 }}>
              TrackNow
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Live Fleet & Logistics Portal
            </Typography>
          </Box>

          {isError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {message || 'Invalid credentials. Please check details.'}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2.5 }}
              InputLabelProps={{ shrink: true }}
              placeholder="name@company.com"
            />

            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
              InputLabelProps={{ shrink: true }}
              placeholder="••••••••"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={isLoading}
              sx={{ mb: 2 }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </form>

          <Box display="flex" justifyContent="space-between" mt={3}>
            <Typography
              component={Link}
              to="/register"
              variant="caption"
              sx={{ color: '#00e5ff', textDecoration: 'none', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
            >
              Create Customer Account
            </Typography>
            <Typography
              component={Link}
              to="/forgot-password"
              variant="caption"
              sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              Forgot Password?
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Button
            component={Link}
            to="/tracking"
            variant="outlined"
            color="secondary"
            fullWidth
            sx={{ fontWeight: 600 }}
          >
            Track A Shipment
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
export { Login };
