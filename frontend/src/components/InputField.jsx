import React, { useState } from 'react';
import { TextField, InputAdornment, IconButton, Typography, Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const InputField = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  required = false,
  startIcon,
  error,
  validationRules,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <Box sx={{ mb: 2.5, position: 'relative', width: '100%' }}>
      {/* Premium Border Glow Wrapper */}
      <motion.div
        animate={{
          boxShadow: isFocused
            ? '0 0 0 3px rgba(37, 99, 235, 0.15)'
            : '0 0 0 0px rgba(37, 99, 235, 0)'
        }}
        transition={{ duration: 0.2 }}
        style={{ borderRadius: 12, overflow: 'hidden' }}
      >
        <TextField
          {...props}
          label={label}
          value={value}
          onChange={onChange}
          type={inputType}
          placeholder={placeholder}
          required={required}
          error={!!error}
          fullWidth
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          InputLabelProps={{
            shrink: true,
            style: {
              fontWeight: 600,
              fontSize: '0.9rem',
              letterSpacing: '0.02em',
              transform: 'translate(14px, -8px) scale(0.85)'
            }
          }}
          InputProps={{
            startAdornment: startIcon ? (
              <InputAdornment position="start" sx={{ color: isFocused ? 'primary.main' : 'text.secondary', mr: 1, transition: 'color 0.2s' }}>
                {startIcon}
              </InputAdornment>
            ) : null,
            endAdornment: isPassword ? (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  size="small"
                  sx={{
                    color: 'text.secondary',
                    '&:hover': { color: 'primary.main' }
                  }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ) : null,
            sx: {
              height: 52,
              borderRadius: '12px',
              fontSize: '0.95rem',
              fontWeight: 500,
              '& fieldset': {
                borderWidth: '1.5px !important'
              }
            }
          }}
        />
      </motion.div>
      
      {/* Real-time Validation Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '6px',
              paddingLeft: '4px'
            }}
          >
            <ErrorOutlineIcon color="error" sx={{ fontSize: 15 }} />
            <Typography variant="caption" color="error.main" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
              {error}
            </Typography>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default InputField;
