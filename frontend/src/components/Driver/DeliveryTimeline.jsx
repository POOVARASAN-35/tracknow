import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircleIcon from '@mui/icons-material/Circle';
import WatchLaterIcon from '@mui/icons-material/WatchLater';

const DeliveryTimeline = ({ delivery, themeMode = 'light' }) => {
  if (!delivery) return null;

  const timelineEvents = delivery.timeline || [];

  const steps = [
    { key: 'pending', label: 'Order Confirmed', description: 'Shipment registered in system' },
    { key: 'assigned', label: 'Driver Assigned', description: 'Driver matched and assigned' },
    { key: 'accepted', label: 'Accepted', description: 'Driver accepted assignment' },
    { key: 'picked_up', label: 'Package Picked Up', description: 'Package picked up from origin' },
    { key: 'in_transit', label: 'On The Way', description: 'Shipment in route to destination' },
    { key: 'reached_destination', label: 'Near Destination', description: 'Courier reached drop location' },
    { key: 'delivered', label: 'Delivered', description: 'Shipment successfully delivered' }
  ];

  // Helper to find actual timestamp of step
  const getStepData = (stepKey) => {
    // If it's a composite state (e.g. accepted maps to driver accepting, etc.)
    const matches = timelineEvents.filter(
      (e) => e.status === stepKey || (stepKey === 'in_transit' && e.status === 'picked_up')
    );
    if (matches.length > 0) {
      return {
        timestamp: new Date(matches[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        comment: matches[0].comment
      };
    }
    
    // Fallback if current state matches the step but isn't explicitly stored in history logs
    if (delivery.status === stepKey) {
      return {
        timestamp: new Date(delivery.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        comment: `Current Status: ${stepKey.replace(/_/g, ' ')}`
      };
    }

    return null;
  };

  const getStepStatus = (stepKey, index) => {
    // Determine active index of delivery status
    const currentStatusIndex = steps.findIndex(s => s.key === delivery.status);
    const stepIndex = steps.findIndex(s => s.key === stepKey);

    if (stepIndex <= currentStatusIndex && currentStatusIndex !== -1) {
      return 'completed';
    }
    if (stepKey === delivery.status) {
      return 'active';
    }
    return 'pending';
  };

  return (
    <Card
      sx={{
        borderRadius: '16px',
        bgcolor: themeMode === 'light' ? '#FFFFFF' : '#1E293B',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        border: themeMode === 'light' ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.08)',
        p: 2.5
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
          Shipment Progress Timeline
        </Typography>

        <Box sx={{ position: 'relative', pl: 4 }}>
          {/* Vertical Track Rail */}
          <Box
            sx={{
              position: 'absolute',
              left: 11,
              top: 8,
              bottom: 8,
              width: 2,
              bgcolor: themeMode === 'light' ? '#E2E8F0' : 'rgba(255, 255, 255, 0.08)'
            }}
          />

          {steps.map((step, idx) => {
            const stepData = getStepData(step.key);
            const status = getStepStatus(step.key, idx);

            return (
              <Box key={idx} sx={{ position: 'relative', mb: idx === steps.length - 1 ? 0 : 3 }}>
                
                {/* Node marker dot */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: -29,
                    top: 2,
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {status === 'completed' ? (
                    <CheckCircleIcon sx={{ fontSize: 20, color: '#10B981', bgcolor: themeMode === 'light' ? '#FFF' : '#1E293B', borderRadius: '50%' }} />
                  ) : status === 'active' ? (
                    <WatchLaterIcon sx={{ fontSize: 20, color: '#2563EB', bgcolor: themeMode === 'light' ? '#FFF' : '#1E293B', borderRadius: '50%' }} />
                  ) : (
                    <CircleIcon sx={{ fontSize: 14, color: themeMode === 'light' ? '#CBD5E1' : '#475569', bgcolor: themeMode === 'light' ? '#FFF' : '#1E293B', border: `3px solid ${themeMode === 'light' ? '#FFF' : '#1E293B'}`, borderRadius: '50%' }} />
                  )}
                </Box>

                {/* Content block */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2}>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: status !== 'pending' ? 800 : 500,
                        color: status === 'completed' 
                          ? '#10B981' 
                          : status === 'active' 
                            ? '#2563EB' 
                            : 'text.secondary'
                      }}
                    >
                      {step.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.2 }}>
                      {stepData?.comment || step.description}
                    </Typography>
                  </Box>
                  
                  {/* Timestamp ticker */}
                  {stepData && (
                    <Typography variant="caption" sx={{ fontWeight: 700, color: status !== 'pending' ? '#2563EB' : 'text.secondary', bgcolor: themeMode === 'light' ? '#EDF2F7' : 'rgba(255, 255, 255, 0.05)', px: 1.2, py: 0.3, borderRadius: 2 }}>
                      {stepData.timestamp}
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>

      </CardContent>
    </Card>
  );
};

export default DeliveryTimeline;
