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
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PageHeader from '../components/Common/PageHeader';
import {
  fetchDrivers,
  addDriver,
  updateDriver,
  deleteDriver
} from '../store/slices/driverSlice';
import axios from 'axios';

const Drivers = () => {
  const dispatch = useDispatch();
  const { drivers } = useSelector((state) => state.drivers);
  const { accessToken } = useSelector((state) => state.auth);

  // Modal states
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const [selectedDriver, setSelectedDriver] = useState(null);

  // Create Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [license, setLicense] = useState('');

  // Edit Form State
  const [licenseEdit, setLicenseEdit] = useState('');
  const [statusEdit, setStatusEdit] = useState('');
  const [ratingEdit, setRatingEdit] = useState(5.0);
  const [scoreEdit, setScoreEdit] = useState(100);

  useEffect(() => {
    dispatch(fetchDrivers());
  }, [dispatch]);

  const handleCreate = (e) => {
    e.preventDefault();
    dispatch(addDriver({ name, email, password, licenseNumber: license }));
    setOpenCreate(false);
    resetCreateForm();
  };

  const handleEdit = (e) => {
    e.preventDefault();
    if (!selectedDriver) return;
    dispatch(updateDriver({
      id: selectedDriver._id,
      driverData: {
        licenseNumber: licenseEdit,
        status: statusEdit,
        rating: +ratingEdit,
        performanceScore: +scoreEdit
      }
    }));
    setOpenEdit(false);
  };

  const handleSimulateUpload = async (drv) => {
    const docName = 'Commercial Driver License';
    // Dummy static PDF mock url for presentation
    const docUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    try {
      await axios.post(`/api/drivers/${drv._id}/documents`, {
        docName,
        docUrl
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      alert(`Document "${docName}" uploaded successfully for driver ${drv.user?.name}!`);
      dispatch(fetchDrivers()); // Reload drivers list to pull newly added document
    } catch (err) {
      console.error('Error uploading driver document:', err.message);
      alert('Error uploading document: ' + err.message);
    }
  };

  const resetCreateForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setLicense('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'success';
      case 'busy': return 'warning';
      case 'offline': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box>
      <PageHeader
        title="Fleet Driver Directory"
        subtitle="Manage logistics courier credentials and scoring systems"
        action={
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
            Add Driver
          </Button>
        }
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Driver Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>License Number</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Rating</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Performance Score</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Uploaded Docs</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {drivers.map((drv) => (
              <TableRow key={drv._id}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {drv.user?.name || 'Unregistered User'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {drv.user?.email}
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontWeight: 500 }}>
                  {drv.licenseNumber}
                </TableCell>
                <TableCell>⭐ {(drv.rating ?? 5.0).toFixed(1)}</TableCell>
                <TableCell>
                  <Chip
                    label={`${drv.performanceScore ?? 100}%`}
                    size="small"
                    color={(drv.performanceScore ?? 100) >= 85 ? 'success' : (drv.performanceScore ?? 100) >= 70 ? 'warning' : 'error'}
                    sx={{ fontWeight: 700, fontSize: '0.65rem' }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={(drv.status || 'offline').toUpperCase()}
                    size="small"
                    color={getStatusColor(drv.status || 'offline')}
                    sx={{ fontWeight: 700, fontSize: '0.65rem' }}
                  />
                </TableCell>
                <TableCell>
                  {drv.documents?.length || 0} files
                </TableCell>
                <TableCell align="center">
                  <Box display="flex" justifyContent="center" gap={1}>
                    <IconButton
                      color="primary"
                      onClick={() => handleSimulateUpload(drv)}
                      title="Simulate Document Verification"
                      size="small"
                    >
                      <UploadFileIcon />
                    </IconButton>
                    <IconButton
                      color="secondary"
                      onClick={() => {
                        setSelectedDriver(drv);
                        setLicenseEdit(drv.licenseNumber);
                        setStatusEdit(drv.status || 'offline');
                        setRatingEdit(drv.rating ?? 5.0);
                        setScoreEdit(drv.performanceScore ?? 100);
                        setOpenEdit(true);
                      }}
                      title="Edit Profile"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => dispatch(deleteDriver(drv._id))}
                      title="Delete Courier Profile"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {drivers.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  No drivers registered in the fleet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* CREATE DRIVER DIALOG */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Register New Fleet Driver</DialogTitle>
        <DialogContent sx={{ width: 340, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Name" fullWidth required value={name} onChange={(e) => setName(e.target.value)} sx={{ mt: 2 }} />
          <TextField label="Email" type="email" fullWidth required value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField label="Password" type="password" fullWidth required value={password} onChange={(e) => setPassword(e.target.value)} />
          <TextField label="License Number" fullWidth required value={license} onChange={(e) => setLicense(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained">Add Driver</Button>
        </DialogActions>
      </Dialog>

      {/* EDIT DRIVER DIALOG */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Manage Driver Scorecard</DialogTitle>
        <DialogContent sx={{ width: 340, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="License Number" fullWidth value={licenseEdit} onChange={(e) => setLicenseEdit(e.target.value)} sx={{ mt: 2 }} />
          <TextField
            select
            label="Activity Status"
            fullWidth
            value={statusEdit}
            onChange={(e) => setStatusEdit(e.target.value)}
          >
            <MenuItem value="available">Available</MenuItem>
            <MenuItem value="busy">Busy</MenuItem>
            <MenuItem value="offline">Offline</MenuItem>
          </TextField>
          <TextField label="Rating (1.0 - 5.0)" type="number" step="0.1" inputProps={{ min: 1, max: 5 }} fullWidth value={ratingEdit} onChange={(e) => setRatingEdit(e.target.value)} />
          <TextField label="Performance Score (0 - 100)" type="number" inputProps={{ min: 0, max: 100 }} fullWidth value={scoreEdit} onChange={(e) => setScoreEdit(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button onClick={handleEdit} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Drivers;
export { Drivers };
