import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { ThemeProvider } from '@mui/material/styles';
import { getTheme } from '../theme';
import {
  Box,
  CircularProgress,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid
} from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

// Subcomponents
import DashboardLayout from '../components/SuperAdmin/DashboardLayout';
import SummaryCards from '../components/SuperAdmin/SummaryCards';
import FleetMap from '../components/SuperAdmin/FleetMap';
import DeliveryTable from '../components/SuperAdmin/DeliveryTable';
import DriverCards from '../components/SuperAdmin/DriverCards';
import VehicleTable from '../components/SuperAdmin/VehicleTable';
import AnalyticsCharts from '../components/SuperAdmin/AnalyticsCharts';
import SupportCenter from '../components/SuperAdmin/SupportCenter';
import ReportsPage from '../components/SuperAdmin/ReportsPage';
import AuditLogs from '../components/SuperAdmin/AuditLogs';
import SettingsPage from '../components/SuperAdmin/SettingsPage';

// Standard Pages that can be embedded as tabs
import RejectionRequests from './RejectionRequests';
import Settings from './Settings';

// Redux Actions
import { fetchDeliveries, createDelivery, assignDriverToDelivery, updateDeliveryStatus, deleteDelivery } from '../store/slices/deliverySlice';
import { fetchDrivers, addDriver, updateDriver, deleteDriver } from '../store/slices/driverSlice';

