import React from 'react';
import { IconButton, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { usePortalTheme } from '../context/ThemeContext';

const ThemeToggle = ({ sx = {} }) => {
  const { mode, toggleMode } = usePortalTheme();
  const theme = useTheme();

  return (
    <IconButton
      onClick={toggleMode}
      sx={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: mode === 'light' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(8px)',
        border: '1px solid',
        borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
        color: mode === 'light' ? '#ea580c' : '#fcd34d',
        boxShadow: mode === 'light' 
          ? '0 4px 12px rgba(0, 0, 0, 0.05)' 
          : '0 4px 12px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          background: mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(15, 23, 42, 0.6)',
          transform: 'scale(1.05)',
          boxShadow: mode === 'light'
            ? '0 6px 16px rgba(0, 0, 0, 0.08)'
            : '0 6px 16px rgba(253, 224, 71, 0.15)',
          borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(253, 224, 71, 0.3)'
        },
        overflow: 'hidden',
        ...sx
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={mode}
          initial={{ y: 20, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -20, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {mode === 'light' ? (
            <LightModeIcon sx={{ fontSize: 22 }} />
          ) : (
            <DarkModeIcon sx={{ fontSize: 22 }} />
          )}
        </motion.div>
      </AnimatePresence>
    </IconButton>
  );
};

export default ThemeToggle;
