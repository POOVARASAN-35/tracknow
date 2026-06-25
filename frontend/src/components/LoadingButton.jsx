import React from 'react';
import { Button, CircularProgress, Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const LoadingButton = ({
  children,
  loading = false,
  success = false,
  fullWidth = true,
  type = 'submit',
  disabled = false,
  onClick,
  sx = {},
  ...props
}) => {
  return (
    <motion.div
      whileHover={!disabled && !loading && !success ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading && !success ? { scale: 0.98 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      style={{ width: fullWidth ? '100%' : 'auto' }}
    >
      <Button
        type={type}
        fullWidth={fullWidth}
        disabled={disabled || loading || success}
        onClick={onClick}
        sx={{
          height: 50,
          borderRadius: '12px',
          fontWeight: 700,
          fontSize: '1rem',
          letterSpacing: '0.03em',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.4s ease-in-out',
          
          // Primary action gradient styling (dynamically sets based on MUI primary palette)
          background: (theme) => {
            if (success) return 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
            if (disabled) return theme.palette.action.disabledBackground;
            return `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main || theme.palette.primary.dark} 100%)`;
          },
          color: (theme) => {
            if (disabled) return theme.palette.text.disabled;
            return '#ffffff';
          },
          boxShadow: (theme) => {
            if (success) return '0 6px 20px rgba(16, 185, 129, 0.4)';
            if (disabled) return 'none';
            return `0 6px 20px ${theme.palette.primary.main}33`;
          },
          
          '&:hover': {
            background: (theme) => {
              if (success) return 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
              return `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light || theme.palette.primary.main} 100%)`;
            },
            boxShadow: (theme) => {
              if (success) return '0 8px 25px rgba(16, 185, 129, 0.5)';
              return `0 8px 25px ${theme.palette.primary.main}4d`;
            }
          },
          ...sx
        }}
        {...props}
      >
        <AnimatePresence mode="wait" initial={false}>
          {success ? (
            <motion.div
              key="success"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <CheckCircleOutlineIcon sx={{ fontSize: 22 }} />
              <span>Login Successful</span>
            </motion.div>
          ) : loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <CircularProgress size={24} color="inherit" thickness={4.5} />
            </motion.div>
          ) : (
            <motion.div
              key="label"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    </motion.div>
  );
};

export default LoadingButton;
