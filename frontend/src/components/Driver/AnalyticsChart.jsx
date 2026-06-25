import React from 'react';
import { Box, Card, Typography, useTheme } from '@mui/material';
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

const AnalyticsChart = ({ type = 'line', deliveries = [], themeMode = 'dark' }) => {
  const completedCount = deliveries.filter(d => d.status === 'delivered').length;
  const totalDistance = deliveries.reduce((acc, d) => acc + (d.status === 'delivered' ? (d.route?.distance || 12.4) : 0), 0);

  // Line Chart Config (Weekly Success/Distance)
  const lineData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Deliveries Fufilled',
        data: [4, 6, 5, 8, 7, 10, completedCount || 5],
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#2563EB',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2
      }
    ]
  };

  // Bar Chart Config (Earnings per day)
  const barData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Earnings ($)',
        data: [60, 90, 75, 120, 105, 150, (completedCount || 5) * 15],
        backgroundColor: '#10B981',
        borderRadius: 8,
        hoverBackgroundColor: '#059669'
      }
    ]
  };

  // Doughnut Chart (Success Rate circular progress)
  const successRate = deliveries.length > 0 ? Math.round((completedCount / deliveries.length) * 100) : 98;
  const doughnutData = {
    labels: ['Success', 'Pending/Issues'],
    datasets: [
      {
        data: [successRate, 100 - successRate],
        backgroundColor: ['#10B981', themeMode === 'light' ? '#E2E8F0' : 'rgba(255, 255, 255, 0.08)'],
        borderWidth: 0,
        cutout: '75%'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        padding: 12,
        titleFont: { family: 'Poppins', weight: '700' },
        bodyFont: { family: 'Poppins' },
        backgroundColor: themeMode === 'light' ? '#ffffff' : '#1e293b',
        titleColor: themeMode === 'light' ? '#0f172a' : '#ffffff',
        bodyColor: themeMode === 'light' ? '#475569' : '#94a3b8',
        borderColor: themeMode === 'light' ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        ticks: { color: themeMode === 'light' ? '#475569' : '#94A3B8', font: { family: 'Poppins', size: 10 } },
        grid: { display: false }
      },
      y: {
        ticks: { color: themeMode === 'light' ? '#475569' : '#94A3B8', font: { family: 'Poppins', size: 10 } },
        grid: { color: themeMode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }
      }
    }
  };

  if (type === 'doughnut') {
    return (
      <Box sx={{ position: 'relative', width: 140, height: 140, mx: 'auto' }}>
        <Doughnut
          data={doughnutData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: false } }
          }}
        />
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}>
          <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: 'Poppins' }}>
            {successRate}%
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase' }}>
            SUCCESS
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 200, width: '100%' }}>
      {type === 'bar' ? (
        <Bar data={barData} options={chartOptions} />
      ) : (
        <Line data={lineData} options={chartOptions} />
      )}
    </Box>
  );
};

export default AnalyticsChart;
export { AnalyticsChart };
