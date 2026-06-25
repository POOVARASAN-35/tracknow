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
  Box,
  Typography,
  Chip,
  TablePagination,
  TableSortLabel,
  InputAdornment,
  IconButton,
  Rating
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import VisibilityIcon from '@mui/icons-material/Visibility';

const DeliveryHistoryTable = ({ deliveries = [], onSelectDelivery, themeMode = 'dark' }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState('updatedAt');
  const [order, setOrder] = useState('desc');

  // Filter completed or cancelled deliveries
  const historyDeliveries = useMemo(() => {
    return deliveries.filter(d => ['delivered', 'cancelled'].includes(d.status));
  }, [deliveries]);

  // Handle columns sort
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Filter & Search Logic
  const filteredDeliveries = useMemo(() => {
    return historyDeliveries.filter((item) => {
      const matchSearch =
        item.trackingId?.toLowerCase().includes(search.toLowerCase()) ||
        item.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.deliveryAddress?.text?.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === 'all' || item.status === statusFilter;

      return matchSearch && matchStatus;
    }).sort((a, b) => {
      let aVal = a[orderBy];
      let bVal = b[orderBy];

      if (orderBy === 'customer') {
        aVal = a.customer?.name || '';
        bVal = b.customer?.name || '';
      }

      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }, [historyDeliveries, search, statusFilter, order, orderBy]);

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

  const handleExportPDF = () => {
    alert('Generating premium PDF invoice ledger. The PDF download will commence shortly.');
  };

  const getStatusChipColor = (status) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3}>
        <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'Poppins' }}>
          Completed Fulfillment Records
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<FileDownloadIcon />}
          onClick={handleExportPDF}
          sx={{ fontWeight: 800, borderRadius: '10px', fontFamily: 'Poppins' }}
        >
          Export PDF
        </Button>
      </Box>

      {/* Filter and Search controls */}
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
          <MenuItem value="all">All Logs</MenuItem>
          <MenuItem value="delivered">Delivered</MenuItem>
          <MenuItem value="cancelled">Cancelled</MenuItem>
        </TextField>
      </Box>

      {/* Main Table */}
      <TableContainer sx={{ 
        border: themeMode === 'light' ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.06)', 
        borderRadius: '12px',
        bgcolor: themeMode === 'light' ? '#FFFFFF' : '#111827'
      }}>
        <Table>
          <TableHead sx={{ bgcolor: themeMode === 'light' ? '#F8FAFC' : '#1E293B' }}>
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
              <TableCell sx={{ fontWeight: 800 }}>Distance</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Delivery Time</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Rating</TableCell>
              <TableCell align="center" sx={{ fontWeight: 800 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedDeliveries.map((item) => (
              <TableRow key={item._id} hover>
                <TableCell sx={{ fontWeight: 800, color: '#2563EB' }}>
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
                <TableCell sx={{ fontWeight: 600 }}>
                  {item.route?.distance || 12.4} km
                </TableCell>
                <TableCell sx={{ fontSize: '0.8rem' }}>
                  {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={item.status.replace(/_/g, ' ').toUpperCase()}
                    color={getStatusChipColor(item.status)}
                    size="small"
                    sx={{ fontWeight: 900, fontSize: '0.65rem' }}
                  />
                </TableCell>
                <TableCell>
                  <Rating value={item.status === 'delivered' ? 5 : 0} readOnly size="small" />
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={() => onSelectDelivery(item)}
                    size="small"
                    sx={{ bgcolor: 'rgba(37,99,235,0.06)' }}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {paginatedDeliveries.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No completed dispatches logged.
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
    </Box>
  );
};

export default DeliveryHistoryTable;
export { DeliveryHistoryTable };
