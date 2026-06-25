import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Grid, Typography, Button, IconButton, Tabs, Tab, CircularProgress, Alert, Paper, Card, CardContent, Divider, Badge
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';

// Icons
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ShieldIcon from '@mui/icons-material/Shield';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import SyncAltIcon from '@mui/icons-material/SyncAlt';

// Components
import BillingSummaryCard from '../components/BillingSummaryCard';
import TransactionTable from '../components/TransactionTable';
import InvoiceModal from '../components/InvoiceModal';
import RefundHistory from '../components/RefundHistory';
import PaymentMethodCard from '../components/PaymentMethodCard';
import AnalyticsChart from '../components/AnalyticsChart';
import BillingSupport from '../components/BillingSupport';
import NotificationPanel from '../components/NotificationPanel';

// Actions
import {
  fetchBillingSummary,
  fetchInvoices,
  fetchTransactions,
  fetchRefunds,
  fetchPaymentMethods,
  addPaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
  fetchWalletInfo,
  raiseBillingIssue
} from '../store/slices/billingSlice';

const CustomerBillingLog = ({ currentThemeMode = 'dark' }) => {
  const dispatch = useDispatch();
  const isDark = currentThemeMode === 'dark';

  // Redux Selectors
  const { summary, invoices, refunds, paymentMethods, wallet, loading, error } = useSelector((state) => state.billing);
  const { user } = useSelector((state) => state.auth);

  // States
  const [activeTab, setActiveTab] = useState(0);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Payment Successful', message: 'Invoice INV-2026-002 was paid successfully.', type: 'payment_success', timestamp: new Date(), read: false },
    { id: 2, title: 'Welcome Reward Added', message: '$25.50 welcome cashback was added to your digital wallet.', type: 'reward_added', timestamp: new Date(Date.now() - 3600000), read: true }
  ]);

  // Initial Fetches
  useEffect(() => {
    dispatch(fetchBillingSummary());
    dispatch(fetchInvoices());
    dispatch(fetchTransactions());
    dispatch(fetchRefunds());
    dispatch(fetchPaymentMethods());
    dispatch(fetchWalletInfo());
  }, [dispatch]);

  // Socket.io Real-time alerts
  useEffect(() => {
    const socket = io(window.location.origin, {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('Real-time Billing Socket Connected');
    });

    socket.on('notification', (newNotif) => {
      setNotifications((prev) => [
        {
          id: Date.now(),
          title: newNotif.title,
          message: newNotif.message,
          type: newNotif.type || 'payment_success',
          timestamp: newNotif.timestamp || new Date(),
          read: false
        },
        ...prev
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleMarkAsRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsInvoiceOpen(true);
  };

  const handleAddCard = (payload) => {
    dispatch(addPaymentMethod(payload));
  };

  const handleDeleteCard = (id) => {
    dispatch(deletePaymentMethod(id));
  };

  const handleSetDefaultCard = (id) => {
    dispatch(setDefaultPaymentMethod(id));
  };

  const handleRaiseDispute = (payload) => {
    dispatch(raiseBillingIssue(payload)).then(() => {
      alert('Your billing issue has been registered. Our audit support team will respond shortly.');
      dispatch(fetchBillingSummary());
    });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Box sx={{ color: isDark ? '#fff' : '#1e293b' }}>
      
      {/* Header section with page title */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Billing & Invoice History
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            Manage your payments, invoices, refunds, and transaction history.
          </Typography>
        </Box>
        <Box display="flex" gap={1.5}>
          <IconButton onClick={() => setNotificationsOpen(true)} sx={{ color: 'text.secondary', bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Box>
      </Box>

      {/* Wallet Balance & Cashback Bar */}
      {wallet && (
        <Paper
          component={motion.div}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          sx={{
            p: 3,
            mb: 4,
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${isDark ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.1)'}`,
            borderRadius: '16px',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: 'rgba(37,99,235,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
              <AttachMoneyIcon />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Digital Wallet Balance</Typography>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>${wallet.balance?.toFixed(2)}</Typography>
            </Box>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' }, borderColor: 'rgba(255,255,255,0.1)' }} />
          <Box display="flex" alignItems="center" gap={2}>
            <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED' }}>
              <CardGiftcardIcon />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Cashback Earnings</Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#7C3AED' }}>${wallet.cashback?.toFixed(2)}</Typography>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Loading & Errors */}
      {loading && (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress color="primary" />
        </Box>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: '12px' }}>{error}</Alert>
      )}

      {/* Main Billing Analytics Summaries Grid */}
      {summary && !loading && (
        <Grid container spacing={3} mb={5}>
          <Grid item xs={12} sm={6} md={3}>
            <BillingSummaryCard title="Total Spent" amount={summary.totalSpent.amount} pctChange={summary.totalSpent.pctChange} icon={<AttachMoneyIcon />} color="#2563EB" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <BillingSummaryCard title="Total Orders" amount={summary.totalOrders.amount} pctChange={summary.totalOrders.pctChange} icon={<LocalShippingIcon />} color="#7C3AED" isCurrency={false} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <BillingSummaryCard title="Success Payments" amount={summary.successfulPayments.amount} pctChange={summary.successfulPayments.pctChange} icon={<CheckCircleIcon />} color="#10B981" isCurrency={false} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <BillingSummaryCard title="Refund Amount" amount={summary.refundAmount.amount} pctChange={summary.refundAmount.pctChange} icon={<SettingsBackupRestoreIcon />} color="#EF4444" />
          </Grid>
        </Grid>
      )}

      {/* Tabs navigation */}
      <Tabs
        value={activeTab}
        onChange={(e, val) => setActiveTab(val)}
        sx={{
          mb: 4,
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
          '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontSize: '0.875rem' }
        }}
      >
        <Tab label="Ledger & Invoices" />
        <Tab label="Payment Methods" />
        <Tab label="Refund History" />
        <Tab label="Spending Charts" />
        <Tab label="Audit & Help" />
      </Tabs>

      {/* Main Grid display area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* TAB 0: INVOICES & LEDGER TABLE (Supports Preview Pane on Desktop) */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} lg={selectedInvoice ? 8 : 12}>
                <TransactionTable invoices={invoices} onViewInvoice={handleViewInvoice} currentThemeMode={currentThemeMode} />
              </Grid>
              {selectedInvoice && (
                <Grid item xs={12} lg={4} component={motion.div} layout>
                  <Card sx={{ bgcolor: isDark ? '#0f1424' : '#ffffff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#cbd5e1'}`, borderRadius: '16px', position: 'sticky', top: 90 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" justifyContent="space-between" mb={2}>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>Invoice Panel Preview</Typography>
                        <IconButton size="small" onClick={() => setSelectedInvoice(null)}><CancelIcon fontSize="small" /></IconButton>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="caption" color="text.secondary">INVOICE ID</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>{selectedInvoice.invoiceId}</Typography>

                      <Typography variant="caption" color="text.secondary">TOTAL AMOUNT</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 900, color: '#2563EB', mb: 2 }}>${selectedInvoice.totalAmount.toFixed(2)}</Typography>

                      <Typography variant="caption" color="text.secondary">DESTINATION</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 3 }}>{selectedInvoice.deliveryAddress?.text}</Typography>

                      <Button variant="contained" fullWidth onClick={() => setIsInvoiceOpen(true)} sx={{ borderRadius: '8px', fontWeight: 800 }}>
                        Open Full Sheet View
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}

          {/* TAB 1: SAVED CARDS */}
          {activeTab === 1 && (
            <PaymentMethodCard paymentMethods={paymentMethods} onAdd={handleAddCard} onDelete={handleDeleteCard} onSetDefault={handleSetDefaultCard} currentThemeMode={currentThemeMode} />
          )}

          {/* TAB 2: REFUND LOGS */}
          {activeTab === 2 && (
            <RefundHistory refunds={refunds} currentThemeMode={currentThemeMode} />
          )}

          {/* TAB 3: SPENDING CHARTS */}
          {activeTab === 3 && (
            <AnalyticsChart invoices={invoices} currentThemeMode={currentThemeMode} />
          )}

          {/* TAB 4: AUDIT FAQ & SUBMIT TICKETS */}
          {activeTab === 4 && (
            <Box>
              <BillingSupport onRaiseDispute={handleRaiseDispute} currentThemeMode={currentThemeMode} />
              
              {/* Security Credentials Footer */}
              <Box mt={6} p={3} sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)', border: `1px dashed ${isDark ? 'rgba(255,255,255,0.08)' : '#cbd5e1'}`, borderRadius: '12px', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, justifyContent: 'space-between', alignItems: 'center' }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <ShieldIcon sx={{ color: '#10B981' }} />
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#10B981', display: 'block' }}>Fraud Protection Enabled</Typography>
                    <Typography variant="caption" color="text.secondary">SSL Encrypted Verified Transaction Gateway Portal.</Typography>
                  </Box>
                </Box>
                <Grid container spacing={2} sx={{ width: 'auto', display: 'flex', justifyContent: 'flex-end', fontSize: '0.75rem', color: 'text.secondary' }}>
                  <Grid item display="flex" alignItems="center" gap={0.5}>
                    <DesktopWindowsIcon fontSize="inherit" />
                    <span>Last Device: Chrome MacIntel (127.0.0.1)</span>
                  </Grid>
                  <Grid item display="flex" alignItems="center" gap={0.5}>
                    <SyncAltIcon fontSize="inherit" />
                    <span>Login Activity: 12 minutes ago</span>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}

        </motion.div>
      </AnimatePresence>

      {/* Invoice Details Sliding Sheet Modal */}
      <InvoiceModal open={isInvoiceOpen} onClose={() => setIsInvoiceOpen(false)} invoice={selectedInvoice || selectedInvoice} currentThemeMode={currentThemeMode} />

      {/* Live Billing notifications Drawer */}
      <NotificationPanel open={notificationsOpen} onClose={() => setNotificationsOpen(false)} notifications={notifications} onMarkAsRead={handleMarkAsRead} currentThemeMode={currentThemeMode} />

    </Box>
  );
};

export default CustomerBillingLog;
