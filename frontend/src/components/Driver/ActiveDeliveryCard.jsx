import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  Divider,
  Alert,
  Tooltip,
  TextField,
  MenuItem
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import ChatIcon from '@mui/icons-material/Chat';
import DirectionsIcon from '@mui/icons-material/Directions';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';
import ScaleIcon from '@mui/icons-material/Scale';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import MapIcon from '@mui/icons-material/Map';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import { motion } from 'framer-motion';

const ActiveDeliveryCard = ({
  delivery,
  themeMode = 'light',
  onAccept,
  onStart,
  onComplete,
  onReject,
  onNavigate,
  onCancel,
  onStatusChange
}) => {
  if (!delivery) {
    return (
      <Card
        sx={{
          borderRadius: '16px',
          bgcolor: themeMode === 'light' ? '#FFFFFF' : '#1E293B',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          p: 4,
          textAlign: 'center',
          border: themeMode === 'light' ? '1px dashed #CBD5E1' : '1px dashed rgba(255, 255, 255, 0.15)'
        }}
      >
        <CardContent>
          <LocalShippingIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.6 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            No Active Shipments
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You currently have no deliveries assigned to you. Go online and wait for dispatchers to assign tasks.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const isRejectionDeclined = delivery.status === 'rejection_declined';
  const showAcceptReject = delivery.status === 'assigned' || isRejectionDeclined;
  const showStart = delivery.status === 'accepted';
  const showInTransitActions = delivery.status === 'picked_up' || delivery.status === 'in_transit';

  const priorityColor = () => {
    switch (delivery.priorityLevel?.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      default: return 'primary';
    }
  };

  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      sx={{
        borderRadius: '16px',
        bgcolor: themeMode === 'light' ? '#FFFFFF' : '#1E293B',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        border: themeMode === 'light' ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.08)',
        overflow: 'visible'
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        
        {/* REJECTION DECLINED BANNER */}
        {isRejectionDeclined && (
          <Alert 
            severity="error" 
            icon={<PriorityHighIcon />}
            sx={{ 
              mb: 2.5, 
              borderRadius: '12px', 
              fontWeight: 800,
              fontSize: '0.8rem',
              border: '1px solid #EF4444',
              animation: 'rejectionDeclineFlash 1s infinite alternate'
            }}
          >
            Reason Not Accepted. Please Continue Delivery.
          </Alert>
        )}

        {/* HEADER BLOCK */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1.5} mb={2.5}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              CURRENT ACTIVE RUN
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: themeMode === 'light' ? '#1E293B' : '#FFFFFF', mt: 0.2 }}>
              ID: {delivery.trackingId}
            </Typography>
          </Box>
          <Box display="flex" gap={1} alignItems="center">
            <Chip
              label={delivery.priorityLevel ? `${delivery.priorityLevel.toUpperCase()} PRIORITY` : 'STANDARD PRIORITY'}
              color={priorityColor()}
              size="small"
              sx={{ fontWeight: 900, fontSize: '0.6rem', height: 24 }}
            />
            <TextField
              select
              size="small"
              value={delivery.status}
              onChange={(e) => {
                const newStatus = e.target.value;
                if (newStatus === 'delivered') {
                  onComplete();
                } else if (newStatus === 'cancelled') {
                  onCancel();
                } else if (newStatus === 'accepted') {
                  onAccept();
                } else if (newStatus === 'picked_up') {
                  onStart();
                } else {
                  onStatusChange(e);
                }
              }}
              SelectProps={{
                sx: {
                  fontSize: '0.65rem',
                  fontWeight: 900,
                  height: 24,
                  paddingTop: 0,
                  paddingBottom: 0,
                  borderRadius: '12px',
                  bgcolor: (theme) => {
                    if (delivery.status === 'delivered') return theme.palette.success.main;
                    if (delivery.status === 'cancelled' || delivery.status === 'rejected_by_driver') return theme.palette.error.main;
                    return theme.palette.warning.main;
                  },
                  color: '#FFF',
                  '& .MuiSelect-select': {
                    paddingRight: '22px !important',
                    paddingLeft: '10px !important',
                    display: 'flex',
                    alignItems: 'center',
                    textTransform: 'uppercase'
                  },
                  '& .MuiSvgIcon-root': {
                    color: '#FFF',
                    fontSize: '1rem',
                    right: '4px'
                  }
                }
              }}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none'
                }
              }}
            >
              <MenuItem value="assigned" disabled sx={{ fontSize: '0.75rem', fontWeight: 700 }}>ASSIGNED</MenuItem>
              <MenuItem value="accepted" sx={{ fontSize: '0.75rem', fontWeight: 700 }}>ACCEPTED</MenuItem>
              <MenuItem value="picked_up" sx={{ fontSize: '0.75rem', fontWeight: 700 }}>PICKED UP</MenuItem>
              <MenuItem value="in_transit" sx={{ fontSize: '0.75rem', fontWeight: 700 }}>IN TRANSIT</MenuItem>
              <MenuItem value="delivered" sx={{ fontSize: '0.75rem', fontWeight: 700 }}>DELIVERED</MenuItem>
              <MenuItem value="cancelled" sx={{ fontSize: '0.75rem', fontWeight: 700 }}>CANCELLED</MenuItem>
            </TextField>
          </Box>
        </Box>

        <Divider sx={{ mb: 2.5 }} />

        {/* SHIPMENT SPECIFICS (DISTANCE, ETA, WEIGHT) */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
              Est. Distance
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 800 }}>
              {delivery.route?.distance ? `${delivery.route.distance} km` : '12.4 km'}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
              Est. Time (ETA)
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 800, color: '#2563EB' }}>
              {delivery.route?.duration ? `${delivery.route.duration} mins` : '28 mins'}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
              Cargo Weight
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ScaleIcon fontSize="small" color="action" /> {delivery.weight || '3.5 kg'}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
              Package Contents
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 800, textTransform: 'capitalize' }}>
              {delivery.packageType || 'Courier Bag'}
            </Typography>
          </Grid>
        </Grid>

        {/* ADDRESS ROUTE MAP */}
        <Box sx={{ position: 'relative', pl: 3.5, mb: 3.5 }}>
          {/* Vertical route connector vector */}
          <Box
            sx={{
              position: 'absolute',
              left: 10,
              top: 10,
              bottom: 10,
              width: 2,
              bgcolor: 'rgba(37, 99, 235, 0.2)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: -3,
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: '#10B981'
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: -3,
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: '#EF4444'
              }
            }}
          />

          {/* Pickup Address */}
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="caption" color="#10B981" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>
              PICKUP LOCATION
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.2 }}>
              {delivery.pickupAddress?.text}
            </Typography>
          </Box>

          {/* Drop Destination */}
          <Box>
            <Typography variant="caption" color="#EF4444" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>
              DROP DESTINATION
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.2 }}>
              {delivery.deliveryAddress?.text}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* CUSTOMER CONTACT PANEL */}
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ bgcolor: themeMode === 'light' ? '#F8FAFC' : 'rgba(255, 255, 255, 0.02)', p: 2, borderRadius: '12px', mb: 3 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
              CUSTOMER DETAILS
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: themeMode === 'light' ? '#1E293B' : '#FFFFFF', mt: 0.2 }}>
              {delivery.customer?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Phone: {delivery.customer?.phone}
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Tooltip title="Call Customer">
              <IconButton 
                component="a" 
                href={`tel:${delivery.customer?.phone}`} 
                sx={{ 
                  bgcolor: themeMode === 'light' ? '#FFFFFF' : '#334155', 
                  border: `1px solid ${themeMode === 'light' ? '#E2E8F0' : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  color: '#10B981' 
                }}
              >
                <PhoneIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Message Customer">
              <IconButton 
                component="a" 
                href={`sms:${delivery.customer?.phone}`}
                sx={{ 
                  bgcolor: themeMode === 'light' ? '#FFFFFF' : '#334155', 
                  border: `1px solid ${themeMode === 'light' ? '#E2E8F0' : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  color: '#2563EB' 
                }}
              >
                <ChatIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* SHIPMENT ACTION CONTROLS */}
        <Grid container spacing={2}>
          
          {/* ASSIGNED STATE BUTTONS */}
          {showAcceptReject && (
            <>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  onClick={onReject}
                  startIcon={<CloseIcon />}
                  sx={{ py: 1.5, borderRadius: '10px', fontWeight: 700 }}
                >
                  Reject Order
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  onClick={onAccept}
                  startIcon={<CheckCircleIcon />}
                  sx={{ py: 1.5, borderRadius: '10px', fontWeight: 700, color: '#FFF' }}
                >
                  Accept Order
                </Button>
              </Grid>
            </>
          )}

          {/* ACCEPTED STATE BUTTONS */}
          {showStart && (
            <>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  onClick={onNavigate}
                  startIcon={<MapIcon />}
                  sx={{ py: 1.5, borderRadius: '10px', fontWeight: 700 }}
                >
                  Navigate
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={onStart}
                  startIcon={<DirectionsIcon />}
                  sx={{ py: 1.5, borderRadius: '10px', fontWeight: 700 }}
                >
                  Start Delivery
                </Button>
              </Grid>
            </>
          )}

          {/* IN TRANSIT STATE BUTTONS */}
          {showInTransitActions && (
            <>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  onClick={onNavigate}
                  startIcon={<MapIcon />}
                  sx={{ py: 1.5, borderRadius: '10px', fontWeight: 700 }}
                >
                  Open Navigation
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={8}>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  onClick={onComplete}
                  startIcon={<CheckCircleIcon />}
                  sx={{ py: 1.5, borderRadius: '10px', fontWeight: 700, color: '#FFF' }}
                >
                  Complete Delivery (Proof Upload)
                </Button>
              </Grid>
            </>
          )}

        </Grid>

      </CardContent>

      <style>{`
        @keyframes rejectionDeclineFlash {
          from { box-shadow: 0 0 4px #EF4444; }
          to { box-shadow: 0 0 12px #EF4444; }
        }
      `}</style>
    </Card>
  );
};

export default ActiveDeliveryCard;
