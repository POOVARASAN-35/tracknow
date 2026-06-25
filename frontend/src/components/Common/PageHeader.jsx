import React from 'react';
import { Box, Typography } from '@mui/material';

const PageHeader = ({ title, subtitle, action }) => {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      mb={4}
      sx={{
        pb: 2,
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}
    >
      <Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 0.5
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && <Box>{action}</Box>}
    </Box>
  );
};

export default PageHeader;
