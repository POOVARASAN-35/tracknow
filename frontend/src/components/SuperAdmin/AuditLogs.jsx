import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  TextField,
  InputAdornment,
  TablePagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SecurityIcon from '@mui/icons-material/Security';

const AuditLogs = ({
  logs = [],
  themeMode = 'light'
}) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredLogs = logs.filter(log => {
    const actionDesc = log.action || '';
    const operator = log.userName || '';
    const ip = log.ipAddress || '';
    const query = search.toLowerCase();
    return actionDesc.toLowerCase().includes(query) ||
           operator.toLowerCase().includes(query) ||
           ip.toLowerCase().includes(query);
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedLogs = filteredLogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3.5}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon color="primary" /> Security & Audit Trail Logs
          </Typography>
          <Typography variant="caption" color="text.secondary">
            System activity auditing tracking user suspensions, vehicle registry changes, and global settings edits.
          </Typography>
        </Box>
        <TextField
          placeholder="Filter logs by operator, action, IP..."
          size="small"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          sx={{ minWidth: 260 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            )
          }}
        />
      </Box>

      <TableContainer sx={{ border: themeMode === 'light' ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
        <Table>
          <TableHead sx={{ bgcolor: themeMode === 'light' ? '#F8FAFC' : '#0F172A' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, width: 80 }} />
              <TableCell sx={{ fontWeight: 800 }}>Timestamp</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Operator User</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Action Performed</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>IP Address</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedLogs.map((log, idx) => (
              <TableRow key={log._id || idx} hover>
                <TableCell />
                <TableCell sx={{ fontWeight: 600 }}>
                  {log.createdAt ? new Date(log.createdAt).toLocaleString() : new Date().toLocaleString()}
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  {log.userName || 'System Auto'}
                </TableCell>
                <TableCell sx={{ color: themeMode === 'light' ? '#1E293B' : '#F8FAFC' }}>
                  {log.action}
                </TableCell>
                <TableCell sx={{ fontFamily: 'Courier New, monospace', fontSize: '0.8rem', color: 'text.secondary' }}>
                  {log.ipAddress || '127.0.0.1'}
                </TableCell>
              </TableRow>
            ))}

            {paginatedLogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    No activity logs recorded.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={filteredLogs.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default AuditLogs;
export { AuditLogs };
