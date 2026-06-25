import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Button, Chip, Divider, Grid, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import PeopleIcon from '@mui/icons-material/People';
import { motion } from 'framer-motion';

const RewardCard = ({ points = 320, memberId = 'TF-CUST-9824', currentThemeMode = 'dark' }) => {
  const isDark = currentThemeMode === 'dark';
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState('');

  const referralCode = "FLOWFRIEND50";

  const coupons = [
    { code: 'SHIPFREE', desc: 'Free standard shipping on orders above $50', type: 'Free Shipping' },
    { code: 'LOYAL20', desc: '20% off on premium logistic shipments', type: '20% Discount' }
  ];

  // Membership tier helper
  const getTierInfo = (pts) => {
    if (pts >= 500) return { name: 'Premium Elite', color: '#10B981', min: 500, max: 1000, desc: 'Unlimited free express deliveries, VIP phone support.' };
    if (pts >= 250) return { name: 'Gold Member', color: '#F59E0B', min: 250, max: 500, desc: '50% off express deliveries, prioritized driver dispatch.' };
    return { name: 'Silver Tier', color: '#9CA3AF', min: 0, max: 250, desc: 'Earn 1 point per $1 spent, regular standard shipping.' };
  };

  const tier = getTierInfo(points);
  const tierProgress = ((points - tier.min) / (tier.max - tier.min)) * 100;

  const copyToClipboard = (text, type = 'ref') => {
    navigator.clipboard.writeText(text);
    if (type === 'ref') {
      setCopiedReferral(true);
      setTimeout(() => setCopiedReferral(false), 2000);
    } else {
      setCopiedCoupon(text);
      setTimeout(() => setCopiedCoupon(''), 2000);
    }
  };

  return (
    <Box>
      {/* 1. Digital Membership Pass */}
      <Card
        component={motion.div}
        whileHover={{ scale: 1.01 }}
        sx={{
          background: isDark 
            ? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)' 
            : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
          borderRadius: '20px',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`,
          mb: 3,
          boxShadow: 'none'
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <EmojiEventsIcon sx={{ color: tier.color }} />
              <Typography variant="body2" sx={{ fontWeight: 800 }}>
                Digital Loyalty Member Card
              </Typography>
            </Box>
            <Chip 
              label={tier.name.toUpperCase()} 
              sx={{ bgcolor: tier.color, color: '#ffffff', fontWeight: 900, fontSize: '0.6rem', height: 20 }} 
            />
          </Box>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={8}>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                {memberId}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Points Earned: <strong>{points}</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, pr: 1, fontSize: '0.7rem' }}>
                {tier.desc}
              </Typography>
            </Grid>
            <Grid item xs={4} display="flex" justifyContent="flex-end">
              <Box sx={{
                bgcolor: '#ffffff',
                p: 0.5,
                borderRadius: '8px',
                border: '1px solid rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <QrCode2Icon sx={{ fontSize: 64, color: '#000000' }} />
              </Box>
            </Grid>
          </Grid>

          {/* Membership Tier Progress Circle (Linear Indicator used here with custom stats) */}
          <Box mt={3}>
            <Box display="flex" justifyContent="space-between" mb={0.5}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                Tier Progress ({points}/{tier.max} pts)
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                {Math.round(tierProgress)}%
              </Typography>
            </Box>
            <Box sx={{
              height: 10,
              bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              borderRadius: 5,
              overflow: 'hidden',
              position: 'relative'
            }}>
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                width: `${Math.min(tierProgress, 100)}%`,
                bgcolor: tier.color,
                borderRadius: 5
              }} />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* 2. Referral & Coupons Dashboard */}
      <Grid container spacing={3}>
        {/* Active Coupons list */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CardGiftcardIcon fontSize="small" color="primary" /> Available Vouchers
          </Typography>
          <Box display="flex" flexDirection="column" gap={1.5}>
            {coupons.map((coupon, i) => (
              <Card key={i} sx={{
                p: 2,
                borderRadius: '12px',
                bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                boxShadow: 'none'
              }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Chip label={coupon.code} size="small" sx={{ fontWeight: 900, bgcolor: 'primary.main', color: '#fff', fontSize: '0.65rem' }} />
                  <IconButton size="small" onClick={() => copyToClipboard(coupon.code, 'coupon')}>
                    {copiedCoupon === coupon.code ? <CheckIcon fontSize="small" sx={{ color: '#10B981' }} /> : <ContentCopyIcon fontSize="small" />}
                  </IconButton>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                  {coupon.desc}
                </Typography>
              </Card>
            ))}
          </Box>
        </Grid>

        {/* Referrals */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <PeopleIcon fontSize="small" color="secondary" /> Referral Dashboard
          </Typography>
          <Card sx={{
            p: 2,
            borderRadius: '12px',
            bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
            boxShadow: 'none',
            height: 'calc(100% - 32px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                Share your referral link/code with friends to earn <strong>$10.00 cashback credits</strong> for each verified delivery completed.
              </Typography>
              <Box display="flex" alignItems="center" justifyContent="space-between" p={1.5} sx={{ bgcolor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)', borderRadius: '8px', border: `1px dashed ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 800, color: 'secondary.main' }}>
                  {referralCode}
                </Typography>
                <Button 
                  size="small" 
                  variant="outlined" 
                  color="secondary"
                  startIcon={copiedReferral ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                  onClick={() => copyToClipboard(referralCode, 'ref')}
                  sx={{ py: 0.25, px: 1, fontSize: '0.65rem' }}
                >
                  {copiedReferral ? 'Copied' : 'Copy'}
                </Button>
              </Box>
            </Box>
            <Box display="flex" justifyContent="space-between" mt={2} pt={1.5} sx={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Earned Credits</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#10B981' }}>$40.00</Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Friends Invited</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>4 Active</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RewardCard;
