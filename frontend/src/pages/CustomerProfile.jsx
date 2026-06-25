import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { updateUser } from '../store/slices/authSlice';
import {
  Box,
  Grid,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Rating
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

// Icons
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MapIcon from '@mui/icons-material/Map';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import HistoryIcon from '@mui/icons-material/History';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import BarChartIcon from '@mui/icons-material/BarChart';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// Components
import ProfileCard from '../components/Customer/ProfileCard';
import AddressCard from '../components/Customer/AddressCard';
import OrderHistoryTable from '../components/Customer/OrderHistoryTable';
import PaymentCard from '../components/Customer/PaymentCard';
import AnalyticsCard from '../components/Customer/AnalyticsCard';
import RewardCard from '../components/Customer/RewardCard';
import RecentActivity from '../components/Customer/RecentActivity';
import NotificationSettings from '../components/Customer/NotificationSettings';
import SecuritySettings from '../components/Customer/SecuritySettings';
import SupportSection from '../components/Customer/SupportSection';

const CustomerProfile = ({ currentThemeMode = 'dark' }) => {
  const isDark = currentThemeMode === 'dark';
  const dispatch = useDispatch();

  const { user, accessToken } = useSelector((state) => state.auth);
  const { deliveries } = useSelector((state) => state.deliveries);
  const { orders } = useSelector((state) => state.orders);

  // Profile Page Center Sub-Tab state
  const [subTab, setSubTab] = useState(0);

  // Saved Addresses State
  const [addresses, setAddresses] = useState([]);
  const [openAddressModal, setOpenAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addrLabel, setAddrLabel] = useState('');
  const [addrText, setAddrText] = useState('');

  // Payment Cards State
  const [paymentCards, setPaymentCards] = useState([]);

  // Order Details Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Personal details form state
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Jane Customer',
    email: user?.email || 'jane@trackflow.com',
    phone: user?.phone || '+91 98765 43210',
    dob: '1995-08-12',
    gender: 'Female',
    nationality: 'Indian',
    language: 'English',
    deliveryTime: 'Afternoon',
    contactMethod: 'SMS',
    instructions: 'Leave at Door'
  });

  const [saveStatus, setSaveStatus] = useState(false);

  // Mapping helpers
  const mapDbMethodToUiCard = (dbMethod) => {
    return {
      id: dbMethod._id,
      type: dbMethod.details?.cardBrand || (dbMethod.type === 'upi' ? 'UPI' : 'Generic'),
      number: dbMethod.type === 'upi' ? dbMethod.details?.upiId : `•••• •••• •••• ${dbMethod.details?.last4 || '4242'}`,
      holderName: dbMethod.details?.cardholderName || 'Jane Customer',
      expiry: dbMethod.type === 'upi' ? 'N/A' : `${dbMethod.details?.expiryMonth || '12'}/${dbMethod.details?.expiryYear || '28'}`,
      isDefault: dbMethod.isDefault
    };
  };

  const mapDbAddressToUi = (dbAddr) => {
    return {
      id: dbAddr._id,
      label: dbAddr.label,
      text: dbAddr.text,
      isDefault: dbAddr.isDefault
    };
  };

  const fetchAddresses = async () => {
    try {
      const response = await axios.get('/api/customer/addresses', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (response.data?.success) {
        setAddresses(response.data.data.map(mapDbAddressToUi));
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await axios.get('/api/billing/payment-methods', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (response.data?.success) {
        setPaymentCards(response.data.data.map(mapDbMethodToUiCard));
      }
    } catch (err) {
      console.error('Error fetching payment methods:', err);
    }
  };

  // Fetch profile details from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/customer/profile', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        if (response.data?.success) {
          const profile = response.data.data;
          setProfileData({
            name: profile.name || '',
            email: profile.email || '',
            phone: profile.phone || '',
            dob: profile.dob || '',
            gender: profile.gender || '',
            nationality: profile.nationality || '',
            language: profile.language || '',
            deliveryTime: profile.deliveryTime || 'Afternoon',
            contactMethod: profile.contactMethod || 'SMS',
            instructions: profile.instructions || 'Leave at Door'
          });
          dispatch(updateUser({
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            profileImage: profile.profileImage
          }));
        }
      } catch (err) {
        console.error('Error fetching customer profile:', err);
      }
    };
    if (accessToken) {
      fetchProfile();
      fetchAddresses();
      fetchPaymentMethods();
    }
  }, [accessToken]);

  const handlePersonalSave = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put('/api/customer/profile', profileData, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      if (response.data?.success) {
        setSaveStatus(true);
        setTimeout(() => setSaveStatus(false), 3000);
        // Sync Redux state
        dispatch(updateUser({
          name: profileData.name,
          email: profileData.email
        }));
      }
    } catch (err) {
      console.error('Error saving profile preferences:', err);
      if (err.response?.status === 401) {
        alert('Your session has expired. Please logout and log back in.');
      } else {
        alert('Failed to save preferences');
      }
    }
  };

  // Profile Card update sync
  const handleProfileCardSave = async (newData) => {
    try {
      const mergedData = { ...profileData, ...newData };
      const response = await axios.put('/api/customer/profile', mergedData, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      if (response.data?.success) {
        setProfileData(mergedData);
        // Sync Redux state
        dispatch(updateUser({
          name: newData.name,
          email: newData.email
        }));
        alert('Profile details updated successfully');
      }
    } catch (err) {
      console.error('Error saving profile card:', err);
      if (err.response?.status === 401) {
        alert('Your session has expired. Please logout and log back in.');
      } else {
        alert('Failed to save profile details');
      }
    }
  };

  // Address Handlers
  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setAddrLabel('');
    setAddrText('');
    setOpenAddressModal(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddress(addr);
    setAddrLabel(addr.label);
    setAddrText(addr.text);
    setOpenAddressModal(true);
  };

  const handleSaveAddress = async () => {
    if (!addrLabel.trim() || !addrText.trim()) return;

    try {
      if (editingAddress) {
        const response = await axios.put(`/api/customer/addresses/${editingAddress.id}`, {
          label: addrLabel,
          text: addrText
        }, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (response.data?.success) {
          setAddresses(response.data.data.map(mapDbAddressToUi));
        }
      } else {
        const response = await axios.post('/api/customer/addresses', {
          label: addrLabel,
          text: addrText,
          isDefault: addresses.length === 0
        }, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (response.data?.success) {
          setAddresses(response.data.data.map(mapDbAddressToUi));
        }
      }
      setOpenAddressModal(false);
    } catch (err) {
      console.error('Error saving address:', err);
      alert('Failed to save address');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const response = await axios.delete(`/api/customer/addresses/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (response.data?.success) {
        setAddresses(response.data.data.map(mapDbAddressToUi));
      }
    } catch (err) {
      console.error('Error deleting address:', err);
      alert('Failed to delete address');
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      const response = await axios.put(`/api/customer/addresses/${id}/default`, {}, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (response.data?.success) {
        setAddresses(response.data.data.map(mapDbAddressToUi));
      }
    } catch (err) {
      console.error('Error setting default address:', err);
      alert('Failed to set default address');
    }
  };

  // Payment Handlers
  const handleAddCard = async (newCard) => {
    try {
      const dbPayload = {
        type: newCard.type === 'UPI' ? 'upi' : 'card',
        details: {
          cardBrand: newCard.type,
          last4: newCard.number.slice(-4),
          expiryMonth: newCard.expiry.split('/')[0],
          expiryYear: newCard.expiry.split('/')[1],
          cardholderName: newCard.holderName
        },
        isDefault: newCard.isDefault
      };
      
      const response = await axios.post('/api/billing/payment-methods', dbPayload, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (response.data?.success) {
        await fetchPaymentMethods();
      }
    } catch (err) {
      console.error('Error adding card:', err);
      alert('Failed to add payment card');
    }
  };

  const handleDeleteCard = async (id) => {
    try {
      const response = await axios.delete(`/api/billing/payment-methods/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (response.data?.success) {
        await fetchPaymentMethods();
      }
    } catch (err) {
      console.error('Error deleting card:', err);
      alert('Failed to delete payment method');
    }
  };

  const handleSetDefaultCard = async (id) => {
    try {
      const response = await axios.put(`/api/billing/payment-methods/${id}/default`, {}, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (response.data?.success) {
        await fetchPaymentMethods();
      }
    } catch (err) {
      console.error('Error setting default card:', err);
      alert('Failed to set default payment method');
    }
  };

  // Repeat Order Action
  const handleRepeatOrder = (delivery) => {
    alert(`Replicating shipment parameters for Order ${delivery.trackingId}. Item added to cart.`);
  };

  // Invoice Manifest Generation
  const handleDownloadInvoice = (delivery) => {
    const matched = orders.find(o => o.orderId === delivery.trackingId);
    const invoiceContent = `================================================
TRACKFLOW LOGISTICS - SHIPMENT INVOICE
================================================
Order ID: ${delivery.trackingId}
Date: ${delivery.createdAt ? new Date(delivery.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
Status: ${delivery.status.toUpperCase()}

CUSTOMER INFO:
Name: ${user?.name || 'Jane Customer'}
Email: ${user?.email}

LOGISTIC DETAILS:
Destination: ${delivery.deliveryAddress?.text}
Distance: ${delivery.route?.distance || 0} km

BILLING INFO:
Items Cost: $${matched?.totalAmount || 25.00}
Courier Surcharge: $5.00
------------------------------------------------
TOTAL BILL PAID: $${((matched?.totalAmount || 25.00) + 5.00).toFixed(2)}
------------------------------------------------
================================================`;

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Invoice_${delivery.trackingId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalDelivered = deliveries.filter(d => d.status === 'delivered').length;
  const totalCancelled = deliveries.filter(d => d.status === 'cancelled').length;
  const totalActive = deliveries.filter(d => ['assigned', 'accepted', 'picked_up', 'in_transit'].includes(d.status)).length;
  const spentSum = orders.reduce((acc, curr) => acc + curr.totalAmount, 0) || 128.50;

  const getStepIndex = (status) => {
    switch (status) {
      case 'pending': return 0;
      case 'assigned': return 1;
      case 'picked_up': return 2;
      case 'in_transit': return 3;
      case 'delivered': return 4;
      default: return 0;
    }
  };

  return (
    <Grid container spacing={3}>
      
      {/* COLUMN 1: LEFT SIDEBAR WIDGET (Profile Card Only) */}
      <Grid item xs={12} md={4} lg={3.5}>
        <ProfileCard 
          user={user} 
          currentThemeMode={currentThemeMode} 
          onSaveProfile={handleProfileCardSave}
        />
      </Grid>

      {/* COLUMN 2: UNIFIED WORKSPACE CARD PANEL */}
      <Grid item xs={12} md={8} lg={8.5}>
        <Card sx={{
          bgcolor: isDark ? 'rgba(15, 20, 36, 0.6)' : '#ffffff',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.08)'}`,
          borderRadius: '20px',
          boxShadow: 'none',
          minHeight: '75vh',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Sub-Tab Navigation headers */}
          <Box sx={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
            <Tabs
              value={subTab}
              onChange={(e, val) => setSubTab(val)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                px: 2,
                '& .MuiTab-root': {
                  fontWeight: 700,
                  fontSize: '0.785rem',
                  textTransform: 'none',
                  minWidth: 'auto',
                  py: 2,
                  px: 1.5,
                  gap: 0.5
                }
              }}
            >
              <Tab icon={<AccountCircleIcon sx={{ fontSize: 18 }} />} label="Personal details" iconPosition="start" />
              <Tab icon={<EmojiEventsIcon sx={{ fontSize: 18 }} />} label="Loyalty & Rewards" iconPosition="start" />
              <Tab icon={<MapIcon sx={{ fontSize: 18 }} />} label="Addresses" iconPosition="start" />
              <Tab icon={<CreditCardIcon sx={{ fontSize: 18 }} />} label="Payments" iconPosition="start" />
              <Tab icon={<HistoryIcon sx={{ fontSize: 18 }} />} label="Order History" iconPosition="start" />
              <Tab icon={<BarChartIcon sx={{ fontSize: 18 }} />} label="Spend Analytics" iconPosition="start" />
              <Tab icon={<AccessTimeIcon sx={{ fontSize: 18 }} />} label="Recent Activity" iconPosition="start" />
              <Tab icon={<NotificationsIcon sx={{ fontSize: 18 }} />} label="Preferences" iconPosition="start" />
              <Tab icon={<SecurityIcon sx={{ fontSize: 18 }} />} label="Security" iconPosition="start" />
              <Tab icon={<HelpCenterIcon sx={{ fontSize: 18 }} />} label="Support" iconPosition="start" />
            </Tabs>
          </Box>

          <CardContent sx={{ p: 3, flexGrow: 1 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={subTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                style={{ height: '100%' }}
              >
                {/* SUBTAB 0: PERSONAL INFORMATION FORM */}
                {subTab === 0 && (
                  <Box component="form" onSubmit={handlePersonalSave}>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 2.5 }}>
                      Personal Information
                    </Typography>

                    {saveStatus && (
                      <Box sx={{ p: 1.5, mb: 3, bgcolor: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '8px' }}>
                        <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 800 }}>
                          ✓ Personal information preferences updated successfully.
                        </Typography>
                      </Box>
                    )}

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Full Name"
                          fullWidth
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Email Address"
                          fullWidth
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Phone Number"
                          fullWidth
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Date of Birth"
                          type="date"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          value={profileData.dob}
                          onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Gender"
                          fullWidth
                          value={profileData.gender}
                          onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Preferred Language"
                          fullWidth
                          value={profileData.language}
                          onChange={(e) => setProfileData({ ...profileData, language: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          label="Preferred Delivery Time"
                          fullWidth
                          value={profileData.deliveryTime}
                          onChange={(e) => setProfileData({ ...profileData, deliveryTime: e.target.value })}
                        >
                          <MenuItem value="Morning">Morning (8 AM - 12 PM)</MenuItem>
                          <MenuItem value="Afternoon">Afternoon (12 PM - 5 PM)</MenuItem>
                          <MenuItem value="Evening">Evening (5 PM - 9 PM)</MenuItem>
                          <MenuItem value="Night">Night (9 PM - 11 PM)</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          label="Preferred Contact Method"
                          fullWidth
                          value={profileData.contactMethod}
                          onChange={(e) => setProfileData({ ...profileData, contactMethod: e.target.value })}
                        >
                          <MenuItem value="Phone">Phone Calls</MenuItem>
                          <MenuItem value="SMS">SMS Text Messages</MenuItem>
                          <MenuItem value="Email">Email Newsletters</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          select
                          label="Special Delivery Instructions"
                          fullWidth
                          value={profileData.instructions}
                          onChange={(e) => setProfileData({ ...profileData, instructions: e.target.value })}
                        >
                          <MenuItem value="Leave at Door">Leave at Door</MenuItem>
                          <MenuItem value="Call Before Delivery">Call Before Arriving</MenuItem>
                          <MenuItem value="Hand Over Personally">Hand Over Personally (ID Check)</MenuItem>
                        </TextField>
                      </Grid>
                    </Grid>

                    <Button type="submit" variant="contained" sx={{ mt: 4, fontWeight: 700 }}>
                      Save Preferences
                    </Button>
                  </Box>
                )}

                {/* SUBTAB 1: LOYALTY & REWARDS */}
                {subTab === 1 && (
                  <RewardCard 
                    points={320} 
                    memberId="TF-CUST-9824"
                    currentThemeMode={currentThemeMode} 
                  />
                )}

                {/* SUBTAB 2: SAVED ADDRESSES */}
                {subTab === 2 && (
                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        Saved Delivery Locations
                      </Typography>
                      <Button variant="contained" size="small" onClick={handleOpenAddAddress} sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}>
                        Add Address
                      </Button>
                    </Box>

                    <Grid container spacing={2}>
                      {addresses.map((addr) => (
                        <Grid item xs={12} sm={6} key={addr.id}>
                          <AddressCard 
                            address={addr}
                            currentThemeMode={currentThemeMode}
                            onEdit={handleOpenEditAddress}
                            onDelete={handleDeleteAddress}
                            onSetDefault={handleSetDefaultAddress}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {/* SUBTAB 3: SECURE CREDIT CARDS */}
                {subTab === 3 && (
                  <PaymentCard 
                    cards={paymentCards} 
                    currentThemeMode={currentThemeMode}
                    onAddCard={handleAddCard}
                    onDeleteCard={handleDeleteCard}
                    onSetDefault={handleSetDefaultCard}
                  />
                )}

                {/* SUBTAB 4: ORDER HISTORY DATA TABLE */}
                {subTab === 4 && (
                  <OrderHistoryTable
                    deliveries={deliveries}
                    orders={orders}
                    currentThemeMode={currentThemeMode}
                    onViewDetails={(order) => setSelectedOrder(order)}
                    onDownloadInvoice={handleDownloadInvoice}
                    onRepeatOrder={handleRepeatOrder}
                  />
                )}

                {/* SUBTAB 5: SPEND ANALYTICS */}
                {subTab === 5 && (
                  <AnalyticsCard 
                    currentThemeMode={currentThemeMode}
                    stats={{
                      total: deliveries.length,
                      delivered: totalDelivered,
                      cancelled: totalCancelled,
                      active: totalActive,
                      spending: spentSum,
                      spendingLimit: 500,
                      avgTime: '32 mins',
                      rewards: 320,
                      favAddress: addresses.find(a => a.isDefault)?.text || 'Indiranagar Warehouse'
                    }}
                  />
                )}

                {/* SUBTAB 6: RECENT ACTIVITY */}
                {subTab === 6 && (
                  <RecentActivity currentThemeMode={currentThemeMode} />
                )}

                {/* SUBTAB 7: PREFERENCES */}
                {subTab === 7 && (
                  <NotificationSettings currentThemeMode={currentThemeMode} />
                )}

                {/* SUBTAB 8: SECURITY SETTINGS */}
                {subTab === 8 && (
                  <SecuritySettings currentThemeMode={currentThemeMode} />
                )}

                {/* SUBTAB 9: LIVE SUPPORT SERVICES */}
                {subTab === 9 && (
                  <SupportSection currentThemeMode={currentThemeMode} />
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </Grid>

      {/* POPUP: SAVED ADDRESS DETAILS DIALOG */}
      <Dialog open={openAddressModal} onClose={() => setOpenAddressModal(false)}>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingAddress ? 'Modify Location details' : 'Add Saved Location'}
        </DialogTitle>
        <DialogContent sx={{ minWidth: 320, display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Location Label (e.g. Home, Office, Gym)"
            fullWidth
            required
            value={addrLabel}
            onChange={(e) => setAddrLabel(e.target.value)}
            sx={{ mt: 1 }}
          />
          <TextField
            label="Complete Address Text"
            fullWidth
            required
            multiline
            rows={3}
            value={addrText}
            onChange={(e) => setAddrText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddressModal(false)}>Cancel</Button>
          <Button onClick={handleSaveAddress} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* POPUP: ORDER DETAILS MODAL W/ REVIEW WRITER */}
      <Dialog 
        open={Boolean(selectedOrder)} 
        onClose={() => { setSelectedOrder(null); setSubmitSuccess(false); }}
        PaperProps={{ sx: { borderRadius: '20px', minWidth: { xs: '90%', sm: 500 }, bgcolor: isDark ? '#0f1424' : '#fff' } }}
      >
        {selectedOrder && (
          <>
            <DialogTitle sx={{ fontWeight: 900, pb: 1 }}>
              Shipment {selectedOrder.trackingId}
            </DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              
              {/* Stepper tracking progress */}
              <Box>
                <Stepper activeStep={getStepIndex(selectedOrder.status)} alternativeLabel>
                  {['Created', 'Assigned', 'Picked Up', 'Transit', 'Delivered'].map((label) => (
                    <Step key={label}>
                      <StepLabel>
                        <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 800 }}>
                          {label}
                        </Typography>
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              {/* Delivery stats details */}
              <Box display="flex" flexDirection="column" gap={1.5} p={2} sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', borderRadius: '12px' }}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Courier Partner:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>{selectedOrder.assignedDriver?.name || 'Awaiting Driver Partner'}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Vehicle Details:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>{selectedOrder.assignedDriver?.vehicleDetails || 'Bike / Standard Carrier'}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Drop Address:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, maxWidth: 260, textAlign: 'right' }}>{selectedOrder.deliveryAddress?.text}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Payment Method:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>{orders.find(o => o.orderId === selectedOrder.trackingId)?.paymentMethod || 'UPI/NetBanking'}</Typography>
                </Box>
              </Box>

              {/* Mock Proof of Delivery Image visual */}
              {selectedOrder.status === 'delivered' && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
                    PROOF OF DELIVERY IMAGE
                  </Typography>
                  <Box sx={{
                    height: 120,
                    borderRadius: '12px',
                    bgcolor: isDark ? '#070a13' : '#f1f5f9',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px dashed rgba(255,255,255,0.1)'
                  }}>
                    <CheckCircleIcon sx={{ color: '#10B981', fontSize: 36, mr: 1 }} />
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      Parcel drop photo verification complete
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Rate & Review section */}
              {selectedOrder.status === 'delivered' && (
                <Box sx={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, pt: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                    Rate Your Experience
                  </Typography>
                  {submitSuccess ? (
                    <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 800 }}>
                      ✓ Thank you! Review submitted successfully.
                    </Typography>
                  ) : (
                    <Box display="flex" flexDirection="column" gap={1.5}>
                      <Rating 
                        value={reviewRating} 
                        onChange={(e, val) => setReviewRating(val)} 
                      />
                      <TextField 
                        placeholder="Write driver feedback..."
                        size="small"
                        fullWidth
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                      />
                      <Button 
                        variant="outlined" 
                        size="small" 
                        onClick={() => {
                          setSubmitSuccess(true);
                          setReviewComment('');
                        }}
                        sx={{ alignSelf: 'flex-start', fontWeight: 700, borderRadius: '8px' }}
                      >
                        Submit Rating
                      </Button>
                    </Box>
                  )}
                </Box>
              )}

            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={() => handleDownloadInvoice(selectedOrder)} startIcon={<LocalShippingIcon />} sx={{ fontWeight: 700 }}>
                Invoice
              </Button>
              <Button onClick={() => { setSelectedOrder(null); setSubmitSuccess(false); }} variant="contained">
                Close Details
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

    </Grid>
  );
};

export default CustomerProfile;
