import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Button, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, MenuItem } from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import AddIcon from '@mui/icons-material/Add';
import SecurityIcon from '@mui/icons-material/Security';
import { motion } from 'framer-motion';

const PaymentCard = ({ cards = [], onAddCard, onDeleteCard, onSetDefault, currentThemeMode = 'dark' }) => {
  const isDark = currentThemeMode === 'dark';
  const [openAddCardDialog, setOpenAddCardDialog] = useState(false);

  // Form state
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardType, setCardType] = useState('Visa');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!cardHolder || !cardNumber || !expiry || !cvv) {
      alert('Please fill in all credit card details.');
      return;
    }

    // Mask card digits
    const cleanedNum = cardNumber.replace(/\s+/g, '');
    const lastFour = cleanedNum.slice(-4);
    const masked = `•••• •••• •••• ${lastFour}`;

    onAddCard({
      id: Date.now(),
      holderName: cardHolder,
      number: masked,
      expiry,
      type: cardType,
      isDefault: cards.length === 0
    });

    // Reset Form
    setCardHolder('');
    setCardNumber('');
    setExpiry('');
    setCvv('');
    setCardType('Visa');
    setOpenAddCardDialog(false);
  };

  const getCardGradient = (type) => {
    switch (type) {
      case 'Visa':
        return 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)';
      case 'Mastercard':
        return 'linear-gradient(135deg, #ec008c 0%, #fc6767 100%)';
      case 'UPI':
        return 'linear-gradient(135deg, #0575e6 0%, #00f260 100%)';
      default:
        return 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Payment Methods
        </Typography>
        <Button 
          variant="contained" 
          size="small" 
          startIcon={<AddIcon />}
          onClick={() => setOpenAddCardDialog(true)}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
        >
          Add Card / Method
        </Button>
      </Box>

      {cards.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: 'text.secondary', bgcolor: 'transparent' }}>
          <Typography variant="body2" color="text.secondary">
            No saved cards or payment methods. Click above to add one.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {cards.map((card) => (
            <Grid item xs={12} sm={6} key={card.id}>
              <Card
                component={motion.div}
                whileHover={{ y: -4, rotate: 0.5 }}
                sx={{
                  background: getCardGradient(card.type),
                  borderRadius: '20px',
                  color: '#ffffff',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)',
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: 180,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  p: 3,
                  border: card.isDefault ? '2px solid #00ffcc' : 'none'
                }}
              >
                {/* Visual glow overlay */}
                <Box sx={{
                  position: 'absolute',
                  top: '-40%',
                  right: '-10%',
                  width: '70%',
                  height: '120%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  transform: 'skewX(-25deg)',
                  pointerEvents: 'none'
                }} />

                {/* Card Header Row */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" zIndex={1}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '0.05em' }}>
                      {card.type.toUpperCase()}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.65rem', fontWeight: 700 }}>
                      DIGITAL WALLET SECURE
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    {card.isDefault && (
                      <Chip 
                        label="DEFAULT" 
                        size="small" 
                        sx={{ bgcolor: 'rgba(0, 255, 204, 0.2)', color: '#00ffcc', fontWeight: 900, fontSize: '0.6rem', border: '1px solid #00ffcc', height: 20 }} 
                      />
                    )}
                    <CreditCardIcon sx={{ fontSize: 32, opacity: 0.9 }} />
                  </Box>
                </Box>

                {/* Card Number */}
                <Typography variant="h5" sx={{ fontFamily: 'monospace', fontWeight: 800, my: 2.5, letterSpacing: '0.15em', zIndex: 1 }}>
                  {card.number}
                </Typography>

                {/* Card Footer Row */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-end" zIndex={1}>
                  <Box>
                    <Typography variant="caption" sx={{ display: 'block', opacity: 0.7, fontSize: '0.6rem', fontWeight: 600 }}>
                      CARD HOLDER
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, letterSpacing: '0.02em' }}>
                      {card.holderName.toUpperCase()}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="flex-end" gap={2}>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" sx={{ display: 'block', opacity: 0.7, fontSize: '0.6rem', fontWeight: 600 }}>
                        EXPIRES
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {card.expiry}
                      </Typography>
                    </Box>
                    <Box display="flex" gap={0.5}>
                      {!card.isDefault && (
                        <IconButton size="small" sx={{ color: '#ffffff', bgcolor: 'rgba(255, 255, 255, 0.1)', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' } }} onClick={() => onSetDefault(card.id)}>
                          <StarIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      )}
                      <IconButton size="small" sx={{ color: '#ff4d4d', bgcolor: 'rgba(255, 255, 255, 0.1)', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' } }} onClick={() => onDeleteCard(card.id)}>
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* dialog for adding a card */}
      <Dialog open={openAddCardDialog} onClose={() => setOpenAddCardDialog(false)}>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon color="primary" /> Add New Payment Method
        </DialogTitle>
        <DialogContent sx={{ minWidth: 320, display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            All payment credentials are fully encrypted and stored securely using AES-256 standard masking.
          </Typography>
          <TextField
            label="Cardholder Full Name"
            fullWidth
            required
            value={cardHolder}
            onChange={(e) => setCardHolder(e.target.value)}
            sx={{ mt: 1 }}
          />
          <TextField
            label="Card Number"
            fullWidth
            required
            placeholder="1234 5678 1234 5678"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value.replace(/[^0-9\s]/g, ''))}
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Expiry Date"
                placeholder="MM/YY"
                fullWidth
                required
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="CVV"
                type="password"
                placeholder="•••"
                fullWidth
                required
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
              />
            </Grid>
          </Grid>
          <TextField
            select
            label="Card Type"
            fullWidth
            value={cardType}
            onChange={(e) => setCardType(e.target.value)}
          >
            <MenuItem value="Visa">Visa</MenuItem>
            <MenuItem value="Mastercard">Mastercard</MenuItem>
            <MenuItem value="UPI">UPI Credit Card</MenuItem>
            <MenuItem value="Generic">Other Card</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddCardDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">Add Secured Card</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentCard;
