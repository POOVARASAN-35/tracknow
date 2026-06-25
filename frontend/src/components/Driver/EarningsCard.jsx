import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Grid, Button, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination } from '@mui/material';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import StarRateIcon from '@mui/icons-material/StarRate';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

const EarningsCard = ({ deliveries = [], themeMode = 'dark' }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(3);

  const completedCount = deliveries.filter(d => d.status === 'delivered').length;

  // Mock Earnings
  const todayEarnings = completedCount > 0 ? 45.00 : 0.00;
  const weeklyEarnings = 280.00 + (completedCount * 15);
  const monthlyEarnings = 1120.00 + (completedCount * 15);
  const totalEarnings = 4850.00 + (completedCount * 15);
  const bonus = 75.00;
  const incentives = 35.00;
  const pendingPayments = 15.00;

  // Mock Transaction history list
  const transactions = [
    { id: 'TXN-90812', amount: '$75.00', date: 'Jun 15, 2026', method: 'UPI Instant', status: 'Settled' },
    { id: 'TXN-90284', amount: '$120.00', date: 'Jun 12, 2026', method: 'Bank Transfer', status: 'Settled' },
    { id: 'TXN-89371', amount: '$110.00', date: 'Jun 08, 2026', method: 'UPI Instant', status: 'Settled' },
    { id: 'TXN-88412', amount: '$150.00', date: 'Jun 01, 2026', method: 'Bank Transfer', status: 'Settled' },
    { id: 'TXN-87291', amount: '$95.00', date: 'May 25, 2026', method: 'UPI Instant', status: 'Settled' }
  ];

  const handleWithdraw = () => {
    alert('Withdrawal of ' + (completedCount * 15 ? '$' + (completedCount * 15).toFixed(2) : '$0.00') + ' requested! Funds will settle in your linked bank account within 30 minutes.');
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedTx = transactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Earnings Stats Cards */}
        <Grid item xs={12} md={7}>
          <Grid container spacing={2}>
            {[
              { label: "TODAY'S WALLET", value: `$${todayEarnings.toFixed(2)}`, icon: <LocalAtmIcon color="primary" />, sub: 'Today' },
              { label: 'WEEKLY METRIC', value: `$${weeklyEarnings.toFixed(2)}`, icon: <PaymentsIcon color="success" />, sub: 'This Week' },
              { label: 'MONTHLY METRIC', value: `$${monthlyEarnings.toFixed(2)}`, icon: <AccountBalanceWalletIcon color="warning" />, sub: 'This Month' },
              { label: 'ACCUMULATED REVENUE', value: `$${totalEarnings.toFixed(2)}`, icon: <AccountBalanceIcon color="secondary" />, sub: 'Lifetime' }
            ].map((stat, idx) => (
              <Grid item xs={6} key={idx}>
                <Card sx={{
                  bgcolor: themeMode === 'light' ? '#FFFFFF' : '#111827',
                  borderRadius: '16px',
                  border: themeMode === 'light' ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.06)',
                  p: 2
                }}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                      {stat.label}
                    </Typography>
                    {stat.icon}
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: 'Poppins', color: themeMode === 'light' ? '#1E293B' : '#FFFFFF' }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stat.sub}
                  </Typography>
                </Card>
              </Grid>
            ))}

            {/* Withdraw Funds Panel */}
            <Grid item xs={12}>
              <Card sx={{
                bgcolor: themeMode === 'light' ? '#FFFFFF' : '#111827',
                borderRadius: '16px',
                border: themeMode === 'light' ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.06)',
                p: 3,
                background: themeMode === 'light' ? 'none' : 'linear-gradient(135deg, #111827 0%, #064E3B 100%)'
              }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#10B981' }}>
                      Escrow Settlement Wallet
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 900, my: 0.5, fontFamily: 'Poppins' }}>
                      ${(completedCount * 15).toFixed(2)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Bonus: ${bonus.toFixed(2)} | Incentives: ${incentives.toFixed(2)} | Pending: ${pendingPayments.toFixed(2)}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<LocalAtmIcon />}
                    onClick={handleWithdraw}
                    disabled={completedCount === 0}
                    sx={{
                      borderRadius: '12px',
                      py: 1.5,
                      px: 3,
                      fontWeight: 800,
                      fontFamily: 'Poppins',
                      color: '#FFFFFF'
                    }}
                  >
                    Withdraw Funds
                  </Button>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Transaction History Sub-Table */}
        <Grid item xs={12} md={5}>
          <Card sx={{
            bgcolor: themeMode === 'light' ? '#FFFFFF' : '#111827',
            borderRadius: '16px',
            border: themeMode === 'light' ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.06)',
            p: 3,
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, fontFamily: 'Poppins' }}>
              Settlements Audit Logs
            </Typography>
            <TableContainer sx={{ flexGrow: 1, maxHeight: 220 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', px: 1 }}>TX ID</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', px: 1 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', px: 1 }} align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedTx.map((tx, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell sx={{ fontSize: '0.75rem', px: 1, fontWeight: 700, color: 'primary.main' }}>{tx.id}</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', px: 1 }}>{tx.date}</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', px: 1, fontWeight: 700 }} align="right">{tx.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[3, 5]}
              component="div"
              count={transactions.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ border: 'none', mt: 'auto', '& .MuiTablePagination-toolbar': { px: 0 } }}
            />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EarningsCard;
export { EarningsCard };
