import React from 'react';
import { Drawer, Box, Typography, IconButton, Grid, Divider, Stepper, Step, StepLabel, Button, Chip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import DownloadInvoiceButton from './DownloadInvoiceButton';
import { motion } from 'framer-motion';

const InvoiceModal = ({ open, onClose, invoice, currentThemeMode = 'dark' }) => {
  if (!invoice) return null;
  const isDark = currentThemeMode === 'dark';

  const steps = [
    'Payment Initiated',
    'Payment Successful',
    'Invoice Generated',
    'Order Confirmed',
    'Driver Assigned',
    'Delivered',
    'Completed'
  ];

  const getActiveTimelineStep = (status) => {
    switch (status) {
      case 'Pending': return 0;
      case 'Paid': return 3; // Paid & Confirmed
      case 'Refunded': return 6; // Fully completed sequence
      case 'Cancelled': return 0;
      case 'Failed': return 0;
      default: return 6;
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice #${invoice.invoiceId}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            .header { border-bottom: 2px solid #2563EB; padding-bottom: 20px; display: flex; justify-content: space-between; }
            .details { margin: 20px 0; display: flex; justify-content: space-between; }
            table { width: 100%; border-collapse: collapse; margin: 30px 0; }
            th, td { padding: 12px; border-bottom: 1px solid #ddd; text-align: left; }
            th { color: #2563EB; }
            .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; color: #2563EB; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>TRACKFLOW</h1>
              <p>Logistics & Fleet Portal</p>
            </div>
            <div style="text-align: right;">
              <h2>INVOICE</h2>
              <p># ${invoice.invoiceId}</p>
            </div>
          </div>
          <div class="details">
            <div>
              <strong>Billed To:</strong><br/>
              ${invoice.customer?.name || 'Jane Customer'}<br/>
              ${invoice.customer?.email || 'customer@tracknow.com'}<br/>
            </div>
            <div style="text-align: right;">
              <strong>Details:</strong><br/>
              Date: ${new Date(invoice.date).toLocaleDateString()}<br/>
              Status: ${invoice.status}<br/>
              Method: ${invoice.paymentMethod}<br/>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Logistics Shipping Manifest Delivery Pack</td>
                <td>1</td>
                <td>$${Number(invoice.subtotal).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <div class="total">
            Total Amount Paid: $${Number(invoice.totalAmount).toFixed(2)}
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleShare = () => {
    const shareText = `TrackFlow Invoice ${invoice.invoiceId} for $${invoice.totalAmount.toFixed(2)}`;
    if (navigator.share) {
      navigator.share({
        title: 'TrackFlow Invoice',
        text: shareText,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Invoice billing details copied to clipboard!');
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 540 },
          bgcolor: isDark ? '#0f1424' : '#ffffff',
          backgroundImage: 'none',
          borderLeft: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
          p: 0
        }
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'}` }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box sx={{ width: 32, height: 32, borderRadius: '8px', background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <LocalShippingIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>Invoice Details</Typography>
            <Typography variant="caption" color="text.secondary">ID: {invoice.invoiceId}</Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
        
        {/* Status & Actions Bar */}
        <Box display="flex" justifyContent="space-between" alignItems="center" p={2.5} sx={{ bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)', borderRadius: '12px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0'}` }}>
          <Chip
            label={invoice.status.toUpperCase()}
            color={invoice.status === 'Paid' ? 'success' : invoice.status === 'Pending' ? 'warning' : 'error'}
            size="small"
            sx={{ fontWeight: 800, fontSize: '0.7rem', height: 24 }}
          />
          <Box display="flex" gap={1}>
            <IconButton size="small" onClick={handlePrint} sx={{ color: 'text.secondary', bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#f1f5f9' }} title="Print Invoice">
              <PrintIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handleShare} sx={{ color: 'text.secondary', bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#f1f5f9' }} title="Share Invoice">
              <ShareIcon fontSize="small" />
            </IconButton>
            <DownloadInvoiceButton invoice={invoice} />
          </Box>
        </Box>

        {/* Invoice Header details */}
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>Customer</Typography>
            <Typography variant="body2" sx={{ fontWeight: 800 }}>{invoice.customer?.name || 'Jane Customer'}</Typography>
            <Typography variant="caption" color="text.secondary">{invoice.customer?.email || 'customer@tracknow.com'}</Typography>
          </Grid>
          <Grid item xs={6} textAlign="right">
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>Invoice Info</Typography>
            <Typography variant="body2" sx={{ fontWeight: 800 }}>Date: {new Date(invoice.date).toLocaleDateString()}</Typography>
            <Typography variant="caption" color="text.secondary" display="block">Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0' }} />
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>Billing Address</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{invoice.billingAddress?.text || 'Prestige Shantiniketan, Whitefield, Bengaluru'}</Typography>
          </Grid>
          <Grid item xs={6} textAlign="right">
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>Delivery Address</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{invoice.deliveryAddress?.text || 'Whitefield Central Warehouse, Bengaluru'}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0' }} />

        {/* Courier details */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fleet Details</Typography>
          <Grid container spacing={2} sx={{ p: 2, bgcolor: isDark ? 'rgba(255, 255, 255, 0.01)' : 'rgba(0, 0, 0, 0.01)', borderRadius: '10px' }}>
            <Grid item xs={4}>
              <Typography variant="caption" color="text.secondary" display="block">Driver Assigned</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>Courier Driver</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="caption" color="text.secondary" display="block">Vehicle Plate</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>KA-51-MB-9876</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="caption" color="text.secondary" display="block">Tracking Reference</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#2563EB' }}>{invoice.trackingId || 'N/A'}</Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Items Grid */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Items</Typography>
          <Box sx={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'}`, borderRadius: '12px', overflow: 'hidden' }}>
            <Box display="flex" justifyContent="space-between" p={2} sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', fontWeight: 800, fontSize: '0.75rem' }}>
              <Typography variant="caption" sx={{ fontWeight: 800, width: '60%' }}>Description</Typography>
              <Typography variant="caption" sx={{ fontWeight: 800, width: '15%', textAlign: 'center' }}>Qty</Typography>
              <Typography variant="caption" sx={{ fontWeight: 800, width: '25%', textAlign: 'right' }}>Amount</Typography>
            </Box>
            <Divider sx={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0' }} />
            <Box display="flex" justifyContent="space-between" alignItems="center" p={2} sx={{ fontSize: '0.85rem' }}>
              <Box sx={{ width: '60%' }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Logistics Shipping Manifest Service</Typography>
                <Typography variant="caption" color="text.secondary">Eco Courier Box Shipping Weight Allocation</Typography>
              </Box>
              <Typography variant="body2" sx={{ width: '15%', textAlign: 'center', fontWeight: 600 }}>1</Typography>
              <Typography variant="body2" sx={{ width: '25%', textAlign: 'right', fontWeight: 700 }}>${Number(invoice.subtotal).toFixed(2)}</Typography>
            </Box>
          </Box>
        </Box>

        {/* Payment Summary Math */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          
          {/* Security QR Code Verification */}
          <Box display="flex" flexDirection="column" alignItems="center" gap={1} sx={{ p: 2, bgcolor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#070a13' }}>
            <svg width="70" height="70" viewBox="0 0 29 29" fill="currentColor">
              <path d="M0 0h9v9H0zm1 1h7v7H1zm1 1h5v5H2zm21-2h6v9h-6zm1 1h4v7h-4zm1 1h2v5h-2zm-23 21h9v9H0zm1 1h7v7H1zm1 1h5v5H2zm21-2h6v9h-6zm1 1h4v7h-4zm1 1h2v5h-2zM12 0h2v2h-2zm3 0h2v5h-2zm3 0h2v2h-2zm3 0h2v3h-2zM12 3h2v4h-2zm6 2h2v4h-2zm3 1h2v2h-2zm-9 3h2v2h-2zm3 0h2v2h-2zm6 0h2v3h-2zM12 12h2v5h-2zm3 0h2v2h-2zm3 0h2v4h-2zm3 0h2v2h-2zm3 0h2v3h-2z" />
            </svg>
            <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.55rem', color: '#64748b' }}>QR Verification</Typography>
          </Box>

          <Box sx={{ width: '240px' }}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="text.secondary">Subtotal:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>${Number(invoice.subtotal).toFixed(2)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="text.secondary">Delivery Charge:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>${Number(invoice.deliveryCharge).toFixed(2)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="text.secondary">GST / Tax (18%):</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>${Number(invoice.tax).toFixed(2)}</Typography>
            </Box>
            {invoice.discount > 0 && (
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="error">Coupon Discount:</Typography>
                <Typography variant="body2" color="error" sx={{ fontWeight: 700 }}>-${Number(invoice.discount).toFixed(2)}</Typography>
              </Box>
            )}
            <Divider sx={{ my: 1.5, borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0' }} />
            <Box display="flex" justifyContent="space-between">
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#2563EB' }}>Total:</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#2563EB' }}>${Number(invoice.totalAmount).toFixed(2)}</Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0' }} />

        {/* Animated Payment Timeline */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment Flow Journey</Typography>
          <Stepper activeStep={getActiveTimelineStep(invoice.status)} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  StepIconProps={{
                    sx: {
                      '&.Mui-active': { color: '#2563EB' },
                      '&.Mui-completed': { color: '#10B981' }
                    }
                  }}
                >
                  <Typography variant="caption" sx={{ fontSize: '0.625rem', fontWeight: 700, display: 'block', mt: 0.5 }}>{label}</Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Security Discloser */}
        <Box display="flex" alignItems="center" gap={1.5} p={2.5} sx={{ border: '1px dashed rgba(16, 185, 129, 0.2)', bgcolor: 'rgba(16, 185, 129, 0.03)', borderRadius: '12px' }}>
          <AccountBalanceWalletIcon sx={{ color: '#10B981' }} />
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#10B981', display: 'block' }}>Verified SSL Secure Transaction</Typography>
            <Typography variant="caption" color="text.secondary">Payment reference token: {invoice.transactionId || 'Awaiting Payment'}</Typography>
          </Box>
        </Box>

      </Box>
    </Drawer>
  );
};

export default InvoiceModal;
