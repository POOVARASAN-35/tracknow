import React from 'react';
import { Grid, Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

const AnalyticsChart = ({ invoices = [], currentThemeMode = 'dark' }) => {
  const isDark = currentThemeMode === 'dark';

  const chartTextColor = isDark ? '#9ca3af' : '#64748b';
  const chartGridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : '#e2e8f0';

  // 1. Calculate Monthly Spending
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  // We can merge static historical trend with dynamic current month data for Jane Customer
  const monthlyData = [120, 150, 180, 220, 190, 95]; 

  const lineChartData = {
    labels: months,
    datasets: [
      {
        label: 'Monthly Spending ($)',
        data: monthlyData,
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.15)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#2563EB',
        pointHoverRadius: 7
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: chartTextColor, font: { family: 'Poppins', weight: '600' } }
      }
    },
    scales: {
      x: {
        grid: { color: chartGridColor },
        ticks: { color: chartTextColor }
      },
      y: {
        grid: { color: chartGridColor },
        ticks: { color: chartTextColor }
      }
    }
  };

  // 2. Category Wise Spending
  const doughnutData = {
    labels: ['Heavy Freight', 'Express Parcels', 'Documents', 'Storage Hubs'],
    datasets: [
      {
        data: [45, 30, 15, 10],
        backgroundColor: ['#2563EB', '#7C3AED', '#10B981', '#F59E0B'],
        borderColor: isDark ? '#0f1424' : '#ffffff',
        borderWidth: 2
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: { color: chartTextColor, font: { family: 'Poppins' } }
      }
    }
  };

  // 3. Delivery Fees vs Taxes vs Refunds Bar Chart
  const barData = {
    labels: ['Delivery Charge', 'Tax / GST Paid', 'Refunds Approved'],
    datasets: [
      {
        label: 'Distribution Summary ($)',
        data: [35, 18, 15],
        backgroundColor: ['#6366f1', '#10b981', '#ef4444'],
        borderRadius: 8
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: chartTextColor, font: { family: 'Poppins' } }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: chartTextColor }
      },
      y: {
        grid: { color: chartGridColor },
        ticks: { color: chartTextColor }
      }
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Monthly Spending Line Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'}`, borderRadius: '16px', height: '320px' }}>
            <CardContent>
              <Typography variant="body2" sx={{ fontWeight: 800, mb: 2, textTransform: 'uppercase', color: 'text.secondary', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                Monthly Spending Trend
              </Typography>
              <Box height="220px">
                <Line data={lineChartData} options={lineChartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Category Wise Spending Pie Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'}`, borderRadius: '16px', height: '320px' }}>
            <CardContent>
              <Typography variant="body2" sx={{ fontWeight: 800, mb: 2, textTransform: 'uppercase', color: 'text.secondary', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                Logistics Category Allocation
              </Typography>
              <Box height="220px" display="flex" alignItems="center" justifyContent="center">
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Delivery Charges Bar Chart */}
        <Grid item xs={12} md={8}>
          <Card sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'}`, borderRadius: '16px', height: '300px' }}>
            <CardContent>
              <Typography variant="body2" sx={{ fontWeight: 800, mb: 2, textTransform: 'uppercase', color: 'text.secondary', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                Tax & Shipping Distribution Log
              </Typography>
              <Box height="200px">
                <Bar data={barData} options={barOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Circular Progress Metrics Success Rate */}
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'}`, borderRadius: '16px', height: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap={2}>
                <Typography variant="body2" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  Payment Success Rate
                </Typography>
                
                <Box position="relative" display="inline-flex">
                  <CircularProgress variant="determinate" value={98.5} size={100} thickness={5} sx={{ color: '#10B981' }} />
                  <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="h6" component="div" color="text.primary" sx={{ fontWeight: 900 }}>
                      98.5%
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textAlign: 'center' }}>
                  Your secure credit card transaction completion success index.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsChart;
