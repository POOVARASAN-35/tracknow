import React from 'react';
import { Box, Card, CardContent, Typography, Grid, LinearProgress, Chip } from '@mui/material';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import ShieldIcon from '@mui/icons-material/Shield';
import VerifiedIcon from '@mui/icons-material/Verified';
import SpeedIcon from '@mui/icons-material/Speed';

const VehicleCard = ({ vehicle, themeMode = 'dark' }) => {
  if (!vehicle) {
    return (
      <Card sx={{ p: 4, textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic', fontFamily: 'Poppins' }}>
          No cargo vehicle assigned yet. Contact dispatcher admin.
        </Typography>
      </Card>
    );
  }

  // Insurance status calculations (mocked details for design)
  const totalDays = 365;
  const daysRemaining = 184;
  const insuranceProgress = (daysRemaining / totalDays) * 100;

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'maintenance': return 'warning';
      default: return 'error';
    }
  };

  const getVehicleImage = (type) => {
    switch (type) {
      case 'bike': return '🏍️';
      case 'car': return '🚗';
      case 'van': return '🚐';
      default: return '🚚';
    }
  };

  return (
    <Card sx={{
      height: '100%',
      bgcolor: themeMode === 'light' ? '#FFFFFF' : '#111827',
      borderRadius: '20px',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <Box sx={{
        bgcolor: themeMode === 'light' ? '#F8FAFC' : '#1E293B',
        p: 3,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: themeMode === 'light' ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.06)'
      }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Box sx={{ fontSize: '2.5rem' }}>{getVehicleImage(vehicle.type)}</Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'Poppins' }}>
              {vehicle.model || 'Delivery Fleet Van'}
            </Typography>
            <Chip
              label={vehicle.status?.toUpperCase() || 'ACTIVE'}
              color={getStatusColor(vehicle.status)}
              size="small"
              sx={{ fontWeight: 900, fontSize: '0.65rem', height: 20 }}
            />
          </Box>
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 900, color: '#2563EB', fontFamily: 'Poppins', letterSpacing: '0.05em' }}>
          {vehicle.vehicleNumber}
        </Typography>
      </Box>

      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={6} sm={4}>
            <Box display="flex" alignItems="center" gap={1}>
              <DriveEtaIcon color="primary" fontSize="small" />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>VEHICLE TYPE</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, textTransform: 'capitalize', fontFamily: 'Poppins' }}>
                  {vehicle.type || 'Van'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={4}>
            <Box display="flex" alignItems="center" gap={1}>
              <LocalGasStationIcon color="primary" fontSize="small" />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>FUEL CATEGORY</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'Poppins' }}>
                  CNG / Electric Hybrid
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Box display="flex" alignItems="center" gap={1}>
              <VerifiedIcon color="success" fontSize="small" />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>POLLUTION CERTIFICATE</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#10B981', fontFamily: 'Poppins' }}>
                  Verified Active (BS-VI)
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ mt: 1 }}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <ShieldIcon color="primary" fontSize="small" />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    FLEET INSURANCE CLEARANCE
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: daysRemaining < 30 ? '#EF4444' : '#10B981' }}>
                  {daysRemaining} Days Left
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={insuranceProgress} 
                sx={{ 
                  height: 6, 
                  borderRadius: 3, 
                  bgcolor: themeMode === 'light' ? '#E2E8F0' : '#334155',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: daysRemaining < 30 ? '#EF4444' : '#10B981'
                  }
                }} 
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontSize: '0.7rem' }}>
                Expiry: Dec 18, 2026 (Ref: IN-90284-A)
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default VehicleCard;
export { VehicleCard };
