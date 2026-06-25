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
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { logoutUser, setLogoutConfirmOpen } from '../../store/slices/authSlice';
import { motion } from 'framer-motion';

const ConfirmLogoutModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLogoutConfirmOpen, user } = useSelector((state) => state.auth);

  const handleClose = () => {
    dispatch(setLogoutConfirmOpen(false));
  };

  const handleConfirmLogout = () => {
    const roleBeforeLogout = user?.role;
    
    // Dispatch Redux logout
    dispatch(logoutUser());
    dispatch(setLogoutConfirmOpen(false));
    
    // Redirect based on current role
    if (roleBeforeLogout === 'driver') {
      navigate('/login/driver');
    } else if (roleBeforeLogout === 'superadmin' || roleBeforeLogout === 'admin') {
      navigate('/login/superadmin');
    } else {
      navigate('/login'); // Default customer login
    }
  };

  return (
    <Dialog
      open={!!isLogoutConfirmOpen}
      onClose={handleClose}
      PaperProps={{
        sx: {
          backgroundColor: '#0f1424',
          backgroundImage: 'none',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.8)',
          borderRadius: 3,
          p: 2,
          maxWidth: 400,
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
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
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
            <ExitToAppIcon sx={{ color: '#ef4444', fontSize: 36 }} />
          </Box>
        </motion.div>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#ffffff', fontFamily: '"Outfit", sans-serif' }}>
          Confirm Logout
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pb: 3 }}>
        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 500, lineHeight: 1.5 }}>
          Are you sure you want to log out of your session?
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3, gap: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={handleClose}
          sx={{
            py: 1.25,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.9rem',
            borderRadius: '24px',
            borderColor: 'rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            '&:hover': {
              borderColor: 'rgba(255, 255, 255, 0.3)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)'
            }
          }}
        >
          Cancel
        </Button>
        <Button
          fullWidth
          variant="contained"
          color="error"
          onClick={handleConfirmLogout}
          sx={{
            py: 1.25,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.9rem',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              boxShadow: '0 6px 20px rgba(239, 68, 68, 0.6)',
              transform: 'translateY(-1px)'
            }
          }}
        >
          Yes, Logout
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmLogoutModal;
export { ConfirmLogoutModal };
