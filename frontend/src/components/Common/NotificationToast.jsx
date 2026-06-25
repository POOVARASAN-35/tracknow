import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Snackbar, Alert, AlertTitle, Slide } from '@mui/material';
import { clearLatestNotification, setViewingNotification } from '../../store/slices/notificationSlice';
import InfoIcon from '@mui/icons-material/Info';

const TransitionSlide = (props) => {
  return <Slide {...props} direction="up" />;
};

const NotificationToast = () => {
  const dispatch = useDispatch();
  const latestNotification = useSelector((state) => state.notifications.latestNotification);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (latestNotification) {
      setOpen(true);
    }
  }, [latestNotification]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
    dispatch(clearLatestNotification());
  };

  const handleToastClick = (e) => {
    if (e.target.closest('.MuiAlert-action') || e.target.closest('button')) {
      return;
    }
    dispatch(setViewingNotification(latestNotification));
    handleClose();
  };

  if (!latestNotification) return null;

  // Set alert color/severity based on notification type
  const getSeverity = (type) => {
    switch (type) {
      case 'route_deviation': return 'error';
      case 'delivery_completed': return 'success';
      case 'delivery_assigned': return 'info';
      case 'driver_offline': return 'warning';
      default: return 'info';
    }
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      TransitionComponent={TransitionSlide}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      sx={{ zIndex: 2000 }}
    >
      <Alert
        onClose={handleClose}
        severity={getSeverity(latestNotification.type)}
        icon={<InfoIcon sx={{ color: '#00e5ff' }} />}
        onClick={handleToastClick}
        sx={{
          width: '100%',
          maxWidth: 360,
          backgroundColor: '#0f1424',
          color: '#ffffff',
          border: '1px solid rgba(0, 229, 255, 0.2)',
          boxShadow: '0 8px 32px 0 rgba(0, 229, 255, 0.15)',
          borderRadius: 2,
          cursor: 'pointer',
          '& .MuiAlert-icon': {
            alignItems: 'center'
          },
          '& .MuiAlert-message': {
            pr: 2
          }
        }}
      >
        <AlertTitle sx={{ fontWeight: 700, color: '#00e5ff' }}>
          {latestNotification.title}
        </AlertTitle>
        {latestNotification.message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationToast;
