import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Chip,
  Divider,
  IconButton,
  TextField,
  MenuItem
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { clearViewingNotification, acknowledgeNotification } from '../../store/slices/notificationSlice';
import { updateDeliveryStatus } from '../../store/slices/deliverySlice';

const NotificationDetailsDialog = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { viewingNotification } = useSelector((state) => state.notifications);

  const [isRejecting, setIsRejecting] = React.useState(false);
  const [rejectionReason, setRejectionReason] = React.useState('');
  const [rejectionComment, setRejectionComment] = React.useState('');

  const handleClose = () => {
    dispatch(clearViewingNotification());
    setIsRejecting(false);
    setRejectionReason('');
    setRejectionComment('');
  };

  const handleAcknowledge = () => {
    if (viewingNotification) {
      dispatch(acknowledgeNotification(viewingNotification._id));
      handleClose();
    }
  };

  const handleAccept = () => {
    if (delivery) {
      dispatch(updateDeliveryStatus({
        deliveryId: delivery._id,
        status: 'accepted',
        comment: 'Delivery accepted by driver.'
      }));
      handleAcknowledge();
    }
  };

  const handleConfirmReject = () => {
    if (delivery) {
      dispatch(updateDeliveryStatus({
        deliveryId: delivery._id,
        status: 'pending_admin_approval',
        rejectionReason,
        comment: rejectionComment
      }));
      handleAcknowledge();
    }
  };

  const isOpen = Boolean(viewingNotification);
  const delivery = viewingNotification?.delivery;

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#0f1424',
          backgroundImage: 'none',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.8)',
          borderRadius: 3
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <LocalShippingIcon sx={{ color: '#00e5ff' }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffffff' }}>
            New Assignment details
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          sx={{
            color: 'text.secondary',
            '&:hover': { color: '#ffffff' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', p: 3 }}>
        <Box mb={3}>
          <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 500, lineHeight: 1.6 }}>
            {viewingNotification?.message}
          </Typography>
        </Box>

        {isRejecting ? (
          <Box display="flex" flexDirection="column" gap={2.5} mt={1}>
            <Typography variant="subtitle2" sx={{ color: '#ff1744', fontWeight: 800 }}>
              Specify Rejection Details
            </Typography>
            
            <TextField
              select
              label="Select Rejection Reason"
              fullWidth
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              required
              variant="outlined"
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    sx: {
                      backgroundColor: '#0f1424',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }
                  }
                }
              }}
              InputLabelProps={{ style: { color: 'rgba(255, 255, 255, 0.7)' } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#ffffff',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' },
                  '&:hover fieldset': { borderColor: '#00e5ff' }
                }
              }}
            >
              <MenuItem value="Vehicle Breakdown">Vehicle Breakdown</MenuItem>
              <MenuItem value="Personal Emergency">Personal Emergency</MenuItem>
              <MenuItem value="Health Issue">Health Issue</MenuItem>
              <MenuItem value="Out of Delivery Radius">Out of Delivery Radius</MenuItem>
              <MenuItem value="Heavy Traffic">Heavy Traffic</MenuItem>
              <MenuItem value="Pickup Location Inaccessible">Pickup Location Inaccessible</MenuItem>
              <MenuItem value="Capacity Full">Capacity Full</MenuItem>
              <MenuItem value="Shift Ended">Shift Ended</MenuItem>
              <MenuItem value="Already Assigned Another Delivery">Already Assigned Another Delivery</MenuItem>
              <MenuItem value="Technical Issue">Technical Issue</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>

            <TextField
              label={rejectionReason === 'Other' ? 'Please specify the reason' : 'Additional comments (optional)'}
              fullWidth
              multiline
              rows={3}
              value={rejectionComment}
              onChange={(e) => setRejectionComment(e.target.value)}
              required={rejectionReason === 'Other'}
              error={rejectionReason === 'Other' && !rejectionComment.trim()}
              placeholder={
                rejectionReason === 'Other'
                  ? 'Enter specific details explaining the rejection...'
                  : 'Optional additional context...'
              }
              InputLabelProps={{ style: { color: 'rgba(255, 255, 255, 0.7)' } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#ffffff',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' },
                  '&:hover fieldset': { borderColor: '#00e5ff' }
                }
              }}
            />
          </Box>
        ) : delivery ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
              p: 2.5,
              borderRadius: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.04)'
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" sx={{ color: '#00e5ff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Delivery Specifications
              </Typography>
              <Chip
                label={(delivery.status || 'assigned').toUpperCase()}
                size="small"
                color={
                  delivery.status === 'delivered' ? 'success' :
                  delivery.status === 'in_transit' ? 'warning' : 'primary'
                }
                sx={{ fontWeight: 800, fontSize: '0.65rem', height: 20 }}
              />
            </Box>
            
            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.06)' }} />

            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                  Delivery Tracking ID
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#ffffff' }}>
                  {delivery.trackingId}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <AccessTimeIcon sx={{ fontSize: 14 }} /> Assigned At
                  </Box>
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#ffffff' }}>
                  {viewingNotification.createdAt ? new Date(viewingNotification.createdAt).toLocaleString() : 'N/A'}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <PersonIcon sx={{ fontSize: 14 }} /> Customer Details
                  </Box>
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#ffffff' }}>
                  {delivery.customer?.name || 'N/A'}
                </Typography>
                {delivery.customer?.phone && (
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Tel: {delivery.customer.phone}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <LocationOnIcon sx={{ fontSize: 14 }} /> Pickup Address
                  </Box>
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>
                  {delivery.pickupAddress?.text || 'N/A'}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <LocationOnIcon sx={{ fontSize: 14 }} /> Dropoff Address
                  </Box>
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>
                  {delivery.deliveryAddress?.text || 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              p: 3,
              borderRadius: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.02)'
            }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No detailed delivery payload associated with this notification.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        {isRejecting ? (
          <>
            <Button
              onClick={() => setIsRejecting(false)}
              variant="outlined"
              sx={{ borderColor: 'rgba(255, 255, 255, 0.15)', color: 'text.primary', '&:hover': { borderColor: 'rgba(255, 255, 255, 0.3)' } }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmReject}
              variant="contained"
              color="error"
              disabled={!rejectionReason || (rejectionReason === 'Other' && !rejectionComment.trim())}
              sx={{
                fontWeight: 800,
                boxShadow: '0 4px 14px 0 rgba(255, 23, 68, 0.3)',
                background: 'linear-gradient(135deg, #ff1744 0%, #d50000 100%)',
                color: '#ffffff',
                '&:hover': {
                  background: 'linear-gradient(135deg, #d50000 0%, #b20000 100%)'
                }
              }}
            >
              Confirm Rejection
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={handleClose}
              variant="outlined"
              sx={{ borderColor: 'rgba(255, 255, 255, 0.15)', color: 'text.primary', '&:hover': { borderColor: 'rgba(255, 255, 255, 0.3)' } }}
            >
              Close
            </Button>
            {user?.role === 'driver' && viewingNotification && !viewingNotification.read && (
              <>
                {delivery && delivery.status === 'assigned' ? (
                  <>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => setIsRejecting(true)}
                      sx={{
                        fontWeight: 800,
                        borderColor: '#ff1744',
                        color: '#ff1744',
                        '&:hover': {
                          borderColor: '#d50000',
                          backgroundColor: 'rgba(255, 23, 68, 0.05)'
                        }
                      }}
                    >
                      Reject Delivery
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleAccept}
                      sx={{
                        fontWeight: 800,
                        boxShadow: '0 4px 14px 0 rgba(0, 230, 118, 0.3)',
                        background: 'linear-gradient(135deg, #00e676 0%, #00c853 100%)',
                        color: '#070a13',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #00c853 0%, #009624 100%)'
                        }
                      }}
                    >
                      Accept Delivery
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAcknowledge}
                    sx={{
                      fontWeight: 800,
                      boxShadow: '0 4px 14px 0 rgba(0, 229, 255, 0.3)',
                      background: 'linear-gradient(135deg, #00e5ff 0%, #00b2cc 100%)',
                      color: '#070a13',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #00b2cc 0%, #008fa3 100%)'
                      }
                    }}
                  >
                    Acknowledge Delivery
                  </Button>
                )}
              </>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default NotificationDetailsDialog;
export { NotificationDetailsDialog };
