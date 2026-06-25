import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Checkbox, FormControlLabel, Link, Alert } from '@mui/material';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import ShieldIcon from '@mui/icons-material/Shield';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SecurityIcon from '@mui/icons-material/Security';
import GoogleIcon from '@mui/icons-material/Google';

import InputField from './InputField';
import LoadingButton from './LoadingButton';
import { loginUser, loginWithGoogle, reset } from '../store/slices/authSlice';
import { usePortalTheme } from '../context/ThemeContext';
import GoogleLoginButton from './GoogleLoginButton';

const LoginForm = ({ role = 'customer' }) => {
  const { t, mode } = usePortalTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  // Error and captcha states
  const [errors, setErrors] = useState({});
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Redux auth states
  const { user, isLoading, isError, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      setLoginSuccess(true);
      // Wait for the success animation to complete before redirecting
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  useEffect(() => {
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  // Real-time Field Validation
  const validateField = (name, val) => {
    let err = '';
    if (!val) {
      err = 'This field is required';
    } else if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) err = 'Invalid email address format';
    } else if (name === 'password') {
      if (val.length < 6) err = 'Password must be at least 6 characters';


    }
    setErrors((prev) => ({ ...prev, [name]: err }));
    return !err;
  };

  const handleInputChange = (field, setter) => (e) => {
    const val = e.target.value;
    setter(val);
    if (errors[field]) {
      validateField(field, val);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Perform final validations
    const isEmailValid = validateField('email', email);
    const isPasswordValid = validateField('password', password);
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    if (!captchaVerified) {
      setErrors((prev) => ({ ...prev, captcha: 'Please verify the security captcha' }));
      return;
    }

    // Pass inputs to Redux login action
    dispatch(loginUser({ email, password, role }));
  };

  // Slider Captcha implementation variables
  const x = useMotionValue(0);
  const dragRange = 210; // Width of verification container minus slider handle width
  const opacity = useTransform(x, [0, dragRange * 0.75], [1, 0]);
  const textX = useTransform(x, [0, dragRange], [0, 20]);
  const fillWidth = useTransform(x, [0, dragRange], ['0%', '100%']);

  const handleDragEnd = () => {
    if (x.get() >= dragRange - 10) {
      setCaptchaVerified(true);
      setErrors((prev) => ({ ...prev, captcha: '' }));
    } else {
      x.set(0);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      {isError && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: '12px', fontWeight: 600 }}>
          {message || 'Authentication failed. Please check details.'}
        </Alert>
      )}



      {/* Email / Username Input */}
      <InputField
        label={t('emailPhone')}
        placeholder="name@company.com"
        value={email}
        onChange={handleInputChange('email', setEmail)}
        onBlur={() => validateField('email', email)}
        error={errors.email}
        startIcon={<EmailIcon />}
        type="email"
        required
      />

      {/* Password Input */}
      <InputField
        label={t('password')}
        placeholder="••••••••"
        value={password}
        onChange={handleInputChange('password', setPassword)}
        onBlur={() => validateField('password', password)}
        error={errors.password}
        startIcon={<LockIcon />}
        type="password"
        required
      />



      {/* Remember me & Forgot Password */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              color="primary"
              size="small"
              sx={{ '&.Mui-checked': { color: 'primary.main' } }}
            />
          }
          label={
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', userSelect: 'none' }}>
              {role === 'customer' ? t('rememberMe') : t('rememberDevice')}
            </Typography>
          }
        />
        <Typography
          component={Link}
          href="/forgot-password"
          variant="body2"
          sx={{
            fontWeight: 700,
            color: 'primary.main',
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          {t('forgotPassword')}
        </Typography>
      </Box>

      {/* Slide-to-Verify Security Captcha */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: errors.captcha ? 'error.main' : 'text.secondary', mb: 1, display: 'block' }}>
          {t('captcha')}
        </Typography>
        <Box
          key={captchaResetKey}
          sx={{
            height: 48,
            width: '100%',
            borderRadius: '24px',
            backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)',
            border: '1px solid',
            borderColor: errors.captcha ? 'error.main' : mode === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255, 255, 255, 0.08)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none'
          }}
        >
          {/* Green Progress Slider Fill */}
          <motion.div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: fillWidth,
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              borderTopLeftRadius: '24px',
              borderBottomLeftRadius: '24px'
            }}
          />

          <motion.div style={{ opacity, x: textX }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', pointerEvents: 'none' }}>
              {captchaVerified ? 'Verification Complete' : 'Slide to verify security'}
            </Typography>
          </motion.div>

          {/* Draggable Handle */}
          <motion.div
            drag={captchaVerified ? false : "x"}
            dragConstraints={{ left: 0, right: dragRange }}
            dragElastic={0}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            style={{
              x,
              position: 'absolute',
              left: 2,
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: captchaVerified ? '#10B981' : '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              cursor: captchaVerified ? 'default' : 'grab',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: captchaVerified ? '#ffffff' : '#475569'
            }}
            whileTap={captchaVerified ? {} : { cursor: 'grabbing', scale: 0.95 }}
          >
            {captchaVerified ? (
              <SecurityIcon sx={{ fontSize: 20 }} />
            ) : (
              <LocalShippingIcon sx={{ fontSize: 20 }} />
            )}
          </motion.div>
        </Box>
      </Box>

      {/* Action Submit Button */}
      <LoadingButton
        loading={isLoading}
        success={loginSuccess}
        disabled={isLoading || loginSuccess}
      >
        {role === 'admin' ? t('secureLogin') : t('signIn')}
      </LoadingButton>

      {/* Alternate Google Sign-in */}
      <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
          <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            OR
          </Typography>
          <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
        </Box>

        <GoogleLoginButton role={role} />

        {role === 'customer' && (
          <Typography
            component={Link}
            href="/register"
            variant="body2"
            sx={{
              fontWeight: 700,
              color: 'secondary.main',
              textDecoration: 'none',
              mt: 1,
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            {t('createAccount')}
          </Typography>
        )}
      </Box>
    </form>
  );
};

export default LoginForm;
