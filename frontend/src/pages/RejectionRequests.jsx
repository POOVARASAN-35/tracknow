import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import PageHeader from '../components/Common/PageHeader';
import axios from 'axios';

const RejectionRequests = () => {
  const { accessToken } = useSelector((state) => state.auth);

  const [rejections, setRejections] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal State for Declining
  const [openDecline, setOpenDecline] = useState(false);
  const [selectedRejection, setSelectedRejection] = useState(null);
  const [declineReason, setDeclineReason] = useState('');

  const fetchRejections = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/deliveries/rejections', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setRejections(response.data.data);
    } catch (err) {
      console.error('Error fetching rejection requests:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRejections();
  }, [accessToken]);

  const handleApprove = async (rejection) => {
    if (!window.confirm(`Are you sure you want to APPROVE the rejection request for delivery ${rejection.delivery_id?.trackingId}?`)) {
      return;
    }
    try {
      await axios.put(`/api/deliveries/${rejection.delivery_id?._id}/rejection-review`, {
        action: 'approve'
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      fetchRejections();
    } catch (err) {
      alert('Error approving request: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeclineSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRejection || !declineReason.trim()) return;

    try {
      await axios.put(`/api/deliveries/${selectedRejection.delivery_id?._id}/rejection-review`, {
        action: 'decline',
        adminComment: declineReason
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setOpenDecline(false);
      setDeclineReason('');
      setSelectedRejection(null);
      fetchRejections();
    } catch (err) {
      alert('Error declining request: ' + (err.response?.data?.message || err.message));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending Review': return 'warning';
      case 'Approved': return 'success';
      case 'Declined': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <PageHeader
        title="Driver Rejection Requests"
        subtitle="Review and process delivery assignment rejection requests from fleet drivers"
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Delivery ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Driver</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Rejection Reason</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Comments</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rejections.map((rej) => (
              <TableRow key={rej._id}>
                <TableCell sx={{ fontWeight: 700, color: '#00e5ff' }}>
                  {rej.delivery_id?.trackingId || 'N/A'}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {rej.driver_id?.name || 'Unknown Driver'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {rej.driver_id?.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  {rej.delivery_id?.customer?.name || 'N/A'}
                </TableCell>
                <TableCell sx={{ fontWeight: 500 }}>
                  {rej.rejection_reason}
                </TableCell>
                <TableCell sx={{ maxWidth: 200, wordWrap: 'break-word' }}>
                  {rej.additional_comments || <span style={{ color: 'rgba(255,255,255,0.3)' }}>No comments</span>}
                  {rej.status === 'Declined' && rej.admin_comments && (
                    <Box mt={1} p={1} sx={{ bgcolor: 'rgba(255, 23, 68, 0.05)', borderRadius: 1, border: '1px dashed rgba(255, 23, 68, 0.2)' }}>
                      <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, color: 'error.main' }}>
                        Decline Reason:
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                        "{rej.admin_comments}"
                      </Typography>
                    </Box>
                  )}
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {new Date(rej.rejected_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </TableCell>
                <TableCell>
                  <Chip
                    label={rej.status}
                    size="small"
                    color={getStatusColor(rej.status)}
                    sx={{ fontWeight: 700, fontSize: '0.65rem' }}
                  />
                </TableCell>
                <TableCell align="center">
                  {rej.status === 'Pending Review' ? (
                    <Box display="flex" justifyContent="center" gap={1}>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<CheckIcon />}
                        onClick={() => handleApprove(rej)}
                        sx={{ fontSize: '0.7rem', fontWeight: 700 }}
                      >
                        Accept
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        startIcon={<CloseIcon />}
                        onClick={() => {
                          setSelectedRejection(rej);
                          setDeclineReason('');
                          setOpenDecline(true);
                        }}
                        sx={{ fontSize: '0.7rem', fontWeight: 700 }}
                      >
                        Decline
                      </Button>
                    </Box>
                  ) : (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Reviewed</Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {rejections.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  No rejection requests logged.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* DECLINE REJECTION REQUEST DIALOG */}
      <Dialog open={openDecline} onClose={() => setOpenDecline(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Decline Rejection Request</DialogTitle>
        <DialogContent sx={{ width: 340, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            Please specify why you are declining the driver's rejection request. This feedback is mandatory.
          </Typography>
          <TextField
            label="Reason for Rejection of Driver Request"
            fullWidth
            required
            multiline
            rows={4}
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            placeholder="e.g. Delivery location is within your service area. No operational issue found."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDecline(false)}>Cancel</Button>
          <Button
            onClick={handleDeclineSubmit}
            variant="contained"
            color="error"
            disabled={!declineReason.trim()}
          >
            Decline Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RejectionRequests;
export { RejectionRequests };
