import React from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { usePortalTheme } from '../context/ThemeContext';

const AnimatedBackground = ({ type = 'customer' }) => {
  const { mode } = usePortalTheme();

  // Helper for generating random particle styles
  const generateBubbles = (count) => {
    return Array.from({ length: count }).map((_, idx) => ({
      id: idx,
      size: Math.random() * 40 + 10,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5
    }));
  };

  const bubbles = React.useMemo(() => generateBubbles(15), []);

  if (type === 'customer') {
    // -------------------------------------------------------------
    // Customer Background: Glassmorphism Blue-White-Purple Gradients + Trucks
    // -------------------------------------------------------------
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          overflow: 'hidden',
          backgroundColor: mode === 'light' ? '#F8FAFC' : '#070a13',
          backgroundImage: mode === 'light'
            ? 'radial-gradient(circle at 10% 20%, rgba(37, 99, 235, 0.06) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(124, 58, 237, 0.06) 0%, transparent 40%)'
            : 'radial-gradient(circle at 10% 20%, rgba(37, 99, 235, 0.15) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(124, 58, 237, 0.12) 0%, transparent 40%)',
          transition: 'all 0.5s ease-in-out'
        }}
      >
        {/* Floating Abstract Blur Orbs */}
        <motion.div
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -40, 20, 0],
            scale: [1, 1.1, 0.9, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            top: '10%',
            left: '15%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.18) 0%, rgba(37, 99, 235, 0) 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none'
          }}
        />
        <motion.div
          animate={{
            x: [0, -40, 30, 0],
            y: [0, 30, -30, 0],
            scale: [1, 0.9, 1.1, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            bottom: '15%',
            right: '10%',
            width: '350px',
            height: '350px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, rgba(124, 58, 237, 0) 70%)',
            filter: 'blur(50px)',
            pointerEvents: 'none'
          }}
        />

        {/* Floating Delivery Packages */}
        {bubbles.slice(0, 8).map((bubble) => (
          <motion.div
            key={bubble.id}
            animate={{
              y: ['0vh', '-100vh'],
              x: ['0vw', `${(Math.random() - 0.5) * 10}vw`],
              rotate: [0, 360]
            }}
            transition={{
              duration: bubble.duration,
              delay: bubble.delay,
              repeat: Infinity,
              ease: 'linear'
            }}
            style={{
              position: 'absolute',
              bottom: '-50px',
              left: `${bubble.x}%`,
              width: bubble.size,
              height: bubble.size,
              borderRadius: '25%',
              border: mode === 'light' ? '1px solid rgba(0, 0, 0, 0.04)' : '1px solid rgba(255, 255, 255, 0.04)',
              background: mode === 'light' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.02)',
              backdropFilter: 'blur(3px)',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Box Package SVG Inside Floating Card */}
            <svg width="50%" height="50%" viewBox="0 0 24 24" fill="none" stroke={mode === 'light' ? '#3b82f6' : '#6366f1'} strokeWidth="1.5" strokeOpacity="0.4">
              <path d="M21 8v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8M7.5 3L12 8l4.5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        ))}
      </Box>
    );
  }

  if (type === 'driver') {
    // -------------------------------------------------------------
    // Driver Background: Uber Driver Night City + Light Streaks + Road Lines
    // -------------------------------------------------------------
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          overflow: 'hidden',
          backgroundColor: '#030712',
          backgroundImage: 'radial-gradient(circle at center, #111827 0%, #030712 100%)',
          perspective: '500px'
        }}
      >
        {/* Animated Perspective Road Way */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            width: '1000px',
            height: '100%',
            transform: 'translateX(-50%) rotateX(60deg)',
            transformOrigin: 'bottom center',
            background: 'linear-gradient(to top, rgba(249, 115, 22, 0.03) 0%, transparent 60%)',
            borderLeft: '2px solid rgba(249, 115, 22, 0.08)',
            borderRight: '2px solid rgba(249, 115, 22, 0.08)',
            overflow: 'hidden'
          }}
        >
          {/* Animated Center Dashed Lines */}
          <Box
            sx={{
              position: 'absolute',
              top: '-1000px',
              bottom: 0,
              left: '50%',
              width: '4px',
              borderLeft: '4px dashed rgba(249, 115, 22, 0.4)',
              animation: 'roadScroll 4s linear infinite'
            }}
          />
        </Box>

        {/* GPS Map grid visualization overlays */}
        <svg
          width="100%"
          height="100%"
          style={{ position: 'absolute', top: 0, left: 0, opacity: 0.15, pointerEvents: 'none' }}
        >
          <defs>
            <pattern id="city-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(249, 115, 22, 0.3)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#city-grid)" />
        </svg>

        {/* Night City Moving Vehicle Light Streaks */}
        {bubbles.slice(0, 6).map((streak, i) => (
          <motion.div
            key={`streak-${i}`}
            animate={{
              y: ['0vh', '100vh'],
              opacity: [0, 0.8, 0]
            }}
            transition={{
              duration: streak.duration / 3,
              delay: streak.delay,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            style={{
              position: 'absolute',
              left: `${streak.x}%`,
              width: '2px',
              height: '120px',
              background: i % 2 === 0 
                ? 'linear-gradient(to bottom, transparent, #F97316)' 
                : 'linear-gradient(to bottom, transparent, #FBBF24)',
              filter: 'blur(1px)',
              pointerEvents: 'none'
            }}
          />
        ))}

        {/* CSS Keyframe definition for Road line Scroll */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes roadScroll {
            0% { transform: translateY(0); }
            100% { transform: translateY(500px); }
          }
        `}} />
      </Box>
    );
  }

  // -------------------------------------------------------------
  // Admin Background: Stripe + AWS Navy Global Map connected network
  // -------------------------------------------------------------
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        overflow: 'hidden',
        backgroundColor: mode === 'light' ? '#FFFFFF' : '#0A0E1A',
        backgroundImage: mode === 'light'
          ? 'radial-gradient(circle at top right, rgba(6, 182, 212, 0.04) 0%, transparent 50%)'
          : 'radial-gradient(circle at top right, rgba(6, 182, 212, 0.1) 0%, transparent 50%)',
        transition: 'all 0.5s ease-in-out'
      }}
    >
      {/* Global Dots Grid Overlay */}
      <svg
        width="100%"
        height="100%"
        style={{ position: 'absolute', opacity: mode === 'light' ? 0.3 : 0.6, pointerEvents: 'none' }}
      >
        <defs>
          <pattern id="dot-grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill={mode === 'light' ? '#0F172A' : '#06B6D4'} fillOpacity={mode === 'light' ? 0.08 : 0.2} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" />
      </svg>

      {/* Connected Network Nodes SVG Illustration */}
      <svg
        width="100%"
        height="100%"
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
      >
        {/* Connection Link 1 */}
        <motion.path
          d="M100 200 L400 350 L700 150 L1100 400 L1400 250"
          fill="none"
          stroke={mode === 'light' ? 'rgba(15, 23, 42, 0.06)' : 'rgba(6, 182, 212, 0.15)'}
          strokeWidth="1.5"
        />
        {/* Glowing Data Line traversing route */}
        <motion.path
          d="M100 200 L400 350 L700 150 L1100 400 L1400 250"
          fill="none"
          stroke="url(#line-glow-grad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0, strokeDasharray: '40 100' }}
          animate={{ pathOffset: [0, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        />

        {/* Pulsing Network Hub Nodes */}
        {[
          { cx: 100, cy: 200, delay: 0 },
          { cx: 400, cy: 350, delay: 0.5 },
          { cx: 700, cy: 150, delay: 1.0 },
          { cx: 1100, cy: 400, delay: 1.5 },
          { cx: 1400, cy: 250, delay: 2.0 }
        ].map((node, i) => (
          <g key={i}>
            <circle cx={node.cx} cy={node.cy} r="4" fill={mode === 'light' ? '#0F172A' : '#06B6D4'} />
            <motion.circle
              cx={node.cx}
              cy={node.cy}
              r="12"
              fill="none"
              stroke={mode === 'light' ? '#0F172A' : '#06B6D4'}
              strokeWidth="1"
              initial={{ scale: 0.5, opacity: 0.8 }}
              animate={{ scale: [0.5, 2.5, 0.5], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 3, delay: node.delay, repeat: Infinity }}
            />
          </g>
        ))}

        <defs>
          <linearGradient id="line-glow-grad" x1="0" y1="0" x2="1" y2="0">
            <stop stopColor={mode === 'light' ? '#0F172A' : '#06B6D4'} />
            <stop offset="1" stopColor={mode === 'light' ? '#2563EB' : '#00E5FF'} />
          </linearGradient>
        </defs>
      </svg>
    </Box>
  );
};

export default AnimatedBackground;
