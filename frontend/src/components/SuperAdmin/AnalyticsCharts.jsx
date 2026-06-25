import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  useTheme
} from '@mui/material';
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
  Filler,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS plugins
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

const AnalyticsCharts = ({
  stats,
  themeMode = 'light'
}) => {
  const theme = useTheme();

  // Mock fallbacks if stats aren't loaded yet
  const monthlyReports = stats?.monthlyReports || [
    { month: 'Jan', deliveries: 35, revenue: 420 },
    { month: 'Feb', deliveries: 55, revenue: 680 },
    { month: 'Mar', deliveries: 90, revenue: 1120 },
    { month: 'Apr', deliveries: 120, revenue: 1540 },
    { month: 'May', deliveries: 165, revenue: 2100 },
    { month: 'Jun', deliveries: 210, revenue: 2840 }
  ];

  const summary = stats?.summary || {
    completedDeliveries: 12,
    cancelledDeliveries: 2,
    activeDeliveries: 3,
    pendingDeliveries: 1
  };

  const gridLineColor = themeMode === 'light' ? '#E2E8F0' : 'rgba(255, 255, 255, 0.05)';
  const labelTextColor = themeMode === 'light' ? '#64748B' : '#94A3B8';

  // 1. Revenue trend line chart data
  const revenueChartData = {
    labels: monthlyReports.map(item => item.month),
    datasets: [
      {
        label: 'Gross Revenue ($)',
        data: monthlyReports.map(item => item.revenue),
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37,99,235,0.08)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#2563EB',
        pointHoverRadius: 7
      }
    ]
  };

  const revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        grid: { color: 'transparent' },
        ticks: { color: labelTextColor, font: { weight: 600 } }
      },
      y: {
        grid: { color: gridLineColor },
        ticks: { color: labelTextColor }
      }
    }
  };

  // 2. Deliveries volume bar chart data
  const volumeChartData = {
    labels: monthlyReports.map(item => item.month),
    datasets: [
      {
        label: 'Deliveries Volume',
        data: monthlyReports.map(item => item.deliveries),
        backgroundColor: '#3B82F6',
        borderRadius: 8,
        barThickness: 20
      }
    ]
  };

  const volumeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        grid: { color: 'transparent' },
        ticks: { color: labelTextColor }
      },
      y: {
        grid: { color: gridLineColor },
        ticks: { color: labelTextColor }
      }
    }
  };

  // 3. Status distribution doughnut chart data
  const statusDoughnutData = {
    labels: ['Completed', 'Active/Transit', 'Cancelled', 'Pending'],
    datasets: [
      {
        data: [
          summary.completedDeliveries || 0,
          summary.activeDeliveries || 0,
          summary.cancelledDeliveries || 0,
          summary.pendingDeliveries || 0
        ],
        backgroundColor: ['#10B981', '#3B82F6', '#EF4444', '#F59E0B'],
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  };

  const statusDoughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: labelTextColor,
          font: { weight: 600, size: 11 },
          padding: 15
        }
      }
    },
    cutout: '70%'
  };

  return (
    <Box>
      <Box mb={3.5}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Business Intel & Analytics
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Live statistics tracking, revenue streams metrics, and operational volumes charts.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Revenue Line Chart */}
        <Grid item xs={12} lg={8}>
          <Card
            sx={{
              borderRadius: '16px',
              border: `1px solid ${themeMode === 'light' ? '#E2E8F0' : 'rgba(255,255,255,0.06)'}`,
              bgcolor: themeMode === 'light' ? '#FFFFFF' : '#1E293B',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3 }}>
                Gross Sales & Revenue Growth Trend ($)
              </Typography>
              <Box height={320} position="relative">
                <Line data={revenueChartData} options={revenueChartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Status Distribution */}
        <Grid item xs={12} lg={4}>
          <Card
            sx={{
              borderRadius: '16px',
              border: `1px solid ${themeMode === 'light' ? '#E2E8F0' : 'rgba(255,255,255,0.06)'}`,
              bgcolor: themeMode === 'light' ? '#FFFFFF' : '#1E293B',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3 }}>
                Logistics Status Share
              </Typography>
              <Box height={320} position="relative">
                <Doughnut data={statusDoughnutData} options={statusDoughnutOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Volume Bar Chart */}
        <Grid item xs={12}>
          <Card
            sx={{
              borderRadius: '16px',
              border: `1px solid ${themeMode === 'light' ? '#E2E8F0' : 'rgba(255,255,255,0.06)'}`,
              bgcolor: themeMode === 'light' ? '#FFFFFF' : '#1E293B',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3 }}>
                Monthly Fulfilled Deliveries Count
              </Typography>
              <Box height={280} position="relative">
                <Bar data={volumeChartData} options={volumeChartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsCharts;
export { AnalyticsCharts };
