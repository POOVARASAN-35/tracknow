import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box } from '@mui/material';
import Sidebar from './components/Common/Sidebar';
import Navbar from './components/Common/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Import Pages
import CustomerLogin from './pages/CustomerLogin';
import DriverLogin from './pages/DriverLogin';
import SuperAdminLogin from './pages/SuperAdminLogin';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Deliveries from './pages/Deliveries';
import Drivers from './pages/Drivers';
import Zones from './pages/Zones';
import Analytics from './pages/Analytics';
import RejectionRequests from './pages/RejectionRequests';
import Settings from './pages/Settings';
import TrackingPortal from './pages/TrackingPortal';
import NotificationToast from './components/Common/NotificationToast';
import NotificationDetailsDialog from './components/Common/NotificationDetailsDialog';
import CustomerDashboard from './pages/CustomerDashboard';
import DriverDashboard from './pages/DriverDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SessionTimeoutModal from './components/Common/SessionTimeoutModal';
import ConfirmLogoutModal from './components/Common/ConfirmLogoutModal';

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#070a13' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <NotificationToast />
        <NotificationDetailsDialog />
        {/* Responsive padding and margin left matching the sidebar width */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 4,
            mt: 8,
            width: { sm: `calc(100% - 240px)` }
          }}
        >
          {children || <Outlet />}
        </Box>
      </Box>
    </Box>
  );
};

const DashboardDispatcher = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'customer') {
    return <CustomerDashboard />;
  }

  if (user.role === 'driver') {
    return <DriverDashboard />;
  }

  if (user.role === 'superadmin' || user.role === 'admin') {
    return <SuperAdminDashboard />;
  }

  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
};

const App = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <>
      <SessionTimeoutModal />
      <ConfirmLogoutModal />
      <Routes>
      {/* Public Guest Routes */}
      <Route path="/login" element={<CustomerLogin />} />
      <Route path="/login/customer" element={<CustomerLogin />} />
      <Route path="/login/driver" element={<DriverLogin />} />
      <Route path="/login/admin" element={<SuperAdminLogin />} />
      <Route path="/login/superadmin" element={<SuperAdminLogin />} />
      <Route path="/register" element={<Register />} />
      <Route path="/tracking" element={<TrackingPortal />} />

      {/* Universal Dashboard dispatcher */}
      <Route element={<ProtectedRoute allowedRoles={['customer', 'superadmin', 'admin', 'driver']} />}>
        <Route path="/dashboard" element={<DashboardDispatcher />} />
      </Route>

      {/* Role Protected Application Layout shell */}
      <Route element={<ProtectedRoute allowedRoles={['superadmin', 'admin', 'driver']} />}>
        {user?.role === 'driver' || user?.role === 'superadmin' || user?.role === 'admin' ? (
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        ) : (
          <Route element={<Layout />}>
            {/* Admin & Superadmin core features */}
            <Route element={<ProtectedRoute allowedRoles={['superadmin', 'admin']} />}>
              <Route path="/drivers" element={<Drivers />} />
              <Route path="/zones" element={<Zones />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/rejections" element={<RejectionRequests />} />
            </Route>

            {/* Combined courier & admin features */}
            <Route path="/deliveries" element={<Deliveries />} />
            <Route path="/settings" element={<Settings />} />

            {/* Catch-all fallback inside dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        )}
      </Route>

      {/* General fallback redirecting to login */}
      <Route path="*" element={<Navigate to={user?.role === 'customer' ? '/dashboard' : '/login'} replace />} />
    </Routes>
    </>
  );
};

export default App;
export { App };
