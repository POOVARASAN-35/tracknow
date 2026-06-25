import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  MenuItem,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DownloadIcon from '@mui/icons-material/Download';
import DateRangeIcon from '@mui/icons-material/DateRange';
import PaidIcon from '@mui/icons-material/Paid';
import PeopleIcon from '@mui/icons-material/People';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

const ReportsPage = ({
  deliveries = [],
  drivers = [],
  themeMode = 'light'
}) => {
  const [selectedReport, setSelectedReport] = useState(0);
  const [startDate, setStartDate] = useState('2026-06-01');
  const [endDate, setEndDate] = useState('2026-06-30');
  const [format, setFormat] = useState('csv');
  const [alertOpen, setAlertOpen] = useState(false);

  const reportTemplates = [
    { title: 'Fleet Deliveries Summary', desc: 'Detailed log of all deliveries, status, pickup/destinations, times and ETAs.', icon: <LocalShippingIcon />, type: 'deliveries' },
    { title: 'Driver Efficiency & Ratings', desc: 'Roster metrics including performance score, active ratings, and delivery counts.', icon: <PeopleIcon />, type: 'drivers' },
    { title: 'Gross Revenue & Settlements', desc: 'Financial records tracking total delivery payments, pending collections, and fuel costs.', icon: <PaidIcon />, type: 'revenue' }
  ];

  const handleDownloadReport = () => {
    let headers = [];
    let rows = [];
    let filename = '';

    const templateType = reportTemplates[selectedReport].type;

    if (templateType === 'deliveries') {
      filename = `Fleet_Deliveries_Report_${startDate}_to_${endDate}`;
      headers = ['Tracking ID', 'Customer Name', 'Pickup Address', 'Destination Address', 'Priority', 'Status', 'Driver', 'Created At'];
      rows = deliveries.map(d => [
        d.trackingId || '',
        d.customer?.name || '',
        `"${d.pickupAddress?.text?.replace(/"/g, '""') || ''}"`,
        `"${d.deliveryAddress?.text?.replace(/"/g, '""') || ''}"`,
        d.priorityLevel || 'Medium',
        d.status || 'pending',
        d.assignedDriver?.name || 'Unassigned',
        d.createdAt ? new Date(d.createdAt).toLocaleDateString() : ''
      ]);
    } else if (templateType === 'drivers') {
      filename = `Driver_Efficiency_Report_${startDate}_to_${endDate}`;
      headers = ['Driver Name', 'License Number', 'Operational Status', 'Average Rating', 'Performance Score', 'Registered At'];
      rows = drivers.map(drv => [
        drv.user?.name || drv.name || 'Unknown',
        drv.licenseNumber || 'N/A',
        drv.status || 'offline',
        drv.rating || '5.0',
        `${drv.performanceScore || 100}%`,
        drv.createdAt ? new Date(drv.createdAt).toLocaleDateString() : ''
      ]);
    } else if (templateType === 'revenue') {
      filename = `Financial_Settlements_Report_${startDate}_to_${endDate}`;
      headers = ['Category', 'Valuation Status', 'Sum total ($)'];
      
      const totalRevenue = deliveries.reduce((acc, curr) => acc + (curr.route?.distance ? curr.route.distance * 2.5 : 20.0), 0);
      const pendingRevenue = deliveries.filter(d => d.status !== 'delivered').length * 15.0;

      rows = [
        ['Completed Delivery Revenue', 'Settled', totalRevenue.toFixed(2)],
        ['Pending In-Escrow Deliveries', 'Accruing', pendingRevenue.toFixed(2)],
        ['Est. Fleet Fuel Costs', 'Subtracted', (totalRevenue * 0.15).toFixed(2)],
        ['Net Platform Proceeds', 'Net margin', (totalRevenue * 0.85).toFixed(2)]
      ];
    }

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.${format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setAlertOpen(true);
    setTimeout(() => setAlertOpen(false), 4000);
  };

  return (
    <Box>
      <Box mb={3.5}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Platform Reports Center
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Export structured business metrics, vehicle statistics, courier sheets, and financial audits.
        </Typography>
      </Box>

      {alertOpen && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: '12px', fontWeight: 700 }}>
          Logistics report query generated and downloaded successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left column: Templates Selection */}
        <Grid item xs={12} md={5} lg={4}>
          <Card
            sx={{
              borderRadius: '16px',
              border: `1px solid ${themeMode === 'light' ? '#E2E8F0' : 'rgba(255,255,255,0.06)'}`,
              bgcolor: themeMode === 'light' ? '#FFFFFF' : '#1E293B',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, px: 1 }}>
                Select Report Template
              </Typography>
              <List disablePadding>
                {reportTemplates.map((item, index) => (
                  <React.Fragment key={index}>
                    <ListItem disablePadding sx={{ mb: 1 }}>
                      <ListItemButton
                        selected={selectedReport === index}
                        onClick={() => setSelectedReport(index)}
                        sx={{
                          borderRadius: '10px',
                          p: 1.8,
                          '&.Mui-selected': {
                            bgcolor: themeMode === 'light' ? 'rgba(37,99,235,0.08)' : 'rgba(37,99,235,0.15)',
                            color: '#2563EB',
                            borderLeft: '4px solid #2563EB',
                            borderRadius: '0 10px 10px 0'
                          }
                        }}
                      >
                        <ListItemIcon sx={{ color: selectedReport === index ? '#2563EB' : 'text.secondary', minWidth: 40 }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.title}
                          secondary={item.desc}
                          primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 800 }}
                          secondaryTypographyProps={{ fontSize: '0.75rem', sx: { mt: 0.5 } }}
                        />
                      </ListItemButton>
                    </ListItem>
                    {index < reportTemplates.length - 1 && <Divider sx={{ my: 1, opacity: 0.5 }} />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Right column: Filter Queries and Trigger */}
        <Grid item xs={12} md={7} lg={8}>
          <Card
            sx={{
              borderRadius: '16px',
              border: `1px solid ${themeMode === 'light' ? '#E2E8F0' : 'rgba(255,255,255,0.06)'}`,
              bgcolor: themeMode === 'light' ? '#FFFFFF' : '#1E293B',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              height: '100%'
            }}
          >
            <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                  Configure Query Parameters
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                  Specify date limits and output format parameters for the <strong>{reportTemplates[selectedReport].title}</strong> template.
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Start Query Date"
                      type="date"
                      fullWidth
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: <DateRangeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="End Query Date"
                      type="date"
                      fullWidth
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: <DateRangeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      select
                      label="Output Format"
                      fullWidth
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                    >
                      <MenuItem value="csv">Standard CSV Text (Comma Separated)</MenuItem>
                      <MenuItem value="xls">Microsoft Excel Spreadsheet (Tab Separated .xls)</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ mt: 6, borderTop: themeMode === 'light' ? '1px solid #F1F5F9' : '1px solid rgba(255,255,255,0.06)', pt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadReport}
                  sx={{ fontWeight: 800, borderRadius: '8px', px: 4, py: 1.2 }}
                >
                  Generate & Download Report
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportsPage;
export { ReportsPage };
