import React, { useState } from 'react';
import { Button, Menu, MenuItem, Box, Typography } from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { usePortalTheme } from '../context/ThemeContext';

const LanguageSelector = ({ sx = {} }) => {
  const { language, setLanguage, mode } = usePortalTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectLanguage = (lang) => {
    setLanguage(lang);
    handleClose();
  };

  const languageLabels = {
    en: 'English',
    es: 'Español',
    de: 'Deutsch'
  };

  return (
    <Box sx={{ ...sx }}>
      <Button
        id="language-select-button"
        aria-controls={open ? 'language-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        startIcon={<TranslateIcon sx={{ fontSize: 18 }} />}
        endIcon={<KeyboardArrowDownIcon />}
        sx={{
          borderRadius: '20px',
          px: 2,
          py: 0.75,
          textTransform: 'none',
          background: mode === 'light' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(8px)',
          border: '1px solid',
          borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
          color: mode === 'light' ? '#1e293b' : '#cbd5e1',
          fontSize: '0.875rem',
          fontWeight: 600,
          boxShadow: mode === 'light' 
            ? '0 4px 12px rgba(0, 0, 0, 0.05)' 
            : '0 4px 12px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            background: mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(15, 23, 42, 0.6)',
            borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.15)'
          }
        }}
      >
        {languageLabels[language] || 'Language'}
      </Button>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'language-select-button'
        }}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: '12px',
            minWidth: 120,
            backgroundColor: mode === 'light' ? '#ffffff' : '#111827',
            backgroundImage: 'none',
            border: mode === 'light' ? '1px solid #e5e7eb' : '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: mode === 'light'
              ? '0 10px 15px -3px rgba(0, 0, 0, 0.05)'
              : '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
            padding: '4px'
          }
        }}
      >
        <MenuItem
          onClick={() => handleSelectLanguage('en')}
          selected={language === 'en'}
          sx={{
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 600,
            py: 1,
            '&.Mui-selected': {
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                backgroundColor: 'primary.dark'
              }
            }
          }}
        >
          🇺🇸 English
        </MenuItem>
        <MenuItem
          onClick={() => handleSelectLanguage('es')}
          selected={language === 'es'}
          sx={{
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 600,
            py: 1,
            '&.Mui-selected': {
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                backgroundColor: 'primary.dark'
              }
            }
          }}
        >
          🇪🇸 Español
        </MenuItem>
        <MenuItem
          onClick={() => handleSelectLanguage('de')}
          selected={language === 'de'}
          sx={{
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 600,
            py: 1,
            '&.Mui-selected': {
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                backgroundColor: 'primary.dark'
              }
            }
          }}
        >
          🇩🇪 Deutsch
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default LanguageSelector;
