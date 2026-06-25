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

const RejectDeliveryModal = ({
  open,
  onClose,
  onSubmit,
  themeMode = 'light'
}) => {
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState(false);

  const reasons = [
    'Vehicle Breakdown',
    'Heavy Traffic',
    'Personal Emergency',
    'Package Issue',
    'Wrong Assignment',
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
      <DialogTitle sx={{ fontWeight: 800 }}>Reject Assignment</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Typography variant="body2" color="text.secondary">
          Please select a reason for rejecting this delivery. The request will be sent to the administrator for verification.
        </Typography>

        <TextField
          select
          label="Rejection Reason"
          fullWidth
          value={reason}
          onChange={(e) => { setReason(e.target.value); setError(false); }}
          required
        >
          {reasons.map((opt) => (
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
            placeholder="Explain why you are unable to fulfill this delivery assignment..."
          />
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit" sx={{ fontWeight: 700 }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="error"
          disabled={!reason}
          sx={{ fontWeight: 700, borderRadius: '8px' }}
        >
          Submit Rejection
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RejectDeliveryModal;
export { RejectDeliveryModal };
