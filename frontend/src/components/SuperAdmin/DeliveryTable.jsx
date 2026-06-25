import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Box,
  Typography,
  Chip,
  TablePagination,
  TableSortLabel,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CloseIcon from '@mui/icons-material/Close';

const DeliveryTable = ({
  deliveries = [],
  drivers = [],
  themeMode = 'light',
  onAssignDriver,
  onUpdateStatus,
  onDeleteDelivery,
  onCreateDelivery
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [assignDriverId, setAssignDriverId] = useState('');

  // Create delivery state
  const [newDelivery, setNewDelivery] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    pickupAddressText: '',
    pickupLat: 12.9716,
    pickupLng: 77.5946,
    deliveryAddressText: '',
    deliveryLat: 12.9816,
    deliveryLng: 77.6046,
    priorityLevel: 'Medium',
    packageDetails: ''
  });

  // Handle columns sort
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Filter & Search Logic
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((item) => {
      const matchSearch = 
        item.trackingId?.toLowerCase().includes(search.toLowerCase()) ||
        item.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.deliveryAddress?.text?.toLowerCase().includes(search.toLowerCase()) ||
        item.assignedDriver?.name?.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || item.priorityLevel?.toLowerCase() === priorityFilter.toLowerCase();

      return matchSearch && matchStatus && matchPriority;
    }).sort((a, b) => {
      let aVal = a[orderBy];
      let bVal = b[orderBy];

      if (orderBy === 'customer') {
        aVal = a.customer?.name || '';
        bVal = b.customer?.name || '';
      } else if (orderBy === 'driver') {
        aVal = a.assignedDriver?.name || '';
        bVal = b.assignedDriver?.name || '';
      } else if (orderBy === 'destination') {
        aVal = a.deliveryAddress?.text || '';
        bVal = b.deliveryAddress?.text || '';
      }

      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }, [deliveries, search, statusFilter, priorityFilter, order, orderBy]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedDeliveries = useMemo(() => {
    return filteredDeliveries.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredDeliveries, page, rowsPerPage]);

  const handleExportCSV = () => {
    const headers = ['Tracking ID', 'Customer Name', 'Customer Email', 'Customer Phone', 'Pickup Address', 'Destination Address', 'Priority', 'Status', 'Driver', 'ETA'];
    const rows = filteredDeliveries.map((item) => [
      item.trackingId || '',
      item.customer?.name || '',
      item.customer?.email || '',
      item.customer?.phone || '',
      `"${item.pickupAddress?.text?.replace(/"/g, '""') || ''}"`,
      `"${item.deliveryAddress?.text?.replace(/"/g, '""') || ''}"`,
      item.priorityLevel || 'Medium',
      item.status || '',
      item.assignedDriver?.name || 'Unassigned',
      item.eta ? new Date(item.eta).toLocaleString() : ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TrackFlow_All_Deliveries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusChipColor = (status) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      case 'in_transit': return 'warning';
      case 'picked_up': return 'info';
      case 'accepted': return 'primary';
      case 'assigned': return 'secondary';
      case 'pending': return 'default';
      default: return 'info';
    }
  };

  // Open driver assign dialog
  const openAssignModal = (delivery) => {
    setSelectedDelivery(delivery);
    setAssignDriverId(delivery.assignedDriver?._id || '');
    setAssignOpen(true);
  };

  const handleAssignSubmit = () => {
    if (selectedDelivery && assignDriverId) {
      onAssignDriver(selectedDelivery._id, assignDriverId);
      setAssignOpen(false);
      setSelectedDelivery(null);
    }
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const payload = {
      customer: {
        name: newDelivery.customerName,
        email: newDelivery.customerEmail,
        phone: newDelivery.customerPhone
      },
      pickupAddress: {
        text: newDelivery.pickupAddressText,
        coordinates: [parseFloat(newDelivery.pickupLng), parseFloat(newDelivery.pickupLat)]
      },
      deliveryAddress: {
        text: newDelivery.deliveryAddressText,
        coordinates: [parseFloat(newDelivery.deliveryLng), parseFloat(newDelivery.deliveryLat)]
      },
      priorityLevel: newDelivery.priorityLevel,
      packageDetails: newDelivery.packageDetails
    };
    onCreateDelivery(payload);
    setCreateOpen(false);
    // Reset form
    setNewDelivery({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      pickupAddressText: '',
      pickupLat: 12.9716,
      pickupLng: 77.5946,
      deliveryAddressText: '',
      deliveryLat: 12.9816,
      deliveryLng: 77.6046,
      priorityLevel: 'Medium',
      packageDetails: ''
    });
  };

  return (
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
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Shipments & Deliveries Control
        </Typography>
        <Box display="flex" gap={1.5}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportCSV}
            sx={{ fontWeight: 700, borderRadius: '8px' }}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
            sx={{ fontWeight: 700, borderRadius: '8px' }}
          >
            Create Order
          </Button>
        </Box>
      </Box>

      {/* FILTER CONTROLS */}
      <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
        <TextField
          placeholder="Search Tracking ID, Customer, Courier..."
          size="small"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          sx={{ flexGrow: 1, minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            )
          }}
        />

        <TextField
          select
          label="Filter Status"
          size="small"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">All Statuses</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="assigned">Assigned</MenuItem>
          <MenuItem value="accepted">Accepted</MenuItem>
          <MenuItem value="picked_up">Picked Up</MenuItem>
          <MenuItem value="in_transit">In Transit</MenuItem>
          <MenuItem value="delivered">Delivered</MenuItem>
          <MenuItem value="cancelled">Cancelled</MenuItem>
        </TextField>

        <TextField
          select
          label="Filter Priority"
          size="small"
          value={priorityFilter}
          onChange={(e) => { setPriorityFilter(e.target.value); setPage(0); }}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">All Priorities</MenuItem>
          <MenuItem value="High">High</MenuItem>
          <MenuItem value="Medium">Medium</MenuItem>
          <MenuItem value="Low">Low</MenuItem>
        </TextField>
      </Box>

      {/* DATA TABLE */}
      <TableContainer sx={{ border: themeMode === 'light' ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
        <Table>
          <TableHead sx={{ bgcolor: themeMode === 'light' ? '#F8FAFC' : '#0F172A' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>
                <TableSortLabel
                  active={orderBy === 'trackingId'}
                  direction={orderBy === 'trackingId' ? order : 'asc'}
                  onClick={() => handleSort('trackingId')}
                >
                  Tracking ID
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 800 }}>
                <TableSortLabel
                  active={orderBy === 'customer'}
                  direction={orderBy === 'customer' ? order : 'asc'}
                  onClick={() => handleSort('customer')}
                >
                  Customer
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Destination</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Priority</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>
                <TableSortLabel
                  active={orderBy === 'driver'}
                  direction={orderBy === 'driver' ? order : 'asc'}
                  onClick={() => handleSort('driver')}
                >
                  Assigned Driver
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 800 }}>
                <TableSortLabel
                  active={orderBy === 'status'}
                  direction={orderBy === 'status' ? order : 'asc'}
                  onClick={() => handleSort('status')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 800 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedDeliveries.map((item) => (
              <TableRow key={item._id} hover>
                <TableCell sx={{ fontWeight: 700, color: '#2563EB' }}>
                  {item.trackingId}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {item.customer?.name || 'N/A'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.customer?.phone || ''}
                  </Typography>
                </TableCell>
                <TableCell sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.deliveryAddress?.text}
                </TableCell>
                <TableCell>
                  <Chip
                    label={item.priorityLevel?.toUpperCase() || 'MEDIUM'}
                    color={item.priorityLevel?.toLowerCase() === 'high' ? 'error' : 'default'}
                    size="small"
                    sx={{ fontWeight: 800, fontSize: '0.65rem' }}
                  />
                </TableCell>
                <TableCell>
                  {item.assignedDriver ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {item.assignedDriver.name}
                      </Typography>
                      <IconButton size="small" onClick={() => openAssignModal(item)} color="primary" title="Reassign Driver">
                        <PersonAddIcon fontSize="inherit" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Button
                      variant="outlined"
                      size="small"
                      color="warning"
                      startIcon={<PersonAddIcon />}
                      onClick={() => openAssignModal(item)}
                      sx={{ fontSize: '0.7rem', py: 0.2 }}
                    >
                      Assign
                    </Button>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={item.status?.replace(/_/g, ' ').toUpperCase() || 'PENDING'}
                    color={getStatusChipColor(item.status)}
                    size="small"
                    sx={{ fontWeight: 800, fontSize: '0.65rem' }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Box display="flex" justifyContent="center" gap={1}>
                    {item.status !== 'delivered' && item.status !== 'cancelled' && (
                      <Tooltip title="Complete Delivery (Admin Override)">
                        <IconButton
                          color="success"
                          size="small"
                          onClick={() => onUpdateStatus(item._id, 'delivered')}
                          sx={{ bgcolor: themeMode === 'light' ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.15)' }}
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {item.status !== 'cancelled' && (
                      <Tooltip title="Cancel Delivery">
                        <IconButton
                          color="warning"
                          size="small"
                          onClick={() => onUpdateStatus(item._id, 'cancelled')}
                          sx={{ bgcolor: themeMode === 'light' ? 'rgba(245,158,11,0.06)' : 'rgba(245,158,11,0.15)' }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Delete Permanently">
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => onDeleteDelivery(item._id)}
                        sx={{ bgcolor: themeMode === 'light' ? 'rgba(239,68,68,0.06)' : 'rgba(239,68,68,0.15)' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {paginatedDeliveries.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    No shipments found matching filters.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredDeliveries.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* CREATE ORDER MODAL */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Create New Logistics Order</DialogTitle>
        <form onSubmit={handleCreateSubmit}>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Customer Name"
                  required
                  fullWidth
                  value={newDelivery.customerName}
                  onChange={(e) => setNewDelivery({ ...newDelivery, customerName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Customer Phone"
                  required
                  fullWidth
                  value={newDelivery.customerPhone}
                  onChange={(e) => setNewDelivery({ ...newDelivery, customerPhone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Customer Email"
                  required
                  fullWidth
                  type="email"
                  value={newDelivery.customerEmail}
                  onChange={(e) => setNewDelivery({ ...newDelivery, customerEmail: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Pickup Details</Typography>
                <TextField
                  label="Pickup Address Location Text"
                  required
                  fullWidth
                  value={newDelivery.pickupAddressText}
                  onChange={(e) => setNewDelivery({ ...newDelivery, pickupAddressText: e.target.value })}
                  placeholder="e.g. Bangalore Airport, Gate 2"
                  sx={{ mb: 2 }}
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Pickup Latitude"
                      type="number"
                      inputProps={{ step: 'any' }}
                      fullWidth
                      value={newDelivery.pickupLat}
                      onChange={(e) => setNewDelivery({ ...newDelivery, pickupLat: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Pickup Longitude"
                      type="number"
                      inputProps={{ step: 'any' }}
                      fullWidth
                      value={newDelivery.pickupLng}
                      onChange={(e) => setNewDelivery({ ...newDelivery, pickupLng: e.target.value })}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Destination Details</Typography>
                <TextField
                  label="Delivery Address Location Text"
                  required
                  fullWidth
                  value={newDelivery.deliveryAddressText}
                  onChange={(e) => setNewDelivery({ ...newDelivery, deliveryAddressText: e.target.value })}
                  placeholder="e.g. Electronic City Block A"
                  sx={{ mb: 2 }}
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Delivery Latitude"
                      type="number"
                      inputProps={{ step: 'any' }}
                      fullWidth
                      value={newDelivery.deliveryLat}
                      onChange={(e) => setNewDelivery({ ...newDelivery, deliveryLat: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Delivery Longitude"
                      type="number"
                      inputProps={{ step: 'any' }}
                      fullWidth
                      value={newDelivery.deliveryLng}
                      onChange={(e) => setNewDelivery({ ...newDelivery, deliveryLng: e.target.value })}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Priority Level"
                  fullWidth
                  value={newDelivery.priorityLevel}
                  onChange={(e) => setNewDelivery({ ...newDelivery, priorityLevel: e.target.value })}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Package Details / Weight"
                  fullWidth
                  value={newDelivery.packageDetails}
                  onChange={(e) => setNewDelivery({ ...newDelivery, packageDetails: e.target.value })}
                  placeholder="e.g. 5kg Box of electronics"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setCreateOpen(false)} variant="outlined">Cancel</Button>
            <Button type="submit" variant="contained" color="primary">Create Dispatch</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* DRIVER ASSIGN MODAL */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Assign Fleet Courier</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Assign or transfer tracking route <strong>{selectedDelivery?.trackingId}</strong> to an active logistics driver.
          </Typography>
          <TextField
            select
            label="Logistics Driver"
            fullWidth
            value={assignDriverId}
            onChange={(e) => setAssignDriverId(e.target.value)}
          >
            <MenuItem value="">-- Select Driver --</MenuItem>
            {drivers.map((drv) => {
              // Ensure we display driver user name
              const name = drv.user?.name || drv.name || 'Unknown Driver';
              const id = drv.user?._id || drv._id;
              return (
                <MenuItem key={id} value={id}>
                  {name} ({drv.status || 'Active'})
                </MenuItem>
              );
            })}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setAssignOpen(false)} variant="outlined">Close</Button>
          <Button onClick={handleAssignSubmit} variant="contained" color="primary" disabled={!assignDriverId}>
            Assign Courier
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default DeliveryTable;
