import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  MenuItem,
  Chip,
  Box,
  Typography,
  TablePagination,
  TableSortLabel
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';

const OrderTable = ({ orders = [], onViewDetails, currentThemeMode = 'dark' }) => {
  const isDark = currentThemeMode === 'dark';

  // State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  // Sorting Handler
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Filter & Search Logic
  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        const matchesSearch = o.trackingId?.toLowerCase().includes(search.toLowerCase()) ||
          o.deliveryAddress?.text?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        let valA = a[orderBy] || '';
        let valB = b[orderBy] || '';
        
        if (orderBy === 'destination') {
          valA = a.deliveryAddress?.text || '';
          valB = b.deliveryAddress?.text || '';
        } else if (orderBy === 'driver') {
          valA = a.assignedDriver?.name || '';
          valB = b.assignedDriver?.name || '';
        }

        if (order === 'asc') {
          return valA > valB ? 1 : -1;
        } else {
          return valA < valB ? 1 : -1;
        }
      });
  }, [orders, search, statusFilter, orderBy, order]);

  // Pagination Handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'default';
      case 'assigned':
      case 'accepted': return 'primary';
      case 'picked_up': return 'info';
      case 'in_transit': return 'warning';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  // Sliced Orders
  const paginatedOrders = useMemo(() => {
    return filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredOrders, page, rowsPerPage]);

  return (
    <Paper sx={{ 
      p: 3, 
      borderRadius: '16px', 
      bgcolor: isDark ? '#0f1424' : '#fff',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
      boxShadow: 'none'
    }}>
      {/* Table Filters Header */}
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} justifyContent="space-between" mb={3}>
        <Box display="flex" gap={2} flexGrow={1} maxWidth={{ sm: 500 }}>
          <TextField
            size="small"
            placeholder="Search by Tracking ID or Destination..."
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
            }}
          />
        </Box>
        <Box minWidth={150}>
          <TextField
            select
            size="small"
            fullWidth
            label="Status Filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All Orders</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="assigned">Assigned</MenuItem>
            <MenuItem value="picked_up">Picked Up</MenuItem>
            <MenuItem value="in_transit">In Transit</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </TextField>
        </Box>
      </Box>

      {/* Table Container */}
      <TableContainer>
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'trackingId'}
                  direction={orderBy === 'trackingId' ? order : 'asc'}
                  onClick={() => handleRequestSort('trackingId')}
                  sx={{ fontWeight: 700 }}
                >
                  Tracking ID
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Package Type</Typography>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'destination'}
                  direction={orderBy === 'destination' ? order : 'asc'}
                  onClick={() => handleRequestSort('destination')}
                  sx={{ fontWeight: 700 }}
                >
                  Destination
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'driver'}
                  direction={orderBy === 'driver' ? order : 'asc'}
                  onClick={() => handleRequestSort('driver')}
                  sx={{ fontWeight: 700 }}
                >
                  Driver
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Expected Delivery</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedOrders.map((o) => (
              <TableRow key={o._id || o.id} hover>
                <TableCell sx={{ fontWeight: 800, color: '#2563EB' }}>{o.trackingId}</TableCell>
                <TableCell>{o.packageType || 'Standard Parcel'}</TableCell>
                <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {o.deliveryAddress?.text}
                </TableCell>
                <TableCell>{o.assignedDriver?.name || 'Awaiting Assignment'}</TableCell>
                <TableCell>
                  <Chip
                    label={o.status.replace(/_/g, ' ').toUpperCase()}
                    size="small"
                    color={getStatusColor(o.status)}
                    sx={{ fontWeight: 700, fontSize: '0.65rem' }}
                  />
                </TableCell>
                <TableCell>
                  {o.eta ? new Date(o.eta).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}
                </TableCell>
                <TableCell align="center">
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={() => onViewDetails && onViewDetails(o)}
                    sx={{ fontWeight: 700, py: 0.5 }}
                  >
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  No orders found matching the filter parameters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredOrders.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default OrderTable;
