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
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MapIcon from '@mui/icons-material/Map';

const DeliveryTable = ({
  deliveries = [],
  themeMode = 'light',
  onSelectDelivery
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

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
        item.deliveryAddress?.text?.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || item.priorityLevel?.toLowerCase() === priorityFilter.toLowerCase();

      return matchSearch && matchStatus && matchPriority;
    }).sort((a, b) => {
      let aVal = a[orderBy];
      let bVal = b[orderBy];

      if (orderBy === 'customer') {
        aVal = a.customer?.name || '';
        bVal = b.customer?.name || '';
      } else if (orderBy === 'destination') {
        aVal = a.deliveryAddress?.text || '';
        bVal = b.deliveryAddress?.text || '';
      }

      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }, [deliveries, search, statusFilter, priorityFilter, order, orderBy]);

  // Pagination Change
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

  // Export CSV Logic
  const handleExportCSV = () => {
    const headers = ['Tracking ID', 'Customer Name', 'Customer Phone', 'Pickup Address', 'Destination Address', 'Priority', 'Status', 'Distance', 'Duration', 'ETA'];
    const rows = filteredDeliveries.map((item) => [
      item.trackingId || '',
      item.customer?.name || '',
      item.customer?.phone || '',
      `"${item.pickupAddress?.text?.replace(/"/g, '""') || ''}"`,
      `"${item.deliveryAddress?.text?.replace(/"/g, '""') || ''}"`,
      item.priorityLevel || 'Medium',
      item.status || '',
      item.route?.distance || 0,
      item.route?.duration || 0,
      item.eta ? new Date(item.eta).toLocaleString() : ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TrackFlow_Deliveries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusChipColor = (status) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      case 'in_transit': return 'warning';
      case 'accepted': return 'primary';
      case 'pending': return 'default';
      default: return 'info';
    }
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
          Today's Deliveries List
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<FileDownloadIcon />}
          onClick={handleExportCSV}
          sx={{ fontWeight: 700, borderRadius: '8px' }}
        >
          Export CSV
        </Button>
      </Box>

      {/* FILTER CONTROLS */}
      <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
        <TextField
          placeholder="Search Tracking ID, Customer..."
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
          <MenuItem value="high">High</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="low">Low</MenuItem>
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
              <TableCell sx={{ fontWeight: 800 }}>
                Destination
              </TableCell>
              <TableCell sx={{ fontWeight: 800 }}>
                Priority
              </TableCell>
              <TableCell sx={{ fontWeight: 800 }}>
                ETA
              </TableCell>
              <TableCell sx={{ fontWeight: 800 }}>
                Status
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 800 }}>
                Action
              </TableCell>
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
                    {item.customer?.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.customer?.phone}
                  </Typography>
                </TableCell>
                <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                  {item.eta ? new Date(item.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Calculating'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={item.status.replace(/_/g, ' ').toUpperCase()}
                    color={getStatusChipColor(item.status)}
                    size="small"
                    sx={{ fontWeight: 800, fontSize: '0.65rem' }}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={() => onSelectDelivery(item)}
                    title="Load Shipment Details"
                    size="small"
                    sx={{ bgcolor: themeMode === 'light' ? 'rgba(37,99,235,0.06)' : 'rgba(37,99,235,0.15)' }}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
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

      {/* TABLE PAGINATION */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredDeliveries.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default DeliveryTable;
