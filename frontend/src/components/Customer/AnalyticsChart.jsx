import React from 'react';
import { Card, CardContent, Grid, Typography, Box } from '@mui/material';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

const AnalyticsChart = ({ currentThemeMode = 'dark' }) => {
  const isDark = currentThemeMode === 'dark';
  const textColor = isDark ? '#9ca3af' : '#475569';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)';

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: textColor }
      }
    },
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: { color: textColor }
      },
      y: {
        grid: { color: gridColor },
        ticks: { color: textColor }
      }
    }
  };

  // 1. Monthly Orders
  const monthlyOrdersData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Orders Processed',
        data: [12, 19, 15, 24, 20, 28],
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  // 2. Money Spent
  const moneySpentData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Spend ($)',
        data: [140, 220, 190, 310, 270, 380],
        backgroundColor: '#1E40AF',
        borderRadius: 6
      }
    ]
  };

  // 3. Success Rate / Locations
  const locationsData = {
    labels: ['Home', 'Office', 'Parents House', 'Others'],
    datasets: [
      {
        data: [60, 25, 10, 5],
        backgroundColor: ['#2563EB', '#1E40AF', '#10B981', '#F59E0B'],
        borderWidth: 0
      }
    ]
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card sx={{ 
          bgcolor: isDark ? '#0f1424' : '#fff',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
          boxShadow: 'none'
        }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              Monthly Orders Volume
            </Typography>
            <Box height={250}>
              <Line data={monthlyOrdersData} options={chartOptions} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ 
          bgcolor: isDark ? '#0f1424' : '#fff',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
          boxShadow: 'none'
        }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              Logistics Expenses ($)
            </Typography>
            <Box height={250}>
              <Bar data={moneySpentData} options={chartOptions} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ 
          bgcolor: isDark ? '#0f1424' : '#fff',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
          boxShadow: 'none'
        }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              Favorite Delivery Locations
            </Typography>
            <Box height={250} display="flex" justifyContent="center">
              <Doughnut data={locationsData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: { color: textColor }
                  }
                }
              }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ 
          bgcolor: isDark ? '#0f1424' : '#fff',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
          boxShadow: 'none',
          height: '100%'
        }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', p: 4 }}>
            <Box mb={3}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
                AVERAGE DELIVERY SUCCESS RATE
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, color: '#10B981', mt: 0.5 }}>
                98.4%
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
                AVERAGE DELIVERY DURATION
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, color: '#2563EB', mt: 0.5 }}>
                24 mins
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default AnalyticsChart;
