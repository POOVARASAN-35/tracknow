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
  Button,
  Chip
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RouteIcon from '@mui/icons-material/Route';
import TimerIcon from '@mui/icons-material/Timer';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import { Bar } from 'react-chartjs-2';
import PageHeader from '../components/Common/PageHeader';

const Analytics = () => {
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
        console.error('Error fetching analytics stats:', err.message);
      } finally {
        setLoading(false);
      }
    };
    getStats();
  }, [accessToken]);

  const handleExportCSV = () => {
    // Simulated CSV export
    const data = stats?.monthlyReports || [];
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Month,Deliveries Count,Revenue ($)\n';
    
    data.forEach((row) => {
      csvContent += `${row.month},${row.deliveries},${row.revenue}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'tracknow_logistics_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
    cancelledDeliveries: 0,
    activeDrivers: 0,
    delayedDeliveries: 0,
    totalDistanceKm: 0,
    totalRevenue: 0,
    fuelCostEstimate: 0
  };

  const successRate = summary.totalDeliveries > 0
    ? +((summary.completedDeliveries / (summary.totalDeliveries - summary.pendingDeliveries)) * 100).toFixed(1)
    : 0;

  // Chart configuration for Monthly Shipments
  const chartData = {
    labels: stats?.monthlyReports?.map((r) => r.month) || ['Jan', 'Feb', 'Mar', 'Apr'],
    datasets: [
      {
        label: 'Deliveries Fulfilled',
        data: stats?.monthlyReports?.map((r) => r.deliveries) || [40, 60, 95, 140],
        backgroundColor: 'rgba(99, 102, 241, 0.75)',
        borderColor: '#6366f1',
        borderWidth: 1,
        borderRadius: 6
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

  return (
    <Box>
      <PageHeader
        title="Fleet Analytics"
        subtitle="Historical delivery data, performance scores, and fuel estimates"
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
        }
      />

      {/* KPI Cards row */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent display="flex" sx={{ py: 3 }}>
              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Delivery Success Rate
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, my: 1 }}>
                  {successRate}%
                </Typography>
                <Chip
                  size="small"
                  label={successRate >= 90 ? 'Optimal' : 'Needs Review'}
                  color={successRate >= 90 ? 'success' : 'warning'}
                  sx={{ fontWeight: 700, fontSize: '0.65rem' }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ py: 3 }}>
              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Total Distance Travelled
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, my: 1 }}>
                  {summary.totalDistanceKm.toLocaleString()} KM
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <RouteIcon sx={{ fontSize: 14 }} /> Average 14.5 KM / Delivery
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ py: 3 }}>
              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Est. Fuel Consumption
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, my: 1 }}>
                  ${summary.fuelCostEstimate.toLocaleString()}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocalGasStationIcon sx={{ fontSize: 14 }} /> Based on $0.12/km avg.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ py: 3 }}>
              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Avg. Delivery Duration
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, my: 1 }}>
                  28.4 Min
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TimerIcon sx={{ fontSize: 14 }} /> Within standard SLAs
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bar Chart Section */}
      <Card sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
          Monthly Volume Analysis
        </Typography>
        <Box height={350} position="relative">
          <Bar data={chartData} options={chartOptions} />
        </Box>
      </Card>
    </Box>
  );
};

export default Analytics;
export { Analytics };
