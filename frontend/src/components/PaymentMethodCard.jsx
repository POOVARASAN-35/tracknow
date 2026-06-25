import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Grid, Button, IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Chip, MenuItem } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { motion } from 'framer-motion';

const PaymentMethodCard = ({ paymentMethods = [], onAdd, onDelete, onSetDefault, currentThemeMode = 'dark' }) => {
  const isDark = currentThemeMode === 'dark';
  const [openAdd, setOpenAdd] = useState(false);

  // Add Card State
  const [cardType, setCardType] = useState('card');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiryMonth, setCardExpiryMonth] = useState('');
  const [cardExpiryYear, setCardExpiryYear] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [upiId, setUpiId] = useState('');

  const handleOpenAdd = () => {
    setOpenAdd(true);
  };

  const handleCloseAdd = () => {
    setOpenAdd(false);
    setCardName('');
    setCardNumber('');
    setCardExpiryMonth('');
    setCardExpiryYear('');
    setCardCVV('');
    setUpiId('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cardType === 'card') {
      if (!cardName || !cardNumber || !cardExpiryMonth || !cardExpiryYear) {
        alert('Please fill in card details.');
        return;
      }
      onAdd({
        type: 'card',
        details: {
          cardBrand: cardNumber.startsWith('4') ? 'visa' : cardNumber.startsWith('5') ? 'mastercard' : 'amex',
          last4: cardNumber.slice(-4),
          expiryMonth: cardExpiryMonth,
          expiryYear: cardExpiryYear,
          cardholderName: cardName
        }
      });
    } else {
      if (!upiId) {
        alert('Please specify UPI Address VPA.');
        return;
      }
      onAdd({
        type: 'upi',
        details: {
          upiId
        }
      });
    }
    handleCloseAdd();
  };

  const getCardIcon = (brand) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return <Typography variant="h6" sx={{ fontStyle: 'italic', fontWeight: 900, color: '#00e5ff' }}>VISA</Typography>;
      case 'mastercard':
        return <Typography variant="h6" sx={{ fontStyle: 'italic', fontWeight: 900, color: '#f59e0b' }}>MC</Typography>;
      default:
        return <CreditCardIcon />;
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Saved Payment Profiles</Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 700 }}
        >
          Add Payment Profile
        </Button>
      </Box>

      <Grid container spacing={3}>
        {paymentMethods.map((method, idx) => {
          const isCard = method.type === 'card';
          return (
            <Grid item xs={12} md={6} key={method._id || idx}>
              <Card
                component={motion.div}
                whileHover={{ scale: 1.01 }}
                sx={{
                  position: 'relative',
                  overflow: 'hidden',
                  background: isCard
                    ? 'linear-gradient(135deg, #0f1424 0%, #1e293b 100%)'
                    : 'linear-gradient(135deg, #093339 0%, #0d1e24 100%)',
                  color: '#fff',
                  border: method.isDefault ? '2px solid #2563EB' : `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#cbd5e1'}`,
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.25)'
                }}
              >
                {/* Visual Chips / Holograms on Credit Card */}
                {isCard && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 40,
                      left: 24,
                      width: 40,
                      height: 30,
                      bgcolor: '#F59E0B',
                      borderRadius: '4px',
                      opacity: 0.8
                    }}
                  />
                )}

                <CardContent sx={{ p: 3, pt: isCard ? 10 : 3, position: 'relative', zIndex: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      {isCard ? (
                        <>
                          <Typography variant="h6" sx={{ letterSpacing: 2, fontWeight: 700, fontFamily: 'monospace' }}>
                            •••• •••• •••• {method.details.last4}
                          </Typography>
                          <Box display="flex" gap={2} mt={1}>
                            <Box>
                              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', fontSize: '0.6rem' }}>CARDHOLDER</Typography>
                              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>{method.details.cardholderName}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', fontSize: '0.6rem' }}>EXPIRES</Typography>
                              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>{method.details.expiryMonth}/{method.details.expiryYear}</Typography>
                            </Box>
                          </Box>
                        </>
                      ) : (
                        <Box display="flex" alignItems="center" gap={1}>
                          <AccountBalanceIcon sx={{ color: '#00e5ff' }} />
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>UPI VPA ID Handle</Typography>
                            <Typography variant="body2" sx={{ color: '#00e5ff', fontWeight: 600 }}>{method.details.upiId}</Typography>
                          </Box>
                        </Box>
                      )}
                    </Box>

                    <Box textAlign="right">
                      {isCard ? getCardIcon(method.details.cardBrand) : <Typography variant="h6" sx={{ color: '#00e5ff', fontWeight: 900 }}>BHIM</Typography>}
                    </Box>
                  </Box>

                  <Divider sx={{ my: 1.5, borderColor: 'rgba(255, 255, 255, 0.08)' }} />

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    {method.isDefault ? (
                      <Chip
                        icon={<CheckCircleIcon sx={{ color: '#10B981 !important', fontSize: 14 }} />}
                        label="DEFAULT METHOD"
                        size="small"
                        sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', fontWeight: 800, fontSize: '0.6rem', height: 20 }}
                      />
                    ) : (
                      <Button
                        size="small"
                        startIcon={<StarIcon fontSize="inherit" />}
                        onClick={() => onSetDefault(method._id)}
                        sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'none', fontSize: '0.7rem', fontWeight: 700 }}
                      >
                        Set Default
                      </Button>
                    )}

                    <IconButton size="small" onClick={() => onDelete(method._id)} sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#EF4444' } }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
        {paymentMethods.length === 0 && (
          <Grid item xs={12}>
            <Card sx={{ p: 6, display: 'flex', justifyContent: 'center', bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No payment methods are saved. Add a profile above.
              </Typography>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Add New Method Dialog */}
      <Dialog open={openAdd} onClose={handleCloseAdd} PaperProps={{ sx: { borderRadius: '16px', bgcolor: isDark ? '#0f1424' : '#fff', backgroundImage: 'none' } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Add New Payment Profile</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Profile Type"
            value={cardType}
            onChange={(e) => setCardType(e.target.value)}
            fullWidth
            margin="dense"
            sx={{ mb: 2 }}
          >
            <MenuItem value="card">Credit or Debit Card</MenuItem>
            <MenuItem value="upi">UPI Address Handle (BHIM/VPA)</MenuItem>
          </TextField>

          {cardType === 'card' ? (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField label="Cardholder Full Name" fullWidth value={cardName} onChange={(e) => setCardName(e.target.value)} required />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Card Number (16-digits)" fullWidth value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} required />
              </Grid>
              <Grid item xs={4}>
                <TextField label="Exp Month" placeholder="MM" fullWidth value={cardExpiryMonth} onChange={(e) => setCardExpiryMonth(e.target.value)} required />
              </Grid>
              <Grid item xs={4}>
                <TextField label="Exp Year" placeholder="YYYY" fullWidth value={cardExpiryYear} onChange={(e) => setCardExpiryYear(e.target.value)} required />
              </Grid>
              <Grid item xs={4}>
                <TextField label="CVV" placeholder="3-digits" type="password" fullWidth value={cardCVV} onChange={(e) => setCardCVV(e.target.value)} required />
              </Grid>
            </Grid>
          ) : (
            <TextField label="UPI VPA Handle Address" placeholder="username@okbank" fullWidth value={upiId} onChange={(e) => setUpiId(e.target.value)} required />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseAdd} sx={{ fontWeight: 700 }}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ fontWeight: 800, borderRadius: '8px' }}>Save Method</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentMethodCard;
