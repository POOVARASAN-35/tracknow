import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { getTheme } from '../theme';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Rating,
  Chip,
  Badge,
  TextField,
  MenuItem,
  Paper,
  InputAdornment
} from '@mui/material';
import DashboardLayout from '../components/Customer/DashboardLayout';
import TrackingMap from '../components/Customer/TrackingMap';
import OrderTable from '../components/Customer/OrderTable';
import OrderCard from '../components/Customer/OrderCard';
import ProfileCard from '../components/Customer/ProfileCard';
import CustomerProfile from './CustomerProfile';
import AnalyticsChart from '../components/Customer/AnalyticsChart';
import CustomerBillingLog from './CustomerBillingLog';
import SupportSection from '../components/Customer/SupportSection';
import SettingsPage from '../components/Customer/SettingsPage';
import NotificationPanel from '../components/Customer/NotificationPanel';
import { fetchDeliveries } from '../store/slices/deliverySlice';
import { fetchCart, addToCart, removeFromCart, clearCart, fetchProducts } from '../store/slices/cartSlice';
import { placeOrder, fetchOrders, submitReview } from '../store/slices/orderSlice';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

// Icons
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from '@mui/icons-material/Person';
import BarChartIcon from '@mui/icons-material/BarChart';
import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import SettingsIcon from '@mui/icons-material/Settings';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const CustomerDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { deliveries } = useSelector((state) => state.deliveries);
  const { products, cart } = useSelector((state) => state.cart);
  const { orders } = useSelector((state) => state.orders);

  // States
  const [currentTab, setCurrentTab] = useState(0);
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('customerThemeMode') || 'dark');
  const localTheme = useMemo(() => getTheme(themeMode), [themeMode]);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Delivery Dispatch', message: 'Driver started delivery for TRK-98124801', type: 'delivery_started', timestamp: new Date(), read: false },
    { id: 2, title: 'Package Picked Up', message: 'Package was successfully picked up from warehouse.', type: 'delivery_assigned', timestamp: new Date(Date.now() - 3600000), read: true }
  ]);

  // Checkout Form States
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [pickupAddressText, setPickupAddressText] = useState('KA-Hub Bengaluru Central Warehouse');
  const [pickupAddressLng, setPickupAddressLng] = useState(77.5946);
  const [pickupAddressLat, setPickupAddressLat] = useState(12.9716);
  const [deliveryAddressText, setDeliveryAddressText] = useState('Electronic City Tech Hub Phase 1');
  const [deliveryAddressLng, setDeliveryAddressLng] = useState(77.6727);
  const [deliveryAddressLat, setDeliveryAddressLat] = useState(12.8452);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Review & Rating States
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewedOrders, setReviewedOrders] = useState({});

  useEffect(() => {
    dispatch(fetchDeliveries());
    dispatch(fetchProducts());
    dispatch(fetchCart());
    dispatch(fetchOrders());
  }, [dispatch]);

  // Set up socket listener for live alerts
  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('Customer live socket alerts channels open');
    });

    socket.on('notification', (newNotif) => {
      setNotifications(prev => [
        {
          id: Date.now(),
          title: newNotif.title,
          message: newNotif.message,
          type: newNotif.type || 'info',
          timestamp: new Date(),
          read: false
        },
        ...prev
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleToggleTheme = () => {
    setThemeMode(prev => {
      const nextTheme = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('customerThemeMode', nextTheme);
      return nextTheme;
    });
  };

  const handleDownloadInvoice = (order) => {
    const matchingOrd = orders && orders.find(ord => ord.orderId === order.trackingId);
    const orderItems = matchingOrd ? matchingOrd.items : [];
    const paymentMethodText = matchingOrd ? matchingOrd.paymentMethod : 'UPI';
    const totalVal = matchingOrd ? matchingOrd.totalAmount : (order.route?.distance ? order.route.distance * 2.5 : 25.00);

    let itemsText = '';
    if (orderItems.length > 0) {
      itemsText = orderItems.map(item => `  - ${item.product.name} x${item.quantity}: $${(item.product.price * item.quantity).toFixed(2)}`).join('\n');
    } else {
      itemsText = '  - Express Courier Shipping Manifest';
    }

    const invoiceContent = `================================================
TRACKFLOW LOGISTICS - SHIPMENT INVOICE
================================================
Order ID: ${order.trackingId}
Date: ${order.createdAt ? new Date(order.createdAt).toLocaleString() : new Date().toLocaleString()}
Status: ${order.status.toUpperCase()}

CUSTOMER DETAILS:
Name: ${order.customer?.name || 'Jane Customer'}
Email: ${order.customer?.email || 'customer@tracknow.com'}
Phone: ${order.customer?.phone || 'N/A'}

ROUTE DETAILS:
Pickup Address: ${order.pickupAddress?.text}
Destination Address: ${order.deliveryAddress?.text}
Distance: ${order.route?.distance || 0} km

ITEMS DETAIL:
${itemsText}

------------------------------------------------
TOTAL AMOUNT PAID: $${Number(totalVal).toFixed(2)}
Payment Method: ${paymentMethodText}
------------------------------------------------

DELIVERY VERIFICATION:
Recipient Signature: ${order.proofOfDelivery?.customerSignature || 'N/A'}
Delivery Photo URL: ${order.proofOfDelivery?.deliveryPhoto || 'N/A'}
Timestamp: ${order.proofOfDelivery?.timestamp ? new Date(order.proofOfDelivery.timestamp).toLocaleString() : 'N/A'}
================================================`;

    const element = document.createElement("a");
    const file = new Blob([invoiceContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Invoice_${order.trackingId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const handleMarkAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // Stats computation
  const activeOrders = useMemo(() => {
    return deliveries.filter(d => ['assigned', 'accepted', 'picked_up', 'in_transit'].includes(d.status));
  }, [deliveries]);

  const completedOrders = useMemo(() => {
    return deliveries.filter(d => d.status === 'delivered');
  }, [deliveries]);

  const cancelledOrders = useMemo(() => {
    return deliveries.filter(d => d.status === 'cancelled');
  }, [deliveries]);

  const stats = useMemo(() => {
    const total = deliveries.length;
    const active = activeOrders.length;
    const completed = completedOrders.length;
    const cancelled = cancelledOrders.length;
    return { total, active, completed, cancelled };
  }, [deliveries, activeOrders, completedOrders, cancelledOrders]);

  const primaryActiveOrder = useMemo(() => {
    return activeOrders[0] || null;
  }, [activeOrders]);

  // Delivery status step helper
  const getActiveStep = (status) => {
    switch (status) {
      case 'pending': return 0;
      case 'assigned':
      case 'accepted': return 1;
      case 'picked_up': return 2;
      case 'in_transit': return 3;
      case 'delivered': return 5;
      default: return 0;
    }
  };

  const steps = ['Order Created', 'Driver Assigned', 'Package Picked Up', 'In Transit', 'Delivered'];

  // Handle Search ID from Header
  const handleHeaderSearch = (searchId) => {
    const matched = deliveries.find(d => d.trackingId?.toLowerCase() === searchId.toLowerCase());
    if (matched) {
      setSelectedOrderDetails(matched);
    } else {
      alert('Tracking ID not found in your orders.');
    }
  };

  return (
    <ThemeProvider theme={localTheme}>
      <DashboardLayout
        currentThemeMode={themeMode}
        onToggleTheme={handleToggleTheme}
        onSearch={handleHeaderSearch}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenNotifications={() => setNotificationsOpen(true)}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      >
      <Box sx={{ mb: 4 }}>
        {/* Welcome Section */}
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Overview
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 900 }}>
          Hello, {user?.name || 'John'} 👋
        </Typography>
      </Box>

      {/* Render selected Tab Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
        >
          {/* TAB 0: MAIN DASHBOARD */}
          {currentTab === 0 && (
            <Grid container spacing={3}>
              {/* Stats overview */}
              <Grid item xs={12}>
                <Grid container spacing={3}>
                  {[
                    { title: 'Total Orders', count: stats.total, pct: '+12%', color: '#2563EB', glow: 'rgba(37, 99, 235, 0.08)' },
                    { title: 'In Transit', count: stats.active, pct: 'Active', color: '#F59E0B', glow: 'rgba(245, 158, 11, 0.08)' },
                    { title: 'Delivered', count: stats.completed, pct: 'Completed', color: '#10B981', glow: 'rgba(16, 185, 129, 0.08)' },
                    { title: 'Cancelled', count: stats.cancelled, pct: 'Aborted', color: '#EF4444', glow: 'rgba(239, 68, 68, 0.08)' }
                  ].map((card, idx) => (
                    <Grid item xs={12} sm={6} md={3} key={idx}>
                      <Card 
                        component={motion.div}
                        whileHover={{ y: -4, boxShadow: `0 8px 30px ${card.glow}` }}
                        sx={{ 
                          bgcolor: themeMode === 'light' ? '#fff' : '#0f1424',
                          border: `1px solid ${themeMode === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.06)'}`,
                          borderRadius: '16px'
                        }}
                      >
                        <CardContent sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                              {card.title}
                            </Typography>
                            <Typography variant="h3" sx={{ fontWeight: 900, my: 1 }}>
                              {card.count}
                            </Typography>
                            <Typography variant="caption" sx={{ color: card.color, fontWeight: 800 }}>
                              {card.pct}
                            </Typography>
                          </Box>
                          <Box sx={{ width: 8, height: 48, borderRadius: '4px', bgcolor: card.color }} />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              {/* Map view & Timeline */}
              <Grid item xs={12} md={7}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                  Live Delivery Tracking
                </Typography>
                <TrackingMap activeDelivery={primaryActiveOrder} currentThemeMode={themeMode} />
              </Grid>

              {/* Status Timeline */}
              <Grid item xs={12} md={5}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                  Current Delivery Status
                </Typography>
                <Card sx={{ 
                  bgcolor: themeMode === 'light' ? '#fff' : '#0f1424',
                  border: `1px solid ${themeMode === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.06)'}`,
                  p: 3,
                  height: 'calc(100% - 32px)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  borderRadius: '16px'
                }}>
                  {primaryActiveOrder ? (
                    <Box>
                      <Box display="flex" justifyContent="space-between" mb={3}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                          Order ID: {primaryActiveOrder.trackingId}
                        </Typography>
                        <Chip label={primaryActiveOrder.status.toUpperCase()} color="warning" size="small" sx={{ fontWeight: 700, fontSize: '0.65rem' }} />
                      </Box>
                      <Stepper activeStep={getActiveStep(primaryActiveOrder.status)} orientation="vertical">
                        {steps.map((label, idx) => (
                          <Step key={label}>
                            <StepLabel>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>{label}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {idx <= getActiveStep(primaryActiveOrder.status) ? 'Updated recently' : 'Awaiting status'}
                              </Typography>
                            </StepLabel>
                          </Step>
                        ))}
                      </Stepper>
                      
                      {orders && orders.find(o => o.orderId === primaryActiveOrder.trackingId)?.otpCode && (
                        <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(37, 99, 235, 0.08)', borderRadius: 2, border: '1px dashed #2563EB', textAlign: 'center' }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                            DELIVERY VERIFICATION OTP
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 900, color: '#2563EB', letterSpacing: 4 }}>
                            {orders.find(o => o.orderId === primaryActiveOrder.trackingId).otpCode}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Provide this OTP to the driver to verify and complete delivery.
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                      No active shipments running.
                    </Typography>
                  )}
                </Card>
              </Grid>
            </Grid>
          )}

          {/* TAB 1: ORDER TABLE */}
          {currentTab === 1 && (
            <OrderTable 
              orders={deliveries} 
              onViewDetails={(order) => setSelectedOrderDetails(order)} 
              currentThemeMode={themeMode} 
            />
          )}

          {/* TAB 2: ORDER HISTORY CARDS */}
          {currentTab === 2 && (
            <Grid container spacing={3}>
              {completedOrders.map((o) => (
                <Grid item xs={12} sm={6} md={4} key={o._id || o.id}>
                  <OrderCard 
                    order={o} 
                    currentThemeMode={themeMode} 
                    onDownloadInvoice={(order) => setSelectedOrderDetails(order)}
                    onRepeatOrder={(order) => {
                      alert(`Repeating Order: ${order.trackingId}. Redirecting to setup...`);
                    }}
                  />
                  
                  {/* Rating / Review Driver Form */}
                  <Card sx={{ mt: 1.5, p: 2.5, borderRadius: '12px', bgcolor: themeMode === 'light' ? '#fff' : '#111827', border: `1px solid ${themeMode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}` }}>
                    {reviewedOrders[o.trackingId] || (orders && orders.find(ord => ord.orderId === o.trackingId)?.reviewId) ? (
                      <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 800, textAlign: 'center', py: 1 }}>
                        ✓ Rated & Reviewed
                      </Typography>
                    ) : (
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 1 }}>
                          RATE DRIVER & DELIVERY RUN
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Rating 
                            value={reviewRating} 
                            onChange={(e, val) => {
                              setReviewRating(val);
                            }} 
                          />
                        </Box>
                        <TextField 
                          placeholder="Write feedback comment..." 
                          size="small" 
                          fullWidth 
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          sx={{ mb: 1.5, '& .MuiInputBase-input': { fontSize: '0.8rem' } }}
                        />
                        <Button 
                          variant="outlined" 
                          size="small" 
                          color="primary"
                          fullWidth 
                          onClick={async () => {
                            const matchingOrd = orders && orders.find(ord => ord.orderId === o.trackingId);
                            if (!matchingOrd) {
                              alert('Order details not synchronized in system yet.');
                              return;
                            }
                            try {
                              await dispatch(submitReview({
                                orderId: matchingOrd._id,
                                rating: reviewRating,
                                comment: reviewComment
                              })).unwrap();
                              alert('Review submitted successfully!');
                              setReviewedOrders(prev => ({ ...prev, [o.trackingId]: true }));
                              setReviewComment('');
                              dispatch(fetchOrders());
                            } catch (err) {
                              alert('Failed to submit review: ' + err);
                            }
                          }}
                          sx={{ fontWeight: 800, borderRadius: '6px', fontSize: '0.7rem' }}
                        >
                          Submit Review
                        </Button>
                      </Box>
                    )}
                  </Card>
                </Grid>
              ))}
              {completedOrders.length === 0 && (
                <Grid item xs={12}>
                  <Card sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      No historical orders registered.
                    </Typography>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}

          {/* TAB 3: PROFILE & LOCATION MANAGEMENT */}
          {currentTab === 3 && (
            <CustomerProfile currentThemeMode={themeMode} />
          )}

          {/* TAB 4: ANALYTICS */}
          {currentTab === 4 && (
            <AnalyticsChart currentThemeMode={themeMode} />
          )}

          {/* TAB 5: BILLING LOGS */}
          {currentTab === 5 && (
            <CustomerBillingLog currentThemeMode={themeMode} />
          )}

          {/* TAB 6: SUPPORT */}
          {currentTab === 6 && (
            <SupportSection currentThemeMode={themeMode} />
          )}

          {/* TAB 7: SETTINGS */}
          {currentTab === 7 && (
            <SettingsPage currentThemeMode={themeMode} onToggleTheme={handleToggleTheme} />
          )}

          {/* TAB 8: BROWSE PRODUCTS */}
          {currentTab === 8 && (
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
                Available Logistics Catalog Products
              </Typography>
              <Grid container spacing={3}>
                {products && products.map((prod) => (
                  <Grid item xs={12} sm={6} md={3} key={prod._id}>
                    <Card sx={{ 
                      borderRadius: '16px',
                      bgcolor: themeMode === 'light' ? '#fff' : '#0f1424',
                      border: `1px solid ${themeMode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}`,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden'
                    }}>
                      {prod.image && (
                        <Box component="img" src={prod.image} alt={prod.name} sx={{ height: 140, objectFit: 'cover', borderBottom: `1px solid ${themeMode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}` }} />
                      )}
                      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', mb: 1 }}>
                          {prod.category} • {prod.weightClass.toUpperCase()}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                          {prod.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, mb: 2 }}>
                          {prod.description}
                        </Typography>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="h5" sx={{ fontWeight: 900 }}>
                            ${prod.price.toFixed(2)}
                          </Typography>
                          <Button 
                            variant="contained" 
                            size="small" 
                            onClick={() => {
                              dispatch(addToCart(prod._id));
                              alert(`${prod.name} added to cart!`);
                            }}
                            sx={{ fontWeight: 700, borderRadius: '8px', textTransform: 'none' }}
                          >
                            Add to Cart
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* TAB 9: CART & CHECKOUT */}
          {currentTab === 9 && (
            <Grid container spacing={4}>
              <Grid item xs={12} md={5}>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
                  Your Shopping Cart
                </Typography>
                <Card sx={{ 
                  borderRadius: '16px',
                  bgcolor: themeMode === 'light' ? '#fff' : '#0f1424',
                  border: `1px solid ${themeMode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}`,
                  p: 3
                }}>
                  {cart?.items?.length > 0 ? (
                    <Box display="flex" flexDirection="column" gap={2}>
                      {cart.items.map((item) => (
                        <Box key={item._id} display="flex" justifyContent="space-between" alignItems="center" pb={2} sx={{ borderBottom: `1px solid ${themeMode === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)'}` }}>
                          <Box sx={{ maxWidth: '60%' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                              {item.product?.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ${item.product?.price?.toFixed(2)} each
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Button size="small" variant="outlined" sx={{ minWidth: 24, p: 0.5 }} onClick={() => dispatch(removeFromCart(item.product?._id))}>-</Button>
                            <Typography variant="body2" sx={{ fontWeight: 800 }}>{item.quantity}</Typography>
                            <Button size="small" variant="outlined" sx={{ minWidth: 24, p: 0.5 }} onClick={() => dispatch(addToCart(item.product?._id))}>+</Button>
                          </Box>
                        </Box>
                      ))}
                      <Box display="flex" justifyContent="space-between" mt={2}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Total Value:</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: '#2563EB' }}>
                          ${cart.items.reduce((acc, curr) => acc + (curr.product?.price || 0) * curr.quantity, 0).toFixed(2)}
                        </Typography>
                      </Box>
                      <Button variant="outlined" color="error" fullWidth sx={{ mt: 2, fontWeight: 700, borderRadius: '8px' }} onClick={() => dispatch(clearCart())}>Clear Cart</Button>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                      Your cart is empty. Browse products and add items to place a shipping order!
                    </Typography>
                  )}
                </Card>
              </Grid>

              <Grid item xs={12} md={7}>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
                  Checkout & Place Logistics Order
                </Typography>
                <Card sx={{ 
                  borderRadius: '16px',
                  bgcolor: themeMode === 'light' ? '#fff' : '#0f1424',
                  border: `1px solid ${themeMode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}`,
                  p: 4
                }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="Recipient Full Name" 
                        fullWidth 
                        required 
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="Recipient Contact Phone" 
                        fullWidth 
                        required 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField 
                        label="Pickup Address Text" 
                        fullWidth 
                        required 
                        value={pickupAddressText}
                        onChange={(e) => setPickupAddressText(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField 
                        label="Pickup Longitude" 
                        fullWidth 
                        type="number"
                        value={pickupAddressLng}
                        onChange={(e) => setPickupAddressLng(Number(e.target.value))}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField 
                        label="Pickup Latitude" 
                        fullWidth 
                        type="number"
                        value={pickupAddressLat}
                        onChange={(e) => setPickupAddressLat(Number(e.target.value))}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField 
                        label="Delivery Address Text" 
                        fullWidth 
                        required 
                        value={deliveryAddressText}
                        onChange={(e) => setDeliveryAddressText(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField 
                        label="Delivery Longitude" 
                        fullWidth 
                        type="number"
                        value={deliveryAddressLng}
                        onChange={(e) => setDeliveryAddressLng(Number(e.target.value))}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField 
                        label="Delivery Latitude" 
                        fullWidth 
                        type="number"
                        value={deliveryAddressLat}
                        onChange={(e) => setDeliveryAddressLat(Number(e.target.value))}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        select 
                        label="Payment Method" 
                        fullWidth 
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      >
                        <MenuItem value="UPI">UPI / NetBanking</MenuItem>
                        <MenuItem value="Credit Card">Credit Card</MenuItem>
                        <MenuItem value="Cash on Delivery">Cash on Delivery</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="Special Delivery Instructions" 
                        fullWidth 
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        fullWidth 
                        size="large"
                        disabled={!cart?.items?.length}
                        onClick={async () => {
                          if (!recipientName || !phone || !pickupAddressText || !deliveryAddressText) {
                            alert('Please fill out all checkout fields.');
                            return;
                          }
                          const orderPayload = {
                            recipientName,
                            phone,
                            pickupAddress: {
                              text: pickupAddressText,
                              coordinates: [pickupAddressLng, pickupAddressLat]
                            },
                            deliveryAddress: {
                              text: deliveryAddressText,
                              coordinates: [deliveryAddressLng, deliveryAddressLat]
                            },
                            paymentMethod,
                            specialInstructions
                          };
                          try {
                            await dispatch(placeOrder(orderPayload)).unwrap();
                            alert('Order placed successfully!');
                            setCurrentTab(0); // Redirect to main dashboard
                            // Reset fields
                            setRecipientName('');
                            setPhone('');
                            setSpecialInstructions('');
                            dispatch(fetchDeliveries());
                          } catch (err) {
                            alert('Failed to place order: ' + err);
                          }
                        }}
                        sx={{ fontWeight: 800, py: 1.8, borderRadius: '10px' }}
                      >
                        Place Order & Generate Manifest
                      </Button>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            </Grid>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Dynamic Notifications sliding Panel */}
      <NotificationPanel
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        currentThemeMode={themeMode}
      />

      {/* Detailed Order popup modal */}
      <Dialog 
        open={Boolean(selectedOrderDetails)} 
        onClose={() => setSelectedOrderDetails(null)}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            bgcolor: themeMode === 'light' ? '#fff' : '#0f1424',
            backgroundImage: 'none',
            maxWidth: 600,
            width: '100%'
          }
        }}
      >
        {selectedOrderDetails && (
          <>
            <DialogTitle sx={{ fontWeight: 800 }}>
              Order Detail Sheet • {selectedOrderDetails.trackingId}
            </DialogTitle>
            <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    Weight
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {selectedOrderDetails.weight || '1.8 kg'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    Estimated ETA
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#2563EB' }}>
                    {selectedOrderDetails.eta ? new Date(selectedOrderDetails.eta).toLocaleTimeString() : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    Pickup Address
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {selectedOrderDetails.pickupAddress?.text}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    Destination Address
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {selectedOrderDetails.deliveryAddress?.text}
                  </Typography>
                </Grid>
              </Grid>

              <Divider />

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                  Timeline Logs
                </Typography>
                {selectedOrderDetails.timeline?.map((log, i) => (
                  <Box key={i} display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      {log.status.toUpperCase()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(log.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Divider />

              {/* Digital signature / Proof of delivery */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                  Verification & Proof of Delivery
                </Typography>
                {selectedOrderDetails.status === 'delivered' ? (
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" gap={2} alignItems="center">
                      <Box sx={{ border: '1px dashed rgba(255,255,255,0.2)', p: 1, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.02)', width: 120, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {selectedOrderDetails.proofOfDelivery?.customerSignature?.startsWith('data:image/') ? (
                          <Box component="img" src={selectedOrderDetails.proofOfDelivery.customerSignature} alt="Signature" sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        ) : (
                          <Typography variant="caption" sx={{ fontStyle: 'italic', fontFamily: 'monospace', fontWeight: 800 }}>
                            {selectedOrderDetails.proofOfDelivery?.customerSignature || 'Signed'}
                          </Typography>
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Digitally signed by recipient at destination location.
                      </Typography>
                    </Box>

                    {/* Proof Photos Grid */}
                    <Grid container spacing={2}>
                      {selectedOrderDetails.proofOfDelivery?.deliveryPhoto && (
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>DELIVERY PHOTO</Typography>
                          <Box component="img" src={selectedOrderDetails.proofOfDelivery.deliveryPhoto} sx={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
                        </Grid>
                      )}
                      {selectedOrderDetails.proofOfDelivery?.packagePhoto && (
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>PACKAGE PHOTO</Typography>
                          <Box component="img" src={selectedOrderDetails.proofOfDelivery.packagePhoto} sx={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    Verification signatures & proof photos will display once delivery completes.
                  </Typography>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => handleDownloadInvoice(selectedOrderDetails)}
                sx={{ mr: 'auto', fontWeight: 800, borderRadius: '8px', textTransform: 'none' }}
              >
                Download Invoice Manifest
              </Button>
              <Button onClick={() => setSelectedOrderDetails(null)} sx={{ fontWeight: 700 }}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </DashboardLayout>
    </ThemeProvider>
  );
};

export default CustomerDashboard;
