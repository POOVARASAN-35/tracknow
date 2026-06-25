import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { setSessionTimedOut } from '../../store/slices/authSlice';
import { motion } from 'framer-motion';

const SessionTimeoutModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSessionTimedOut, lastRole } = useSelector((state) => state.auth);

  const handleLoginAgain = () => {
    // Reset timeout status in state to close the modal
    dispatch(setSessionTimedOut(false));
    
    // Redirect based on the saved user role
    if (lastRole === 'driver') {
      navigate('/login/driver');
    } else if (lastRole === 'superadmin' || lastRole === 'admin') {
      navigate('/login/superadmin');
    } else {
      navigate('/login'); // Defaults to customer login
    }
  };

  return (
    <Dialog
      open={!!isSessionTimedOut}
      disableEscapeKeyDown
      PaperProps={{
        sx: {
          backgroundColor: '#0f1424',
          backgroundImage: 'none',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.8)',
          borderRadius: 3,
          p: 2,
          maxWidth: 420,
          textAlign: 'center'
        }
      }}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(7, 10, 19, 0.8)'
          }
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 3, pb: 1 }}>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}
          >
            <WarningAmberIcon sx={{ color: '#ef4444', fontSize: 36 }} />
          </Box>
        </motion.div>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#ffffff', fontFamily: '"Outfit", sans-serif' }}>
          Session Expired
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pb: 3 }}>
        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 500, lineHeight: 1.5 }}>
          your login session timeout so login again
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleLoginAgain}
          sx={{
            py: 1.5,
            fontWeight: 800,
            textTransform: 'none',
            fontSize: '1rem',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              boxShadow: '0 6px 20px rgba(37, 99, 235, 0.6)',
              transform: 'translateY(-1px)'
            }
          }}
        >
          Login Again
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionTimeoutModal;
export { SessionTimeoutModal };
