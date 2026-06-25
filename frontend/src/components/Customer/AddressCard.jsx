import React from 'react';
import { Card, CardContent, Typography, Box, Button, IconButton, Chip } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import WorkIcon from '@mui/icons-material/Work';
import PinDropIcon from '@mui/icons-material/PinDrop';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { motion } from 'framer-motion';

const AddressCard = ({ address, onEdit, onDelete, onSetDefault, currentThemeMode = 'dark' }) => {
  const isDark = currentThemeMode === 'dark';
  const { id, label, text, isDefault } = address;

  const getIcon = () => {
    switch (label?.toLowerCase()) {
      case 'home':
        return <HomeIcon sx={{ color: '#2563EB' }} />;
      case 'work':
      case 'office':
        return <WorkIcon sx={{ color: '#7C3AED' }} />;
      default:
        return <PinDropIcon sx={{ color: '#10B981' }} />;
    }
  };

  return (
    <Card
      component={motion.div}
      whileHover={{ y: -4, boxShadow: isDark ? '0 12px 30px rgba(0, 229, 255, 0.08)' : '0 12px 30px rgba(37, 99, 235, 0.08)' }}
      sx={{
        bgcolor: isDark ? 'rgba(15, 20, 36, 0.6)' : '#ffffff',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${isDefault ? '#2563EB' : isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.08)'}`,
        borderRadius: '16px',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        {/* Top Header Row */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box sx={{
              p: 1,
              borderRadius: '10px',
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {getIcon()}
            </Box>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 800 }}>
                {label}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={0.5}>
            {isDefault ? (
              <Chip label="Default" color="primary" size="small" sx={{ fontWeight: 800, fontSize: '0.65rem', height: 20 }} />
            ) : (
              <Button size="small" onClick={() => onSetDefault(id)} sx={{ minWidth: 'auto', p: 0.5, textTransform: 'none', fontSize: '0.7rem', fontWeight: 700 }}>
                Set Default
              </Button>
            )}
          </Box>
        </Box>

        {/* Address text description */}
        <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40, mb: 2, fontSize: '0.8rem', lineHeight: 1.5 }}>
          {text}
        </Typography>

        {/* Mock Static Map preview thumbnail */}
        <Box sx={{
          height: 100,
          borderRadius: '12px',
          bgcolor: isDark ? '#080c16' : '#f1f5f9',
          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          mb: 2
        }}>
          {/* Mock Map graphics (styled vector SVG map details) */}
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ opacity: 0.25 }}>
            <line x1="10" y1="0" x2="10" y2="100" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" />
            <line x1="40" y1="0" x2="40" y2="100" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1.5" />
            <line x1="80" y1="0" x2="80" y2="100" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" />
            <line x1="0" y1="30" x2="100" y2="30" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1.5" />
            <line x1="0" y1="70" x2="100" y2="70" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1" />
          </svg>
          {/* Map Marker Pin */}
          <Box 
            component={motion.div}
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            sx={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <PinDropIcon sx={{ color: '#ef4444', fontSize: 28 }} />
            <Box sx={{ width: 6, height: 6, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: '50%', filter: 'blur(1px)' }} />
          </Box>
          <Typography variant="caption" sx={{ position: 'absolute', bottom: 4, right: 8, color: 'text.secondary', fontSize: '0.6rem', fontWeight: 600 }}>
            Mock Map Coordinate Preview
          </Typography>
        </Box>

        {/* Action button triggers */}
        <Box display="flex" justifyContent="flex-end" gap={1}>
          <IconButton size="small" onClick={() => onEdit(address)} sx={{ color: 'text.secondary', bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)' }}>
            <EditIcon fontSize="small" />
          </IconButton>
          {!isDefault && (
            <IconButton size="small" color="error" onClick={() => onDelete(id)} sx={{ bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)' }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default AddressCard;
