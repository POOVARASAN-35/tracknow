import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Typography,
  Box
} from '@mui/material';

const CancelDeliveryModal = ({
  open,
  onClose,
  onSubmit,
  themeMode = 'light'
}) => {
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState(false);

  const cancellationReasons = [
    'Customer not available',
    'Customer requested cancellation',
    'Incorrect delivery address',
    'Vehicle breakdown',
    'Package damaged',
    'Unable to contact customer',
    'Duplicate order',
    'Out of delivery area',
    'Safety concern',
    'Other'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason) return;
    if (reason === 'Other' && !comment.trim()) {
      setError(true);
      return;
    }
    setError(false);
    onSubmit({ reason, comment });
    // Reset fields
    setReason('');
    setComment('');
  };

  const handleClose = () => {
    setReason('');
    setComment('');
    setError(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          borderRadius: '16px',
          bgcolor: themeMode === 'light' ? '#FFFFFF' : '#1E293B',
          backgroundImage: 'none',
          maxWidth: 400,
          width: '100%',
          p: 1
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 800 }}>Cancel Delivery Run</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Typography variant="body2" color="text.secondary">
          Please select a reason for cancelling this delivery. The cancellation will be logged and synced in the tracking history.
        </Typography>

        <TextField
          select
          label="Cancellation Reason"
          fullWidth
          value={reason}
          onChange={(e) => { setReason(e.target.value); setError(false); }}
          required
        >
          {cancellationReasons.map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </TextField>

        {reason === 'Other' && (
          <TextField
            label="Provide details"
            multiline
            rows={3}
            fullWidth
            required
            value={comment}
            onChange={(e) => { setComment(e.target.value); setError(false); }}
            error={error}
            helperText={error ? 'Comments are required for Other reasons' : ''}
            placeholder="Explain why this order was cancelled..."
          />
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit" sx={{ fontWeight: 700 }}>
          Close
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="error"
          disabled={!reason}
          sx={{ fontWeight: 700, borderRadius: '8px' }}
        >
          Confirm Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CancelDeliveryModal;
export { CancelDeliveryModal };
