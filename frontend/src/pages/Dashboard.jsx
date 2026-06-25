import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SpeedIcon from '@mui/icons-material/Speed';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import PageHeader from '../components/Common/PageHeader';

// Register Chart.js models
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const { accessToken } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getStats = async () => {
      try {
        const res = await axios.get('/api/analytics/dashboard', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        setStats(res.data.data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err.message);
      } finally {
        setLoading(false);
      }
    };
    getStats();
  }, [accessToken]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const summary = stats?.summary || {
    totalDeliveries: 0,
    activeDeliveries: 0,
    completedDeliveries: 0,
    activeDrivers: 0,
    delayedDeliveries: 0,
    totalRevenue: 0,
    totalDistanceKm: 0,
    fuelCostEstimate: 0
  };

  // Chart configuration
  const chartData = {
    labels: stats?.monthlyReports?.map((r) => r.month) || ['Jan', 'Feb', 'Mar', 'Apr'],
    datasets: [
      {
        fill: true,
        label: 'Monthly Revenue ($)',
        data: stats?.monthlyReports?.map((r) => r.revenue) || [1200, 1900, 3000, 5000],
        borderColor: '#00e5ff',
        backgroundColor: 'rgba(0, 229, 255, 0.05)',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.04)'
        },
        ticks: {
          color: '#9ca3af'
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.04)'
        },
        ticks: {
          color: '#9ca3af'
        }
      }
    }
  };

  // KPI card layout
  const cards = [
    {
      title: 'Active Deliveries',
      value: summary.activeDeliveries,
      subtitle: `${summary.pendingDeliveries || 0} Pending`,
      icon: <LocalShippingIcon sx={{ fontSize: 32, color: '#00e5ff' }} />,
      glowColor: 'rgba(0, 229, 255, 0.05)'
    },
    {
      title: 'Active Fleet Drivers',
      value: summary.activeDrivers,
      subtitle: `${(summary.totalDrivers || 0) - (summary.activeDrivers || 0)} Offline`,
      icon: <PeopleIcon sx={{ fontSize: 32, color: '#818cf8' }} />,
      glowColor: 'rgba(129, 140, 248, 0.05)'
    },
    {
      title: 'Total Revenue',
      value: `$${summary.totalRevenue.toLocaleString()}`,
      subtitle: `${summary.completedDeliveries} Orders Completed`,
      icon: <AttachMoneyIcon sx={{ fontSize: 32, color: '#10b981' }} />,
      glowColor: 'rgba(16, 185, 129, 0.05)'
    },
    {
      title: 'Delayed Shipments',
      value: summary.delayedDeliveries,
      subtitle: 'Requiring Admin Review',
      icon: <WarningAmberIcon sx={{ fontSize: 32, color: '#ef4444' }} />,
      glowColor: 'rgba(239, 68, 68, 0.05)'
    }
  ];

  return (
    <Box>
      <PageHeader title="Logistics Operations" subtitle="Real-time control dashboard & diagnostics panel" />

      {/* KPI Cards Grid */}
      <Grid container spacing={3} mb={4}>
        {cards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ position: 'relative', '&:hover': { boxShadow: `0 12px 40px 0 ${card.glowColor}` } }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      {card.title}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800, my: 1 }}>
                      {card.value}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                      {card.subtitle}
                    </Typography>
                  </Box>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    width={56}
                    height={56}
                    borderRadius={3}
                    sx={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                  >
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Graph and Fleet Table section */}
      <Grid container spacing={3}>
        {/* Revenue Graph */}
        <Grid item xs={12}>
          <Card sx={{ p: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Revenue Performance Trends
              </Typography>
              <Box height={300} position="relative">
                <Line data={chartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Driver Leaderboard */}
        <Grid item xs={12}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Driver Performance Metrics
              </Typography>
              <TableContainer component={Paper} sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Driver</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Rating</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Score</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats?.driverPerformance?.slice(0, 5).map((row, index) => (
                      <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell component="th" scope="row">
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {row.name}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">⭐ {row.rating}</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${row.performanceScore}%`}
                            size="small"
                            color={row.performanceScore >= 85 ? 'success' : row.performanceScore >= 70 ? 'warning' : 'error'}
                            sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!stats?.driverPerformance || stats.driverPerformance.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                          No drivers registered.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
export { Dashboard };
