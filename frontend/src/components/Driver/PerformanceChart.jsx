import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  useTheme
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import MapIcon from '@mui/icons-material/Map';
import SpeedIcon from '@mui/icons-material/Speed';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import StarRateIcon from '@mui/icons-material/StarRate';
import TimerIcon from '@mui/icons-material/Timer';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';

// Register Chart.js elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

const PerformanceChart = ({
  deliveries = [],
  profile,
  themeMode = 'light'
}) => {
  const theme = useTheme();

  // Metrics calculations from deliveries data
  const completedCount = deliveries.filter(d => d.status === 'delivered').length;
  const cancelledCount = deliveries.filter(d => d.status === 'cancelled').length;

  const totalDistance = deliveries.reduce((acc, d) => acc + (d.status === 'delivered' ? (d.route?.distance || 12.4) : 0), 0);
  const avgDuration = deliveries.length > 0 
    ? (deliveries.reduce((acc, d) => acc + (d.status === 'delivered' ? (d.route?.duration || 30) : 0), 0) / (completedCount || 1)) 
    : 0;

  // Mock earnings: $15 per completed delivery
  const totalEarnings = completedCount * 15;
  // Mock Fuel estimation: 0.08 Liters per km
  const fuelEstimation = totalDistance * 0.08;

  // KPI cards list
  const kpis = [
    { title: "Today's Distance", value: `${totalDistance.toFixed(1)} km`, sub: 'Active transit path', icon: <MapIcon />, color: '#2563EB', glow: 'rgba(37, 99, 235, 0.1)' },
    { title: 'Avg Delivery Time', value: `${avgDuration.toFixed(0)} mins`, sub: 'Target: < 45 mins', icon: <TimerIcon />, color: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.1)' },
    { title: 'Fuel Estimation', value: `${fuelEstimation.toFixed(1)} L`, sub: 'Based on mileage', icon: <LocalGasStationIcon />, color: '#EF4444', glow: 'rgba(239, 68, 68, 0.1)' },
    { title: 'On-Time Delivery %', value: completedCount > 0 ? '94.2%' : '100%', sub: 'Target: > 90%', icon: <SpeedIcon />, color: '#10B981', glow: 'rgba(16, 185, 129, 0.1)' },
    { title: 'Total Earnings', value: `$${totalEarnings.toFixed(2)}`, sub: '$15 / delivery', icon: <LocalAtmIcon />, color: '#F59E0B', glow: 'rgba(245, 158, 11, 0.1)' },
    { title: 'Driver Rating', value: profile?.rating ? `${profile.rating.toFixed(1)} ★` : '5.0 ★', sub: 'Customer feedback', icon: <StarRateIcon />, color: '#EC4899', glow: 'rgba(236, 72, 153, 0.1)' }
  ];

  // Chart 1: Weekly Deliveries (Bar)
  const barData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Completed Deliveries',
        data: [5, 8, 6, 9, 7, 12, completedCount],
        backgroundColor: '#2563EB',
        borderRadius: 6
      }
    ]
  };

  // Chart 2: Monthly Performance (Line)
  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Distance Covered (km)',
        data: [120, 190, 150, 280, 240, totalDistance || 180],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#10B981'
      }
    ]
  };

  // Chart 3: Completed vs Cancelled (Doughnut)
  const doughnutData = {
    labels: ['Completed', 'Cancelled', 'Assigned'],
    datasets: [
      {
        data: [completedCount || 5, cancelledCount || 1, Math.max(0, deliveries.length - completedCount - cancelledCount) || 2],
        backgroundColor: ['#10B981', '#EF4444', '#F59E0B'],
        borderWidth: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: themeMode === 'light' ? '#475569' : '#94A3B8',
          font: { weight: '600' }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: themeMode === 'light' ? '#475569' : '#94A3B8' },
        grid: { display: false }
      },
      y: {
        ticks: { color: themeMode === 'light' ? '#475569' : '#94A3B8' },
        grid: { color: themeMode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }
      }
    }
  };

  return (
    <Box>
      {/* KPI METRIC TILES */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpis.map((kpi, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Card
              sx={{
                bgcolor: themeMode === 'light' ? '#FFFFFF' : '#1E293B',
                border: `1px solid ${themeMode === 'light' ? '#E2E8F0' : 'rgba(255,255,255,0.06)'}`,
                boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                borderRadius: '16px',
                '&:hover': {
                  boxShadow: `0 8px 25px ${kpi.glow}`,
                  borderColor: kpi.color,
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <CardContent sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
                    {kpi.title}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, my: 0.8, color: themeMode === 'light' ? '#1E293B' : '#FFFFFF' }}>
                    {kpi.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {kpi.sub}
                  </Typography>
                </Box>
                <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: kpi.glow, display: 'flex', alignItems: 'center', justifyContent: 'center', color: kpi.color }}>
                  {kpi.icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* CHARTS CONTAINER GRID */}
      <Grid container spacing={3}>
        
        {/* Weekly Performance Bar Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: themeMode === 'light' ? '#FFFFFF' : '#1E293B', border: `1px solid ${themeMode === 'light' ? '#E2E8F0' : 'rgba(255,255,255,0.06)'}`, borderRadius: '16px', p: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 3 }}>
              Weekly Deliveries Frequency
            </Typography>
            <Box sx={{ height: 260 }}>
              <Bar data={barData} options={chartOptions} />
            </Box>
          </Card>
        </Grid>

        {/* Monthly Mileage Line Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: themeMode === 'light' ? '#FFFFFF' : '#1E293B', border: `1px solid ${themeMode === 'light' ? '#E2E8F0' : 'rgba(255,255,255,0.06)'}`, borderRadius: '16px', p: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 3 }}>
              Distance Covered Monthly (km)
            </Typography>
            <Box sx={{ height: 260 }}>
              <Line data={lineData} options={chartOptions} />
            </Box>
          </Card>
        </Grid>

        {/* Deliveries Ratio Doughnut Chart */}
        <Grid item xs={12}>
          <Card sx={{ bgcolor: themeMode === 'light' ? '#FFFFFF' : '#1E293B', border: `1px solid ${themeMode === 'light' ? '#E2E8F0' : 'rgba(255,255,255,0.06)'}`, borderRadius: '16px', p: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4} display="flex" flexDirection="column" alignItems="center">
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 3, alignSelf: 'flex-start' }}>
                  Completed vs Cancelled Deliveries
                </Typography>
                <Box sx={{ width: 180, height: 180 }}>
                  <Doughnut
                    data={doughnutData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false }
                      }
                    }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={8}>
                <Typography variant="body2" sx={{ fontWeight: 800, mb: 2 }}>
                  Summary Breakdown
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { label: 'Completed Deliveries', count: completedCount, color: '#10B981', pct: completedCount > 0 ? `${((completedCount / (deliveries.length || 1)) * 100).toFixed(0)}%` : '100%' },
                    { label: 'Cancelled / Rejected', count: cancelledCount, color: '#EF4444', pct: cancelledCount > 0 ? `${((cancelledCount / (deliveries.length || 1)) * 100).toFixed(0)}%` : '0%' },
                    { label: 'Active Shipments', count: Math.max(0, deliveries.length - completedCount - cancelledCount), color: '#F59E0B', pct: `${((Math.max(0, deliveries.length - completedCount - cancelledCount) / (deliveries.length || 1)) * 100).toFixed(0)}%` }
                  ].map((stat, idx) => (
                    <Grid item xs={12} sm={4} key={idx}>
                      <Box sx={{ border: `1px solid ${themeMode === 'light' ? '#E2E8F0' : 'rgba(255,255,255,0.06)'}`, p: 2, borderRadius: '12px' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
                          {stat.label}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1.5} sx={{ mt: 1 }}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: stat.color }} />
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            {stat.count}
                          </Typography>
                          <Typography variant="caption" sx={{ color: stat.color, fontWeight: 800, ml: 'auto' }}>
                            {stat.pct}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
};

export default PerformanceChart;
