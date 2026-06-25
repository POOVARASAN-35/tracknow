import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  MenuItem,
  Chip,
  Box,
  Typography,
  IconButton,
  Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DirectionsIcon from '@mui/icons-material/Directions';
import MapIcon from '@mui/icons-material/Map';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CancelIcon from '@mui/icons-material/Cancel';
import PageHeader from '../components/Common/PageHeader';
import {
  fetchDeliveries,
  createDelivery,
  assignDriverToDelivery,
  updateDeliveryStatus,
  deleteDelivery
} from '../store/slices/deliverySlice';
import { fetchDrivers } from '../store/slices/driverSlice';
import { useNavigate } from 'react-router-dom';

const Deliveries = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { deliveries } = useSelector((state) => state.deliveries);
  const { drivers } = useSelector((state) => state.drivers);
  const { user } = useSelector((state) => state.auth);

  // Modals state
  const [openCreate, setOpenCreate] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  const [openRejection, setOpenRejection] = useState(false);

  // Active delivery selections
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  
  // Forms data
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  
  const [pickupText, setPickupText] = useState('');
  const [pickupLng, setPickupLng] = useState(77.5946); // Default Bengaluru
  const [pickupLat, setPickupLat] = useState(12.9716);
  
  const [destText, setDestText] = useState('');
  const [destLng, setDestLng] = useState(77.6412);
  const [destLat, setDestLat] = useState(12.9784);

  const [driverId, setDriverId] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionComment, setRejectionComment] = useState('');

  useEffect(() => {
    dispatch(fetchDeliveries());
    if (user.role === 'admin' || user.role === 'superadmin') {
      dispatch(fetchDrivers());
    }
  }, [dispatch, user]);

  const handleCreate = (e) => {
    e.preventDefault();
    const deliveryPayload = {
      customer: { name: custName, phone: custPhone, email: custEmail },
      pickupAddress: { text: pickupText, coordinates: [+pickupLng, +pickupLat] },
      deliveryAddress: { text: destText, coordinates: [+destLng, +destLat] }
    };
    dispatch(createDelivery(deliveryPayload));
    setOpenCreate(false);
    resetCreateForm();
  };

  const handleAssign = () => {
    if (!selectedDelivery || !driverId) return;
    dispatch(assignDriverToDelivery({ deliveryId: selectedDelivery._id, driverId }));
    setOpenAssign(false);
    setDriverId('');
  };

  const handleStatusUpdate = () => {
    if (!selectedDelivery || !newStatus) return;
    
    const payload = {
      deliveryId: selectedDelivery._id,
      status: newStatus,
      comment: statusComment
    };

    if (newStatus === 'cancelled') {
      payload.cancellationReason = cancellationReason;
    }

    dispatch(updateDeliveryStatus(payload));
    setOpenStatus(false);
    setNewStatus('');
    setStatusComment('');
    setCancellationReason('');
  };

  const handleDriverRejection = () => {
    if (!selectedDelivery || !rejectionReason) return;
    dispatch(updateDeliveryStatus({
      deliveryId: selectedDelivery._id,
      status: 'pending_admin_approval',
      rejectionReason,
      comment: rejectionComment
    }));
    setOpenRejection(false);
    setRejectionReason('');
    setRejectionComment('');
  };

  const resetCreateForm = () => {
    setCustName('');
    setCustPhone('');
    setCustEmail('');
    setPickupText('');
    setDestText('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'default';
      case 'assigned': return 'primary';
      case 'accepted': return 'success';
      case 'picked_up': return 'info';
      case 'in_transit': return 'warning';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      case 'rejected_by_driver': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <PageHeader
        title="Delivery Management"
        subtitle="Track status transitions and assign delivery agents"
        action={
          (user.role === 'admin' || user.role === 'superadmin') && (
            <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
              New Delivery
            </Button>
          )
        }
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Tracking ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Destination</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Driver</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>ETA</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {deliveries.map((delivery) => (
              <TableRow key={delivery._id}>
                <TableCell sx={{ fontWeight: 700, color: '#00e5ff' }}>
                  {delivery.trackingId}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{delivery.customer.name}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{delivery.customer.phone}</Typography>
                </TableCell>
                <TableCell sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {delivery.deliveryAddress.text}
                </TableCell>
                <TableCell>
                  {delivery.assignedDriver ? (
                    delivery.assignedDriver.name
                  ) : (
                    (user.role === 'admin' || user.role === 'superadmin') ? (
                      <Button
                        size="small"
                        startIcon={<PersonAddIcon />}
                        onClick={() => {
                          setSelectedDelivery(delivery);
                          setOpenAssign(true);
                        }}
                        sx={{ fontSize: '0.75rem', py: 0.2 }}
                      >
                        Assign
                      </Button>
                    ) : (
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Unassigned</Typography>
                    )
                  )}
                </TableCell>
                <TableCell>
                  {user.role === 'driver' && delivery.status === 'assigned' ? (
                    <Box display="flex" gap={1}>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => {
                          dispatch(updateDeliveryStatus({
                            deliveryId: delivery._id,
                            status: 'accepted',
                            comment: 'Delivery accepted by driver.'
                          }));
                        }}
                        sx={{ fontSize: '0.65rem', py: 0.2, minWidth: 55, fontWeight: 700 }}
                      >
                        Accept
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={() => {
                          setSelectedDelivery(delivery);
                          setRejectionReason('');
                          setRejectionComment('');
                          setOpenRejection(true);
                        }}
                        sx={{ fontSize: '0.65rem', py: 0.2, minWidth: 55, fontWeight: 700 }}
                      >
                        Reject
                      </Button>
                    </Box>
                  ) : (
                    <Chip
                      label={delivery.status.replace(/_/g, ' ').toUpperCase()}
                      size="small"
                      color={getStatusColor(delivery.status)}
                      sx={{ fontWeight: 700, fontSize: '0.65rem' }}
                      onClick={
                        user.role === 'customer'
                          ? undefined
                          : () => {
                              setSelectedDelivery(delivery);
                              setNewStatus(delivery.status);
                              setStatusComment('');
                              setCancellationReason('');
                              setOpenStatus(true);
                            }
                      }
                    />
                  )}
                </TableCell>
                <TableCell>
                  {delivery.eta ? new Date(delivery.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                </TableCell>
                <TableCell align="center">
                  <Box display="flex" justifyContent="center" gap={1}>
                    {/* View Live Map link */}
                    <IconButton
                      color="primary"
                      onClick={() => navigate(`/tracking?id=${delivery.trackingId}`)}
                      title="View Live Map"
                      size="small"
                    >
                      <MapIcon />
                    </IconButton>

                    {/* Cancel capability for active deliveries */}
                    {user.role !== 'customer' && delivery.status !== 'delivered' && delivery.status !== 'cancelled' && (
                      <IconButton
                        color="error"
                        onClick={() => {
                          setSelectedDelivery(delivery);
                          setNewStatus('cancelled');
                          setStatusComment('');
                          setCancellationReason('');
                          setOpenStatus(true);
                        }}
                        title="Cancel Delivery"
                        size="small"
                      >
                        <CancelIcon />
                      </IconButton>
                    )}

                    {/* Delete capability for admin */}
                    {(user.role === 'admin' || user.role === 'superadmin') && (
                      <IconButton
                        color="error"
                        onClick={() => dispatch(deleteDelivery(delivery._id))}
                        title="Delete Order"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {deliveries.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  No shipments logged.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* CREATE ORDER DIALOG */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Log New Delivery Shipment</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleCreate} sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle2" color="primary" sx={{ mt: 1, fontWeight: 700 }}>Customer Details</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField label="Name" fullWidth required value={custName} onChange={(e) => setCustName(e.target.value)} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Phone" fullWidth required value={custPhone} onChange={(e) => setCustPhone(e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Email" type="email" fullWidth required value={custEmail} onChange={(e) => setCustEmail(e.target.value)} />
              </Grid>
            </Grid>

            <Typography variant="subtitle2" color="primary" sx={{ mt: 1, fontWeight: 700 }}>Pickup Details</Typography>
            <TextField label="Pickup Address Text" fullWidth required value={pickupText} onChange={(e) => setPickupText(e.target.value)} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField label="Pickup Longitude" type="number" step="any" fullWidth required value={pickupLng} onChange={(e) => setPickupLng(e.target.value)} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Pickup Latitude" type="number" step="any" fullWidth required value={pickupLat} onChange={(e) => setPickupLat(e.target.value)} />
              </Grid>
            </Grid>

            <Typography variant="subtitle2" color="primary" sx={{ mt: 1, fontWeight: 700 }}>Destination Details</Typography>
            <TextField label="Destination Address Text" fullWidth required value={destText} onChange={(e) => setDestText(e.target.value)} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField label="Destination Longitude" type="number" step="any" fullWidth required value={destLng} onChange={(e) => setDestLng(e.target.value)} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Destination Latitude" type="number" step="any" fullWidth required value={destLat} onChange={(e) => setDestLat(e.target.value)} />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained">Create Order</Button>
        </DialogActions>
      </Dialog>

      {/* ASSIGN DRIVER DIALOG */}
      <Dialog open={openAssign} onClose={() => setOpenAssign(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Assign Fleet Driver</DialogTitle>
        <DialogContent sx={{ width: 300 }}>
          <TextField
            select
            label="Select Driver"
            fullWidth
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            sx={{ mt: 2 }}
          >
            {drivers.map((drv) => (
              <MenuItem key={drv._id} value={drv.user?._id}>
                {drv.user?.name} ({drv.status})
              </MenuItem>
            ))}
            {drivers.length === 0 && (
              <MenuItem disabled>No drivers available</MenuItem>
            )}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssign(false)}>Cancel</Button>
          <Button onClick={handleAssign} variant="contained" disabled={!driverId}>Assign</Button>
        </DialogActions>
      </Dialog>

      {/* UPDATE STATUS DIALOG */}
      <Dialog open={openStatus} onClose={() => setOpenStatus(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {newStatus === 'cancelled' ? 'Cancel Delivery' : 'Update Status Pipeline'}
        </DialogTitle>
        <DialogContent sx={{ width: 340, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            select
            label="Shipment Status"
            fullWidth
            value={newStatus}
            onChange={(e) => {
              setNewStatus(e.target.value);
              if (e.target.value !== 'cancelled') {
                setCancellationReason('');
              }
            }}
            sx={{ mt: 2 }}
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="assigned">Assigned</MenuItem>
            <MenuItem value="picked_up">Picked Up</MenuItem>
            <MenuItem value="in_transit">In Transit</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </TextField>

          {newStatus === 'cancelled' && (
            <TextField
              select
              label="Select Cancellation Reason"
              fullWidth
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              required
            >
              <MenuItem value="Customer not available">Customer not available</MenuItem>
              <MenuItem value="Customer requested cancellation">Customer requested cancellation</MenuItem>
              <MenuItem value="Incorrect delivery address">Incorrect delivery address</MenuItem>
              <MenuItem value="Vehicle breakdown">Vehicle breakdown</MenuItem>
              <MenuItem value="Package damaged">Package damaged</MenuItem>
              <MenuItem value="Unable to contact customer">Unable to contact customer</MenuItem>
              <MenuItem value="Duplicate order">Duplicate order</MenuItem>
              <MenuItem value="Out of delivery area">Out of delivery area</MenuItem>
              <MenuItem value="Safety concern">Safety concern</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
          )}

          <TextField
            label={
              newStatus === 'cancelled'
                ? cancellationReason === 'Other'
                  ? 'Please specify the reason'
                  : 'Additional comments (optional)'
                : 'Timeline Comment'
            }
            fullWidth
            multiline
            rows={newStatus === 'cancelled' && cancellationReason === 'Other' ? 3 : 2}
            value={statusComment}
            onChange={(e) => setStatusComment(e.target.value)}
            required={newStatus === 'cancelled' && cancellationReason === 'Other'}
            error={newStatus === 'cancelled' && cancellationReason === 'Other' && !statusComment.trim()}
            placeholder={
              newStatus === 'cancelled'
                ? cancellationReason === 'Other'
                  ? 'Enter specific details explaining the cancellation...'
                  : 'Optional additional context...'
                : 'e.g. Package loaded, out for delivery'
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStatus(false)}>Cancel</Button>
          <Button
            onClick={handleStatusUpdate}
            variant="contained"
            disabled={
              !newStatus ||
              (newStatus === 'cancelled' && (
                !cancellationReason ||
                (cancellationReason === 'Other' && !statusComment.trim())
              ))
            }
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* DRIVER REJECTION DIALOG */}
      <Dialog open={openRejection} onClose={() => setOpenRejection(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Reject Delivery Assignment</DialogTitle>
        <DialogContent sx={{ width: 340, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            select
            label="Select Rejection Reason"
            fullWidth
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            required
            sx={{ mt: 2 }}
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
            rows={rejectionReason === 'Other' ? 3 : 2}
            value={rejectionComment}
            onChange={(e) => setRejectionComment(e.target.value)}
            required={rejectionReason === 'Other'}
            error={rejectionReason === 'Other' && !rejectionComment.trim()}
            placeholder={
              rejectionReason === 'Other'
                ? 'Enter specific details explaining the rejection...'
                : 'Optional additional context...'
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRejection(false)}>Cancel</Button>
          <Button
            onClick={handleDriverRejection}
            variant="contained"
            color="error"
            disabled={!rejectionReason || (rejectionReason === 'Other' && !rejectionComment.trim())}
          >
            Confirm Rejection
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Deliveries;
export { Deliveries };
