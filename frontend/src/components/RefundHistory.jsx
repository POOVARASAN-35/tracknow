import React from 'react';
import { Card, CardContent, Typography, Box, Grid, Chip, Button } from '@mui/material';
import { motion } from 'framer-motion';
import ReplayIcon from '@mui/icons-material/Replay';
import PaymentIcon from '@mui/icons-material/Payment';

const RefundHistory = ({ refunds = [], currentThemeMode = 'dark' }) => {
  const isDark = currentThemeMode === 'dark';

  const handleTrackRefund = (refund) => {
    alert(`Tracking Refund ${refund.refundId}:\nStatus: ${refund.status}\nRefund Method: ${refund.method}\nExpected Completion: ${new Date(refund.expectedDate).toLocaleDateString()}`);
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {refunds.map((ref, idx) => (
          <Grid item xs={12} md={6} key={ref._id || idx}>
            <Card
              component={motion.div}
              whileHover={{ y: -4 }}
              sx={{
                bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'}`,
                borderRadius: '16px',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>Refund: {ref.refundId}</Typography>
                    <Typography variant="caption" color="text.secondary">Order: {ref.orderId}</Typography>
                  </Box>
                  <Chip
                    label={ref.status.toUpperCase()}
                    color={ref.status === 'Success' ? 'success' : ref.status === 'Pending' ? 'warning' : 'error'}
                    size="small"
                    sx={{ fontWeight: 800, fontSize: '0.65rem' }}
                  />
                </Box>

                <Typography variant="h5" sx={{ fontWeight: 900, mb: 2, color: '#EF4444' }}>
                  -${Number(ref.amount).toFixed(2)}
                </Typography>

                <Box mb={2}>
                  <Typography variant="caption" color="text.secondary" display="block">Reason for Refund</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                    {ref.reason}
                  </Typography>
                </Box>

                <Grid container spacing={2} sx={{ p: 2, bgcolor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)', borderRadius: '8px', mb: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" display="block">Refund Method</Typography>
                    <Box display="flex" alignItems="center" gap={0.5} mt={0.25}>
                      <PaymentIcon fontSize="inherit" sx={{ color: 'text.secondary' }} />
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>{ref.method}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" display="block">Expected Completion</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mt: 0.25 }}>
                      {new Date(ref.expectedDate).toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>

                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  onClick={() => handleTrackRefund(ref)}
                  startIcon={<ReplayIcon fontSize="small" />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: '8px',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#cbd5e1',
                    color: 'text.secondary',
                    '&:hover': {
                      borderColor: '#2563EB',
                      color: '#2563EB'
                    }
                  }}
                >
                  Track Refund Status
                </Button>

              </CardContent>
            </Card>
          </Grid>
        ))}
        {refunds.length === 0 && (
          <Grid item xs={12}>
            <Card sx={{ p: 6, display: 'flex', justifyContent: 'center', bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No cancellation refunds found for your account.
              </Typography>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default RefundHistory;
