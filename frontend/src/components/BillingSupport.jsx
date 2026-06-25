import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Accordion, AccordionSummary, AccordionDetails, Button, Grid, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SupportIcon from '@mui/icons-material/Support';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import ForumIcon from '@mui/icons-material/Forum';

const BillingSupport = ({ onRaiseDispute, currentThemeMode = 'dark' }) => {
  const isDark = currentThemeMode === 'dark';
  const [openDispute, setOpenDispute] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const faqs = [
    { q: 'How are delivery charges calculated?', a: 'Charges are calculated based on route mileage, weight class, and service type (standard vs express).' },
    { q: 'When will I receive my refund?', a: 'Approved refunds are credited back to your original payment method or UPI wallet within 3-5 business days.' },
    { q: 'Can I add multiple credit cards?', a: 'Yes, you can add multiple credit or debit cards under the "Payment Methods" section and set one as your primary default.' },
    { q: 'How do I download tax GST invoices?', a: 'Click the "Download PDF" action beside any invoice to download a printable GST-compliant document.' }
  ];

  const handleOpenDispute = () => {
    setOpenDispute(true);
  };

  const handleCloseDispute = () => {
    setOpenDispute(false);
    setSubject('');
    setDescription('');
  };

  const handleSubmitDispute = () => {
    if (!subject || !description) {
      alert('Please fill out all ticket fields.');
      return;
    }
    onRaiseDispute({ subject, description });
    handleCloseDispute();
  };

  return (
    <Box>
      <Grid container spacing={4}>
        {/* Billing FAQ */}
        <Grid item xs={12} md={7}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Frequently Asked Questions
          </Typography>
          {faqs.map((faq, idx) => (
            <Accordion
              key={idx}
              sx={{
                bgcolor: isDark ? 'rgba(255,255,255,0.01)' : '#ffffff',
                backgroundImage: 'none',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'}`,
                mb: 1.5,
                borderRadius: '8px !important',
                '&:before': { display: 'none' }
              }}
            >
              <AccordionSummary expandMoreIcon={<ExpandMoreIcon sx={{ color: 'text.secondary' }} />}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{faq.q}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>{faq.a}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Grid>

        {/* Contact Channels */}
        <Grid item xs={12} md={5}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Contact Billing Operations
          </Typography>

          <Card sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'}`, borderRadius: '16px', mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 800, mb: 2 }}>Need immediate help?</Typography>
              
              <Box display="flex" flexDirection="column" gap={2} mb={3}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <PhoneIcon sx={{ color: '#2563EB', fontSize: 18 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">Phone Support</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>+1 (800) 555-FLOW</Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <EmailIcon sx={{ color: '#7C3AED', fontSize: 18 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">Email Dispatch</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>billing@trackflow.com</Typography>
                  </Box>
                </Box>
              </Box>

              <Box display="flex" gap={1.5}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ForumIcon />}
                  onClick={() => alert('Launching billing chat support channel...')}
                  fullWidth
                  sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 700 }}
                >
                  Live Chat
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<SupportIcon />}
                  onClick={handleOpenDispute}
                  fullWidth
                  sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 700 }}
                >
                  File Dispute
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Raise Dispute Dialog */}
      <Dialog open={openDispute} onClose={handleCloseDispute} PaperProps={{ sx: { borderRadius: '16px', bgcolor: isDark ? '#0f1424' : '#fff', backgroundImage: 'none', width: '100%', maxWidth: 460 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>File Payment Dispute Ticket</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <TextField
            label="Dispute Subject"
            placeholder="e.g. Overcharged on shipping route INV-1023"
            fullWidth
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
          <TextField
            label="Detailed Complaint Description"
            placeholder="Explain the payment issue, charges, order tracking references, and bank details..."
            multiline
            rows={4}
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDispute} sx={{ fontWeight: 700 }}>Cancel</Button>
          <Button onClick={handleSubmitDispute} variant="contained" color="error" sx={{ fontWeight: 800, borderRadius: '8px' }}>
            Submit Dispute
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BillingSupport;
