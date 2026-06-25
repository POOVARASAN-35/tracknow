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
  TableSortLabel,
  IconButton
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import DescriptionIcon from '@mui/icons-material/Description';
import ReplayIcon from '@mui/icons-material/Replay';

const OrderHistoryTable = ({ deliveries = [], orders = [], onViewDetails, onDownloadInvoice, onRepeatOrder, currentThemeMode = 'dark' }) => {
  const isDark = currentThemeMode === 'dark';

  // State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  // Sorting
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Helper to fetch details from Redux orders list
  const getOrderMetadata = (trackingId) => {
    const matched = orders.find(o => o.orderId === trackingId);
    return {
      amount: matched?.totalAmount || 25.00,
      paymentMethod: matched?.paymentMethod || 'UPI',
      itemsCount: matched?.items?.length || 1,
      itemsSummary: matched?.items?.map(i => `${i.product?.name || 'Item'} (x${i.quantity})`).join(', ') || 'Courier Shipment'
    };
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

  // Filters & Search logic
  const filteredDeliveries = useMemo(() => {
    return deliveries
      .filter((d) => {
        const meta = getOrderMetadata(d.trackingId);
        const matchesSearch = d.trackingId?.toLowerCase().includes(search.toLowerCase()) ||
          d.deliveryAddress?.text?.toLowerCase().includes(search.toLowerCase()) ||
          meta.itemsSummary.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
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
  }, [deliveries, orders, search, statusFilter, orderBy, order]);

  // Pagination Handler
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Paginated records
  const paginatedDeliveries = useMemo(() => {
    return filteredDeliveries.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredDeliveries, page, rowsPerPage]);

  return (
    <Paper sx={{
      p: 3,
      borderRadius: '16px',
      bgcolor: isDark ? 'rgba(15, 20, 36, 0.6)' : '#ffffff',
      backdropFilter: 'blur(20px)',
      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.08)'}`,
      boxShadow: 'none'
    }}>
      {/* Header controls */}
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} justifyContent="space-between" mb={3}>
        <Box display="flex" gap={2} flexGrow={1} maxWidth={{ sm: 500 }}>
          <TextField
            size="small"
            placeholder="Search by Tracking ID, Address, or Item..."
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
            }}
          />
        </Box>
        <Box minWidth={160}>
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

      {/* Table grid */}
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
                  Order ID
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Product Details</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Destination</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'createdAt'}
                  direction={orderBy === 'createdAt' ? order : 'asc'}
                  onClick={() => handleRequestSort('createdAt')}
                  sx={{ fontWeight: 700 }}
                >
                  Order Date
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Driver</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedDeliveries.map((d) => {
              const meta = getOrderMetadata(d.trackingId);
              return (
                <TableRow key={d._id || d.id} hover>
                  <TableCell sx={{ fontWeight: 800, color: '#2563EB' }}>
                    {d.trackingId}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {meta.itemsSummary}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {d.deliveryAddress?.text}
                  </TableCell>
                  <TableCell>
                    {d.createdAt ? new Date(d.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={d.status.replace(/_/g, ' ').toUpperCase()}
                      size="small"
                      color={getStatusColor(d.status)}
                      sx={{ fontWeight: 800, fontSize: '0.65rem' }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {d.assignedDriver?.name || 'Awaiting Assignment'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>
                    ${meta.amount.toFixed(2)}
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" justifyContent="center" gap={0.5}>
                      <IconButton 
                        size="small" 
                        color="primary" 
                        title="View Details"
                        onClick={() => onViewDetails && onViewDetails(d)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="secondary"
                        title="Repeat Order"
                        onClick={() => onRepeatOrder && onRepeatOrder(d)}
                      >
                        <ReplayIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small"
                        color="info"
                        title="Download Invoice"
                        onClick={() => onDownloadInvoice && onDownloadInvoice(d)}
                      >
                        <DescriptionIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredDeliveries.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  No order history records found.
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
    </Paper>
  );
};

export default OrderHistoryTable;
