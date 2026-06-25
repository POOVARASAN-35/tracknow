import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Tooltip
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AirportShuttleIcon from '@mui/icons-material/AirportShuttle';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const VehicleTable = ({
  vehicles = [],
  drivers = [], // list of drivers for dropdown selection
  themeMode = 'light',
  onCreateVehicle,
  onUpdateVehicle,
  onDeleteVehicle
}) => {
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Form states
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [model, setModel] = useState('');
  const [type, setType] = useState('van');
  const [status, setStatus] = useState('active');
  const [assignedDriver, setAssignedDriver] = useState('');

  const handleCreateClick = () => {
    setVehicleNumber('');
    setModel('');
    setType('van');
    setStatus('active');
    setAssignedDriver('');
    setCreateOpen(true);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    onCreateVehicle({
      vehicleNumber,
      model,
      type,
      status,
      assignedDriver: assignedDriver || null
    });
    setCreateOpen(false);
  };

  const handleEditClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setVehicleNumber(vehicle.vehicleNumber || '');
    setModel(vehicle.model || '');
    setType(vehicle.type || 'van');
    setStatus(vehicle.status || 'active');
    setAssignedDriver(vehicle.assignedDriver?._id || '');
    setEditOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (selectedVehicle) {
      onUpdateVehicle(selectedVehicle._id, {
        vehicleNumber,
        model,
        type,
        status,
        assignedDriver: assignedDriver || null
      });
      setEditOpen(false);
      setSelectedVehicle(null);
    }
  };

  const getVehicleIcon = (vType) => {
    switch (vType) {
      case 'bike': return <TwoWheelerIcon fontSize="small" />;
      case 'truck': return <LocalShippingIcon fontSize="small" />;
      case 'van': return <AirportShuttleIcon fontSize="small" />;
      case 'car': default: return <DirectionsCarIcon fontSize="small" />;
    }
  };

  const getStatusChipColor = (vStatus) => {
    switch (vStatus) {
      case 'active': return 'success';
      case 'maintenance': return 'warning';
      case 'inactive': default: return 'error';
    }
  };

  return (
    <Paper
      sx={{
        borderRadius: '16px',
        bgcolor: themeMode === 'light' ? '#FFFFFF' : '#1E293B',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        border: themeMode === 'light' ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.08)',
        p: 3,
        overflow: 'hidden'
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Fleet Vehicles Management
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Register and status tracking for transport resource trucks, vans, cars, and bikes.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateClick}
          sx={{ fontWeight: 700, borderRadius: '8px' }}
        >
          Add Vehicle
        </Button>
      </Box>

      <TableContainer sx={{ border: themeMode === 'light' ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
        <Table>
          <TableHead sx={{ bgcolor: themeMode === 'light' ? '#F8FAFC' : '#0F172A' }}>
            <TableRow>
              <TableRow />
              <TableCell sx={{ fontWeight: 800 }}>Vehicle Plate</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Model / Make</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Assigned Driver</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Operational Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 800 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle._id} hover>
                <TableCell />
                <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {vehicle.vehicleNumber}
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  {vehicle.model}
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    {getVehicleIcon(vehicle.type)}
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                      {vehicle.type}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {vehicle.assignedDriver ? (
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {vehicle.assignedDriver.name || 'Assigned'}
                    </Typography>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Unassigned
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={vehicle.status?.toUpperCase() || 'ACTIVE'}
                    color={getStatusChipColor(vehicle.status)}
                    size="small"
                    sx={{ fontWeight: 800, fontSize: '0.65rem' }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Box display="flex" justifyContent="center" gap={1}>
                    <Tooltip title="Edit Registration / Driver">
                      <IconButton size="small" color="primary" onClick={() => handleEditClick(vehicle)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Vehicle">
                      <IconButton size="small" color="error" onClick={() => onDeleteVehicle(vehicle._id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}

            {vehicles.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    No active vehicles registered in the fleet database.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* CREATE VEHICLE DIALOG */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Register Transport Vehicle</DialogTitle>
        <form onSubmit={handleCreateSubmit}>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Plate Number"
                  required
                  fullWidth
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="e.g. KA-01-MJ-5678"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Model / Make"
                  required
                  fullWidth
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. Tata Ace 2025"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Vehicle Type"
                  fullWidth
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <MenuItem value="bike">Two Wheeler (Bike)</MenuItem>
                  <MenuItem value="car">Four Wheeler (Car)</MenuItem>
                  <MenuItem value="van">Mini Delivery Van</MenuItem>
                  <MenuItem value="truck">Logistics Cargo Truck</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Operational Status"
                  fullWidth
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <MenuItem value="active">Active / Operational</MenuItem>
                  <MenuItem value="maintenance">Under Maintenance</MenuItem>
                  <MenuItem value="inactive">Inactive / Retired</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  label="Assign Active Driver"
                  fullWidth
                  value={assignedDriver}
                  onChange={(e) => setAssignedDriver(e.target.value)}
                >
                  <MenuItem value="">-- Select Driver --</MenuItem>
                  {drivers.map((drv) => {
                    const name = drv.user?.name || drv.name || 'Unknown Driver';
                    const id = drv.user?._id || drv._id;
                    return (
                      <MenuItem key={id} value={id}>
                        {name} ({drv.licenseNumber})
                      </MenuItem>
                    );
                  })}
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setCreateOpen(false)} variant="outlined">Cancel</Button>
            <Button type="submit" variant="contained" color="primary">Register Vehicle</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* EDIT VEHICLE DIALOG */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Edit Vehicle Specifications</DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Plate Number"
                  required
                  fullWidth
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Model / Make"
                  required
                  fullWidth
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Vehicle Type"
                  fullWidth
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <MenuItem value="bike">Two Wheeler (Bike)</MenuItem>
                  <MenuItem value="car">Four Wheeler (Car)</MenuItem>
                  <MenuItem value="van">Mini Delivery Van</MenuItem>
                  <MenuItem value="truck">Logistics Cargo Truck</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Operational Status"
                  fullWidth
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <MenuItem value="active">Active / Operational</MenuItem>
                  <MenuItem value="maintenance">Under Maintenance</MenuItem>
                  <MenuItem value="inactive">Inactive / Retired</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  label="Assign Active Driver"
                  fullWidth
                  value={assignedDriver}
                  onChange={(e) => setAssignedDriver(e.target.value)}
                >
                  <MenuItem value="">-- Select Driver --</MenuItem>
                  {drivers.map((drv) => {
                    const name = drv.user?.name || drv.name || 'Unknown Driver';
                    const id = drv.user?._id || drv._id;
                    return (
                      <MenuItem key={id} value={id}>
                        {name} ({drv.licenseNumber})
                      </MenuItem>
                    );
                  })}
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setEditOpen(false)} variant="outlined">Cancel</Button>
            <Button type="submit" variant="contained" color="primary">Save Changes</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Paper>
  );
};

export default VehicleTable;
