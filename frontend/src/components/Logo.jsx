import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const Logo = ({ size = 'medium', color, sx = {} }) => {
  const isLarge = size === 'large';
  const isSmall = size === 'small';
  
  const iconSize = isLarge ? 48 : isSmall ? 28 : 36;
  const fontSize = isLarge ? '2rem' : isSmall ? '1.15rem' : '1.5rem';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        cursor: 'pointer',
        userSelect: 'none',
        ...sx
      }}
    >
      <motion.div
        whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        style={{ display: 'flex', alignItems: 'center' }}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer circle with gradient shadow */}
          <rect
            width="48"
            height="48"
            rx="12"
            fill="url(#logo-gradient)"
          />
          {/* Animated path representing real-time routing */}
          <motion.path
            d="M14 34L22 22L28 28L34 14"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0.5 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: 2,
              ease: 'easeInOut',
              repeat: Infinity,
              repeatType: 'reverse'
            }}
          />
          {/* Pulse target node at the destination */}
          <motion.circle
            cx="34"
            cy="14"
            r="3.5"
            fill="#ffffff"
            animate={{ scale: [1, 1.4, 1] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          {/* Start node */}
          <circle cx="14" cy="34" r="2.5" fill="white" />
          
          <defs>
            <linearGradient id="logo-gradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00E5FF" />
              <stop offset="0.5" stopColor="#2563EB" />
              <stop offset="1" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
      <Typography
        variant="h5"
        sx={{
          fontSize,
          fontWeight: 900,
          letterSpacing: '-0.02em',
          background: color || 'linear-gradient(135deg, #f3f4f6 0%, #cbd5e1 100%)',
          WebkitBackgroundClip: color ? 'none' : 'text',
          WebkitTextFillColor: color ? 'inherit' : 'transparent',
          fontFamily: '"Outfit", "Inter", sans-serif',
          display: 'flex',
          alignItems: 'center',
          gap: 0.2
        }}
      >
        Track
        <Box
          component="span"
          sx={{
            background: 'linear-gradient(135deg, #00E5FF 0%, #2563EB 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 800
          }}
        >
          Flow
        </Box>
      </Typography>
    </Box>
  );
};

export default Logo;
