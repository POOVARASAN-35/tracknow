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
  Divider
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { registerUser, reset } from '../store/slices/authSlice';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');

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
    setValidationError('');

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return;
    }

    dispatch(registerUser({ name, email, password, role: 'customer' }));
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
          {/* Logo Header */}
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
              Register
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Create a TrackNow Customer Account
            </Typography>
          </Box>

          {(isError || validationError) && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {validationError || message || 'Registration failed. Try again.'}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Full Name"
              type="text"
              fullWidth
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
              placeholder="John Doe"
            />

            <TextField
              label="Email Address"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
              placeholder="john@example.com"
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
              placeholder="••••••••"
            />

            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{ mb: 3 }}
              InputLabelProps={{ shrink: true }}
              placeholder="••••••••"
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
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
            </Button>
          </form>

          <Box display="flex" justifyContent="center" mt={3}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Already have an account?{' '}
              <Typography
                component={Link}
                to="/login"
                sx={{
                  color: '#00e5ff',
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Sign In
              </Typography>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
export { Register };