const SuperAdminDashboard = () => {
  const dispatch = useDispatch();
  const { accessToken } = useSelector((state) => state.auth);
  
  // Tab index selection
  const [currentTab, setCurrentTab] = useState(0);
  
  // Theme Mode (light or dark)
  const [themeMode, setThemeMode] = useState(localStorage.getItem('sys_theme_mode') || 'light');

  const localTheme = React.useMemo(() => getTheme(themeMode), [themeMode]);

  // Loading states
  const [globalLoading, setGlobalLoading] = useState(true);

  // Administrative local states (fetched directly via Axios)
  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [settings, setSettings] = useState({});
  const [analyticsStats, setAnalyticsStats] = useState(null);
  const [orders, setOrders] = useState([]);

  // Redux selectors for deliveries and drivers
  const { deliveries } = useSelector((state) => state.deliveries);
  const { drivers } = useSelector((state) => state.drivers);

  // WebSocket notifications mock queue for layout notification bell
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Driver John Doe submitted a route rejection request', read: false, time: '2 mins ago' },
    { id: 2, message: 'New high priority delivery created to Electronic City', read: false, time: '10 mins ago' },
    { id: 3, message: 'Support Case ticket ID 4893 created by customer', read: true, time: '1 hour ago' }
  ]);

  const toggleThemeMode = () => {
    const nextTheme = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(nextTheme);
    localStorage.setItem('sys_theme_mode', nextTheme);
  };

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  // Fetch all dashboard data
  const loadDashboardData = async () => {
    try {
      // 1. Redux dispatches
      dispatch(fetchDeliveries());
      dispatch(fetchDrivers());

      // 2. Fetch admin entities in parallel
      const [vehiclesRes, usersRes, ticketsRes, logsRes, settingsRes, analyticsRes, ordersRes] = await Promise.all([
        axios.get('/api/admin/vehicles', getAuthHeaders()),
        axios.get('/api/admin/users', getAuthHeaders()),
        axios.get('/api/admin/tickets', getAuthHeaders()),
        axios.get('/api/admin/audit-logs', getAuthHeaders()),
        axios.get('/api/admin/settings', getAuthHeaders()),
        axios.get('/api/analytics/dashboard', getAuthHeaders()).catch(() => ({ data: { data: null } })),
        axios.get('/api/orders', getAuthHeaders()).catch(() => ({ data: { data: [] } }))
      ]);

      setVehicles(vehiclesRes.data.data);
      setUsers(usersRes.data.data);
      setTickets(ticketsRes.data.data);
      setAuditLogs(logsRes.data.data);
      setSettings(settingsRes.data.data);
      if (analyticsRes.data.data) {
        setAnalyticsStats(analyticsRes.data.data);
      }
      if (ordersRes.data.data) {
        setOrders(ordersRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching admin dashboard telemetry:', error.message);
    } finally {
      setGlobalLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      loadDashboardData();
    }
  }, [accessToken, dispatch]);

  // Telemetry polling loop to refresh coordinate vectors and metrics every 5 seconds
  useEffect(() => {
    if (!accessToken) return;
    const interval = setInterval(() => {
      loadDashboardData();
    }, 5000);
    return () => clearInterval(interval);
  }, [accessToken]);

  // Operations: VEHICLES CRUD
  const handleCreateVehicle = async (vehicleData) => {
    try {
      const res = await axios.post('/api/admin/vehicles', vehicleData, getAuthHeaders());
      setVehicles(prev => [res.data.data, ...prev]);
      loadDashboardData(); // Refresh logs
    } catch (err) {
      alert('Error creating vehicle: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateVehicle = async (id, vehicleData) => {
    try {
      const res = await axios.put(`/api/admin/vehicles/${id}`, vehicleData, getAuthHeaders());
      setVehicles(prev => prev.map(v => v._id === id ? res.data.data : v));
      loadDashboardData(); // Refresh logs
    } catch (err) {
      alert('Error updating vehicle: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle registration?')) return;
    try {
      await axios.delete(`/api/admin/vehicles/${id}`, getAuthHeaders());
      setVehicles(prev => prev.filter(v => v._id !== id));
      loadDashboardData(); // Refresh logs
    } catch (err) {
      alert('Error deleting vehicle: ' + (err.response?.data?.message || err.message));
    }
  };

  // Operations: USERS BLOCK/SUSPEND
  const handleToggleUserStatus = async (userId, newStatus) => {
    try {
      await axios.put(`/api/admin/users/${userId}/status`, { status: newStatus }, getAuthHeaders());
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, suspended: newStatus === 'blocked' } : u));
      loadDashboardData(); // Refresh logs & driver roster lists
    } catch (err) {
      alert('Error toggling user suspension: ' + (err.response?.data?.message || err.message));
    }
  };

  // Operations: RESOLVE SUPPORT TICKETS
  const handleResolveTicket = async (id, status) => {
    try {
      const res = await axios.put(`/api/admin/tickets/${id}`, { status }, getAuthHeaders());
      setTickets(prev => prev.map(t => t._id === id ? res.data.data : t));
      loadDashboardData(); // Refresh logs
    } catch (err) {
      alert('Error resolving ticket: ' + (err.response?.data?.message || err.message));
    }
  };

  // Operations: SYSTEM GLOBAL PREFERENCES
  const handleSaveSettings = async (updatedSettings) => {
    try {
      const res = await axios.put('/api/admin/settings', updatedSettings, getAuthHeaders());
      setSettings(res.data.data);
      loadDashboardData(); // Refresh logs
    } catch (err) {
      alert('Error saving global configuration: ' + (err.response?.data?.message || err.message));
    }
  };

  // Operations: DELIVERIES CRUD WRAPPERS FOR REDUX
  const handleCreateDelivery = (deliveryPayload) => {
    dispatch(createDelivery(deliveryPayload)).unwrap().then(() => loadDashboardData());
  };

  const handleAssignDriver = (deliveryId, driverId) => {
    dispatch(assignDriverToDelivery({ deliveryId, driverId })).unwrap().then(() => loadDashboardData());
  };

  const handleUpdateDeliveryStatus = (deliveryId, status) => {
    dispatch(updateDeliveryStatus({ deliveryId, status })).unwrap().then(() => loadDashboardData());
  };

  const handleDeleteDelivery = (id) => {
    if (!window.confirm('Delete this logistics order permanently from history?')) return;
    dispatch(deleteDelivery(id)).unwrap().then(() => loadDashboardData());
  };

  // Operations: DRIVERS CRUD WRAPPERS FOR REDUX
  const handleRegisterDriver = (driverPayload) => {
    dispatch(addDriver(driverPayload)).unwrap().then(() => loadDashboardData());
  };

  const handleUpdateDriver = (id, driverPayload) => {
    dispatch(updateDriver({ id, driverData: driverPayload })).unwrap().then(() => loadDashboardData());
  };

  const handleDeleteDriver = (id) => {
    if (!window.confirm('Deregister driver profile and remove license authorization?')) return;
    dispatch(deleteDriver(id)).unwrap().then(() => loadDashboardData());
  };

  // Mark all notifications as read
  const handleOpenNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Filter customers out of users
  const customers = users.filter(u => u.role === 'customer');

  // Generate simulated payments based on actual order objects in database
  const mockPayments = orders.map((o, index) => {
    return {
      id: `TXN-${o._id.toString().slice(-6).toUpperCase()}`,
      trackingId: o.orderId,
      customerName: o.recipientName || (o.customer?.name || 'Cash Customer'),
      amount: `$${Number(o.totalAmount).toFixed(2)}`,
      method: o.paymentMethod || 'UPI / NetBanking',
      date: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
      status: o.status === 'Delivered' ? 'Settled' : 'Pending Escrow'
    };
  });

  if (globalLoading) {
    return (
      <ThemeProvider theme={localTheme}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor={themeMode === 'light' ? '#F8FAFC' : '#070a13'}>
          <Box textAlign="center">
            <CircularProgress color="primary" size={60} />
            <Typography variant="h6" sx={{ mt: 3, color: themeMode === 'light' ? '#1E293B' : '#F8FAFC', fontWeight: 700 }}>
              Initializing TrackFlow Command Room...
            </Typography>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={localTheme}>
      <DashboardLayout
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        themeMode={themeMode}
        toggleThemeMode={toggleThemeMode}
        notifications={notifications}
        onOpenNotifications={handleOpenNotifications}
      >
      {/* 0. DASHBOARD MAIN TAB */}
      {currentTab === 0 && (
        <Box>
          <Box mb={4}>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
              Control Tower Control Room
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Central command console for real-time logistics, fleet operations telemetry, and system monitoring.
            </Typography>
          </Box>
          
          <SummaryCards stats={{ summary: { ...analyticsStats?.summary, totalDrivers: drivers.length, activeDrivers: drivers.filter(d => d.status !== 'offline').length } }} themeMode={themeMode} />

          <Grid container spacing={3.5} sx={{ mt: 2.5 }}>
            <Grid item xs={12} lg={7}>
              {/* Embed Live Radar fallback in Dashboard tab */}
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>
                Live Radar Telemetry
              </Typography>
              <FleetMap deliveries={deliveries} drivers={drivers} themeMode={themeMode} onRefresh={loadDashboardData} />
            </Grid>
            
            <Grid item xs={12} lg={5}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>
                Recent Operational Audit Trail
              </Typography>
              <Paper sx={{ p: 3, borderRadius: '16px', border: themeMode === 'light' ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.06)', bgcolor: themeMode === 'light' ? '#FFFFFF' : '#1E293B' }}>
                <Box display="flex" flexDirection="column" gap={2}>
                  {auditLogs.slice(0, 5).map((log, idx) => (
                    <Box key={idx} sx={{ borderBottom: idx < 4 ? '1px solid rgba(0,0,0,0.05)' : 'none', pb: idx < 4 ? 2 : 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {log.action}
                      </Typography>
                      <Box display="flex" justifyContent="space-between" mt={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          Operator: {log.userName || 'System'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                  {auditLogs.length === 0 && (
                    <Typography variant="body2" color="text.secondary" align="center">
                      No activity logs logged.
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* 1. DELIVERIES TAB */}
      {currentTab === 1 && (
        <DeliveryTable
          deliveries={deliveries}
          drivers={drivers}
          themeMode={themeMode}
          onAssignDriver={handleAssignDriver}
          onUpdateStatus={handleUpdateDeliveryStatus}
          onDeleteDelivery={handleDeleteDelivery}
          onCreateDelivery={handleCreateDelivery}
        />
      )}

      {/* 2. DRIVERS TAB */}
      {currentTab === 2 && (
        <DriverCards
          drivers={drivers}
          themeMode={themeMode}
          onToggleStatus={handleToggleUserStatus}
          onAddDriver={handleRegisterDriver}
          onEditDriver={handleUpdateDriver}
          onDeleteDriver={handleDeleteDriver}
        />
      )}

      {/* 3. VEHICLES TAB */}
      {currentTab === 3 && (
        <VehicleTable
          vehicles={vehicles}
          drivers={drivers}
          themeMode={themeMode}
          onCreateVehicle={handleCreateVehicle}
          onUpdateVehicle={handleUpdateVehicle}
          onDeleteVehicle={handleDeleteVehicle}
        />
      )}

      {/* 4. CUSTOMERS DIRECTORY TAB */}
      {currentTab === 4 && (
        <Paper
          sx={{
            borderRadius: '16px',
            bgcolor: themeMode === 'light' ? '#FFFFFF' : '#1E293B',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            border: themeMode === 'light' ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.08)',
            p: 3,
            overflow: 'hidden'
          }}
        >
          <Box mb={3}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Registered Customers Directory
            </Typography>
            <Typography variant="caption" color="text.secondary">
              View registered customer accounts, manage their platform access, and suspend/block access.
            </Typography>
          </Box>

          <TableContainer sx={{ border: themeMode === 'light' ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
            <Table>
              <TableHead sx={{ bgcolor: themeMode === 'light' ? '#F8FAFC' : '#0F172A' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, width: 80 }} />
                  <TableCell sx={{ fontWeight: 800 }}>Customer Name</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Email Address</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Registered Date</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Account Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800 }}>Action Override</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.map((cust, idx) => (
                  <TableRow key={cust._id || idx} hover>
                    <TableCell />
                    <TableCell sx={{ fontWeight: 700 }}>{cust.name}</TableCell>
                    <TableCell>{cust.email}</TableCell>
                    <TableCell>{cust.createdAt ? new Date(cust.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={cust.suspended ? 'SUSPENDED' : 'ACTIVE'}
                        color={cust.suspended ? 'error' : 'success'}
                        size="small"
                        sx={{ fontWeight: 800, fontSize: '0.65rem' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {cust.suspended ? (
                        <Button
                          variant="outlined"
                          color="success"
                          size="small"
                          startIcon={<CheckCircleOutlineIcon />}
                          onClick={() => handleToggleUserStatus(cust._id, 'active')}
                          sx={{ fontSize: '0.65rem', py: 0.3, px: 1, fontWeight: 800, borderRadius: '6px' }}
                        >
                          Unlock Account
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<BlockIcon />}
                          onClick={() => handleToggleUserStatus(cust._id, 'blocked')}
                          sx={{ fontSize: '0.65rem', py: 0.3, px: 1, fontWeight: 800, borderRadius: '6px' }}
                        >
                          Suspend User
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {customers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        No registered customer profiles found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* 5. DRIVER REJECTIONS TAB */}
      {currentTab === 5 && (
        <Box>
          <RejectionRequests />
        </Box>
      )}

      {/* 6. BUSINESS INTEL ANALYTICS TAB */}
      {currentTab === 6 && (
        <AnalyticsCharts stats={analyticsStats} themeMode={themeMode} />
      )}

      {/* 7. LIVE FLEET RADAR MAP TAB */}
      {currentTab === 7 && (
        <Box>
          <Box mb={3.5}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Live Telemetry Grid radar
            </Typography>
            <Typography variant="caption" color="text.secondary">
              GPS tracking for fleet couriers in transit.
            </Typography>
          </Box>
          <FleetMap deliveries={deliveries} drivers={drivers} themeMode={themeMode} onRefresh={loadDashboardData} />
        </Box>
      )}

      {/* 8. PAYMENTS TRACKER TAB */}
      {currentTab === 8 && (
        <Paper
          sx={{
            borderRadius: '16px',
            bgcolor: themeMode === 'light' ? '#FFFFFF' : '#1E293B',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            border: themeMode === 'light' ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.08)',
            p: 3,
            overflow: 'hidden'
          }}
        >
          <Box mb={3}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Platform Payments & Financial Settling
            </Typography>
            <Typography variant="caption" color="text.secondary">
              List of financial escrow transactions auto-released upon successful cargo delivery.
            </Typography>
          </Box>

          <TableContainer sx={{ border: themeMode === 'light' ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
            <Table>
              <TableHead sx={{ bgcolor: themeMode === 'light' ? '#F8FAFC' : '#0F172A' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, width: 80 }} />
                  <TableCell sx={{ fontWeight: 800 }}>Transaction ID</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Logistics ID</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Customer Name</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Settlement Valuation</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Billing Gateway</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Payment Date</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Release Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockPayments.map((pay, idx) => (
                  <TableRow key={pay.id || idx} hover>
                    <TableCell />
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{pay.id}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{pay.trackingId}</TableCell>
                    <TableCell>{pay.customerName}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{pay.amount}</TableCell>
                    <TableCell>{pay.method}</TableCell>
                    <TableCell>{pay.date}</TableCell>
                    <TableCell>
                      <Chip
                        label={pay.status}
                        color="success"
                        size="small"
                        sx={{ fontWeight: 800, fontSize: '0.65rem' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {mockPayments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        No financial settlements processed. Deliver items to trigger billing.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* 9. SUPPORT TICKETS TAB */}
      {currentTab === 9 && (
        <SupportCenter tickets={tickets} themeMode={themeMode} onResolveTicket={handleResolveTicket} />
      )}

      {/* 10. DOWNLOADS CENTER TAB */}
      {currentTab === 10 && (
        <ReportsPage deliveries={deliveries} drivers={drivers} themeMode={themeMode} />
      )}

      {/* 11. LOCAL SETTINGS TAB */}
      {currentTab === 11 && (
        <Settings />
      )}

      {/* 12. AUDIT LOGS TAB */}
      {currentTab === 12 && (
        <AuditLogs logs={auditLogs} themeMode={themeMode} />
      )}

      {/* 13. SYSTEM CONFIG TAB */}
      {currentTab === 13 && (
        <SettingsPage settings={settings} themeMode={themeMode} onSaveSettings={handleSaveSettings} />
      )}
    </DashboardLayout>
    </ThemeProvider>
  );
};

export default SuperAdminDashboard;
export { SuperAdminDashboard };
