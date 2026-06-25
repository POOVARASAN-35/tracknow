import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Rating,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  Tooltip
} from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import BadgeIcon from '@mui/icons-material/Badge';
import StarIcon from '@mui/icons-material/Star';
import FilePresentIcon from '@mui/icons-material/FilePresent';

const DriverCards = ({
  drivers = [],
  themeMode = 'light',
  onToggleStatus, // triggers suspension of driver's user profile (userId, newStatus)
  onAddDriver,
  onEditDriver,
  onDeleteDriver
}) => {
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    onAddDriver({ name, email, password, licenseNumber });
    setCreateOpen(false);
    setName('');
    setEmail('');
    setPassword('');
    setLicenseNumber('');
  };

  const handleEditClick = (driver) => {
    setSelectedDriver(driver);
    setName(driver.user?.name || '');
    setLicenseNumber(driver.licenseNumber || '');
    setEditOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (selectedDriver) {
      onEditDriver(selectedDriver._id, { name, licenseNumber });
      setEditOpen(false);
      setSelectedDriver(null);
      setName('');
      setLicenseNumber('');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#10B981'; // Success Green
      case 'busy': return '#F59E0B'; // Warning Amber
      case 'offline': default: return '#64748B'; // Slate Grey
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'success';
    if (score >= 75) return 'info';
    if (score >= 50) return 'warning';
    return 'error';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3.5} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Fleet Drivers Directory
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Manage courier roster list, view performance scores, ratings, and account status.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          onClick={() => setCreateOpen(true)}
          sx={{ fontWeight: 700, borderRadius: '8px' }}
        >
          Add Fleet Driver
        </Button>
      </Box>

      <Grid container spacing={3}>
        {drivers.map((driver) => {
          const userObj = driver.user || {};
          const isSuspended = userObj.suspended === true;
          const driverId = driver._id;
          const userId = userObj._id;

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={driverId}>
              <Card
                sx={{
                  borderRadius: '16px',
                  bgcolor: themeMode === 'light' ? '#FFFFFF' : '#1E293B',
                  border: `1px solid ${themeMode === 'light' ? '#E2E8F0' : 'rgba(255,255,255,0.06)'}`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.06)'
                  },
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Suspended indicator banner */}
                {isSuspended && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bgcolor: 'error.main',
                      color: 'white',
                      textAlign: 'center',
                      py: 0.4,
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      zIndex: 1,
                      letterSpacing: 1
                    }}
                  >
                    ACCOUNT SUSPENDED
                  </Box>
                )}

                <CardContent sx={{ p: 3, pt: isSuspended ? 4.5 : 3 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={2.5}>
                    <Avatar
                      sx={{
                        width: 52,
                        height: 52,
                        bgcolor: isSuspended ? 'error.main' : '#2563EB',
                        fontSize: '1.2rem',
                        fontWeight: 800
                      }}
                    >
                      {userObj.name?.charAt(0).toUpperCase() || 'D'}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                        {userObj.name || 'Unknown Driver'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                        {userObj.email || 'No email provided'}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: getStatusColor(driver.status)
                          }}
                        />
                        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'capitalize', color: getStatusColor(driver.status) }}>
                          {driver.status || 'offline'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box display="flex" alignItems="center" gap={0.5} sx={{ mb: 0.5 }}>
                      <BadgeIcon fontSize="inherit" color="action" />
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                        License: {driver.licenseNumber || 'N/A'}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Rating
                        name="driver-rating"
                        value={driver.rating || 5}
                        precision={0.1}
                        readOnly
                        size="small"
                        emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                      />
                      <Typography variant="caption" sx={{ fontWeight: 800 }}>
                        {driver.rating?.toFixed(1) || '5.0'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Performance score slider */}
                  <Box sx={{ mb: 3 }}>
                    <Box display="flex" justifycontent="space-between" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                        Performance Score
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800 }} color={`${getScoreColor(driver.performanceScore || 100)}.main`}>
                        {driver.performanceScore || 100}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={driver.performanceScore || 100}
                      color={getScoreColor(driver.performanceScore || 100)}
                      sx={{ height: 5, borderRadius: 2 }}
                    />
                  </Box>

                  {/* Uploaded Documents summary */}
                  {driver.documents && driver.documents.length > 0 && (
                    <Box display="flex" alignItems="center" gap={0.5} mb={2.5}>
                      <FilePresentIcon fontSize="small" color="primary" />
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {driver.documents.length} verified documents
                      </Typography>
                    </Box>
                  )}

                  {/* Driver actions row */}
                  <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ borderTop: themeMode === 'light' ? '1px solid #F1F5F9' : '1px solid rgba(255,255,255,0.06)', pt: 2 }}>
                    <Box display="flex" gap={0.5}>
                      <Tooltip title="Edit Profile Details">
                        <IconButton size="small" onClick={() => handleEditClick(driver)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Roster Profile">
                        <IconButton size="small" color="error" onClick={() => onDeleteDriver(driverId)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    {isSuspended ? (
                      <Button
                        variant="outlined"
                        color="success"
                        size="small"
                        startIcon={<CheckCircleOutlineIcon />}
                        onClick={() => onToggleStatus(userId, 'active')}
                        sx={{ fontSize: '0.65rem', py: 0.3, px: 1, fontWeight: 800, borderRadius: '6px' }}
                      >
                        Activate
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<BlockIcon />}
                        onClick={() => onToggleStatus(userId, 'blocked')}
                        sx={{ fontSize: '0.65rem', py: 0.3, px: 1, fontWeight: 800, borderRadius: '6px' }}
                      >
                        Suspend
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}

        {drivers.length === 0 && (
          <Grid item xs={12}>
            <Box textAlign="center" py={6}>
              <Typography variant="body2" color="text.secondary">
                No drivers registered in the fleet database.
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* CREATE DRIVER DIALOG */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Add Fleet Driver</DialogTitle>
        <form onSubmit={handleCreateSubmit}>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Full Name"
              required
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              label="Email Address"
              type="email"
              required
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Account Password"
              type="password"
              required
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
            />
            <TextField
              label="Driver's License Number"
              required
              fullWidth
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              placeholder="e.g. DL-123456789012"
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setCreateOpen(false)} variant="outlined">Cancel</Button>
            <Button type="submit" variant="contained" color="primary">Register Courier</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* EDIT DRIVER DIALOG */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Edit Driver Details</DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Full Name"
              required
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              label="Driver's License Number"
              required
              fullWidth
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setEditOpen(false)} variant="outlined">Cancel</Button>
            <Button type="submit" variant="contained" color="primary">Update Profile</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default DriverCards;
