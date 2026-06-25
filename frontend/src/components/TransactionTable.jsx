import React, { useState, useMemo } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, Select, MenuItem, InputLabel, FormControl,
  TablePagination, TableSortLabel, Box, Button, Chip, Typography,
  Menu, Checkbox, FormControlLabel, IconButton
} from '@mui/material';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import jsPDF from 'jspdf';

const TransactionTable = ({ invoices = [], onViewInvoice, currentThemeMode = 'dark' }) => {
  const isDark = currentThemeMode === 'dark';

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Table State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('date');

  // Column Visibility State
  const [columnAnchor, setColumnAnchor] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState({
    invoiceId: true,
    trackingId: true,
    productName: true,
    date: true,
    dueDate: true,
    paymentMethod: true,
    status: true,
    tax: true,
    totalAmount: true
  });

  // Export State
  const [exportAnchor, setExportAnchor] = useState(null);

  // Sorting Handler
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Filter & Search logic
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.invoiceId.toLowerCase().includes(search.toLowerCase()) ||
        (inv.trackingId && inv.trackingId.toLowerCase().includes(search.toLowerCase())) ||
        (inv.paymentMethod && inv.paymentMethod.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
      const matchesMethod = methodFilter === 'All' || inv.paymentMethod === methodFilter;

      let matchesDate = true;
      if (startDate) {
        matchesDate = matchesDate && new Date(inv.date) >= new Date(startDate);
      }
      if (endDate) {
        const adjustedEndDate = new Date(endDate);
        adjustedEndDate.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && new Date(inv.date) <= adjustedEndDate;
      }

      return matchesSearch && matchesStatus && matchesMethod && matchesDate;
    });
  }, [invoices, search, statusFilter, methodFilter, startDate, endDate]);

  // Sort logic
  const sortedInvoices = useMemo(() => {
    const comparator = (a, b) => {
      let aVal = a[orderBy];
      let bVal = b[orderBy];

      if (orderBy === 'date' || orderBy === 'dueDate') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      if (bVal < aVal) return order === 'desc' ? -1 : 1;
      if (bVal > aVal) return order === 'desc' ? 1 : -1;
      return 0;
    };
    return [...filteredInvoices].sort(comparator);
  }, [filteredInvoices, order, orderBy]);

  // Paginated logic
  const paginatedInvoices = useMemo(() => {
    return sortedInvoices.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedInvoices, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Exports
  const handleExportCSV = () => {
    setExportAnchor(null);
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Invoice ID,Order ID,Date,Due Date,Method,Status,Tax,Total Amount\n';

    filteredInvoices.forEach((inv) => {
      csvContent += `${inv.invoiceId},${inv.trackingId || 'N/A'},${new Date(inv.date).toLocaleDateString()},${new Date(inv.dueDate).toLocaleDateString()},${inv.paymentMethod},${inv.status},${inv.tax.toFixed(2)},${inv.totalAmount.toFixed(2)}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'TrackFlow_Billing_Ledger.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    setExportAnchor(null);
    let content = 'Invoice ID\tOrder ID\tDate\tDue Date\tMethod\tStatus\tTax\tTotal Amount\n';
    filteredInvoices.forEach((inv) => {
      content += `${inv.invoiceId}\t${inv.trackingId || 'N/A'}\t${new Date(inv.date).toLocaleDateString()}\t${new Date(inv.dueDate).toLocaleDateString()}\t${inv.paymentMethod}\t${inv.status}\t${inv.tax.toFixed(2)}\t${inv.totalAmount.toFixed(2)}\n`;
    });

    const blob = new Blob([content], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'TrackFlow_Billing_Ledger.xls';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    setExportAnchor(null);
    const doc = new jsPDF();
    doc.setFont('Helvetica');
    doc.setFontSize(16);
    doc.text('TrackFlow Billing & Invoice Statement Log', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated Date: ${new Date().toLocaleDateString()}`, 14, 26);

    let y = 35;
    doc.setFontSize(9);
    doc.text('Invoice ID', 14, y);
    doc.text('Order ID', 38, y);
    doc.text('Date', 68, y);
    doc.text('Status', 98, y);
    doc.text('Method', 128, y);
    doc.text('Tax', 158, y);
    doc.text('Total', 180, y);
    doc.line(14, y + 2, 195, y + 2);

    y += 8;
    filteredInvoices.forEach((inv) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(inv.invoiceId, 14, y);
      doc.text(inv.trackingId || 'N/A', 38, y);
      doc.text(new Date(inv.date).toLocaleDateString(), 68, y);
      doc.text(inv.status, 98, y);
      doc.text(inv.paymentMethod, 128, y);
      doc.text(`$${inv.tax.toFixed(2)}`, 158, y);
      doc.text(`$${inv.totalAmount.toFixed(2)}`, 180, y);
      y += 7;
    });

    doc.save('TrackFlow_Billing_Report.pdf');
  };

  const toggleColumn = (col) => {
    setVisibleColumns((prev) => ({ ...prev, [col]: !prev[col] }));
  };

  return (
    <Box>
      {/* Controls Bar Header */}
      <Box display="flex" flexDirection={{ xs: 'column', lg: 'row' }} gap={2} justifyContent="space-between" mb={3}>
        {/* Filters Grid */}
        <Box display="flex" flexWrap="wrap" gap={1.5} alignItems="center">
          <TextField
            placeholder="Search Invoice ID/Tracking ID..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            sx={{ width: 260 }}
          />

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
              <MenuItem value="All">All Status</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Failed">Failed</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Method</InputLabel>
            <Select value={methodFilter} label="Method" onChange={(e) => setMethodFilter(e.target.value)}>
              <MenuItem value="All">All Methods</MenuItem>
              <MenuItem value="Credit Card">Credit Card</MenuItem>
              <MenuItem value="UPI">UPI</MenuItem>
              <MenuItem value="Net Banking">Net Banking</MenuItem>
              <MenuItem value="CoD">Cash on Delivery</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Start Date"
            type="date"
            size="small"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Date"
            type="date"
            size="small"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        {/* Action Controls */}
        <Box display="flex" gap={1.5} alignSelf={{ xs: 'flex-start', lg: 'center' }}>
          {/* Column Visibility Toggle */}
          <Button
            variant="outlined"
            size="small"
            startIcon={<ViewColumnIcon />}
            onClick={(e) => setColumnAnchor(e.currentTarget)}
            sx={{ textTransform: 'none', borderRadius: '8px', color: 'text.secondary', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1' }}
          >
            Columns
          </Button>
          <Menu anchorEl={columnAnchor} open={Boolean(columnAnchor)} onClose={() => setColumnAnchor(null)}>
            <Box px={2} py={1} display="flex" flexDirection="column">
              {Object.keys(visibleColumns).map((col) => (
                <FormControlLabel
                  key={col}
                  control={<Checkbox checked={visibleColumns[col]} onChange={() => toggleColumn(col)} />}
                  label={col.charAt(0).toUpperCase() + col.slice(1).replace(/([A-Z])/g, ' $1')}
                />
              ))}
            </Box>
          </Menu>

          {/* Download Reports Options */}
          <Button
            variant="contained"
            size="small"
            startIcon={<FileDownloadIcon />}
            onClick={(e) => setExportAnchor(e.currentTarget)}
            sx={{ textTransform: 'none', borderRadius: '8px' }}
          >
            Export Logs
          </Button>
          <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={() => setExportAnchor(null)}>
            <MenuItem onClick={handleExportCSV}>Export CSV</MenuItem>
            <MenuItem onClick={handleExportExcel}>Export Excel</MenuItem>
            <MenuItem onClick={handleExportPDF}>Export PDF Statement</MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Main Table Grid */}
      <TableContainer component={Paper} sx={{ bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#ffffff', backdropFilter: 'blur(20px)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'}`, borderRadius: '16px', overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc' }}>
            <TableRow>
              {visibleColumns.invoiceId && (
                <TableCell>
                  <TableSortLabel active={orderBy === 'invoiceId'} direction={orderBy === 'invoiceId' ? order : 'asc'} onClick={() => handleRequestSort('invoiceId')}>
                    Invoice ID
                  </TableSortLabel>
                </TableCell>
              )}
              {visibleColumns.trackingId && <TableCell>Order ID</TableCell>}
              {visibleColumns.productName && <TableCell>Product Name</TableCell>}
              {visibleColumns.date && (
                <TableCell>
                  <TableSortLabel active={orderBy === 'date'} direction={orderBy === 'date' ? order : 'asc'} onClick={() => handleRequestSort('date')}>
                    Order Date
                  </TableSortLabel>
                </TableCell>
              )}
              {visibleColumns.dueDate && <TableCell>Due Date</TableCell>}
              {visibleColumns.paymentMethod && <TableCell>Method</TableCell>}
              {visibleColumns.status && <TableCell>Status</TableCell>}
              {visibleColumns.tax && <TableCell align="right">Tax</TableCell>}
              {visibleColumns.totalAmount && (
                <TableCell align="right">
                  <TableSortLabel active={orderBy === 'totalAmount'} direction={orderBy === 'totalAmount' ? order : 'asc'} onClick={() => handleRequestSort('totalAmount')}>
                    Amount
                  </TableSortLabel>
                </TableCell>
              )}
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedInvoices.map((row) => (
              <TableRow key={row._id} hover sx={{ '&:hover': { bgcolor: isDark ? 'rgba(255, 255, 255, 0.01) !important' : 'rgba(0, 0, 0, 0.01) !important' } }}>
                {visibleColumns.invoiceId && <TableCell sx={{ fontWeight: 800 }}>{row.invoiceId}</TableCell>}
                {visibleColumns.trackingId && <TableCell>{row.trackingId || 'N/A'}</TableCell>}
                {visibleColumns.productName && <TableCell sx={{ color: 'text.secondary' }}>Logistics Courier Parcel</TableCell>}
                {visibleColumns.date && <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>}
                {visibleColumns.dueDate && <TableCell>{new Date(row.dueDate).toLocaleDateString()}</TableCell>}
                {visibleColumns.paymentMethod && <TableCell>{row.paymentMethod}</TableCell>}
                {visibleColumns.status && (
                  <TableCell>
                    <Chip
                      label={row.status}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.65rem',
                        height: 22,
                        bgcolor:
                          row.status === 'Paid'
                            ? 'rgba(16, 185, 129, 0.12)'
                            : row.status === 'Pending'
                            ? 'rgba(245, 158, 11, 0.12)'
                            : 'rgba(239, 68, 68, 0.12)',
                        color:
                          row.status === 'Paid'
                            ? '#10B981'
                            : row.status === 'Pending'
                            ? '#F59E0B'
                            : '#EF4444'
                      }}
                    />
                  </TableCell>
                )}
                {visibleColumns.tax && <TableCell align="right">${row.tax.toFixed(2)}</TableCell>}
                {visibleColumns.totalAmount && <TableCell align="right" sx={{ fontWeight: 900, color: '#2563EB' }}>${row.totalAmount.toFixed(2)}</TableCell>}
                <TableCell align="center">
                  <IconButton onClick={() => onViewInvoice(row)} size="small" color="primary" sx={{ bgcolor: isDark ? 'rgba(0, 229, 255, 0.05)' : 'rgba(37, 99, 235, 0.05)' }}>
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {paginatedInvoices.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    No billing ledger logs matched the filtering criteria.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredInvoices.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </TableContainer>
    </Box>
  );
};

export default TransactionTable;
