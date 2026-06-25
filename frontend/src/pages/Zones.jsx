import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
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
import PageHeader from '../components/Common/PageHeader';
import GeofenceEditor from '../components/Map/GeofenceEditor';

const Zones = () => {
  const { accessToken } = useSelector((state) => state.auth);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [openCreate, setOpenCreate] = useState(false);
  const [openMapEditor, setOpenMapEditor] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [polygonCoords, setPolygonCoords] = useState(
    '[[[77.58, 12.96], [77.62, 12.96], [77.62, 12.99], [77.58, 12.99], [77.58, 12.96]]]'
  );

  const getZones = async () => {
    try {
      const res = await axios.get('/api/zones', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      setZones(res.data.data);
    } catch (err) {
      console.error('Error loading zones:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getZones();
  }, [accessToken]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      // Parse the JSON array string entered by the user
      const coords = JSON.parse(polygonCoords);

      await axios.post('/api/zones', {
        name,
        description,
        status,
        coordinates: coords
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      setOpenCreate(false);
      resetForm();
      getZones();
    } catch (err) {
      alert('Failed to create zone. Verify coordinates syntax is valid JSON array: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/zones/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      getZones();
    } catch (err) {
      console.error('Error deleting zone:', err.message);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setStatus('active');
    setPolygonCoords('[[[77.58, 12.96], [77.62, 12.96], [77.62, 12.99], [77.58, 12.99], [77.58, 12.96]]]');
  };

  const handleEditorCoordinatesSaved = (coordinates) => {
    setPolygonCoords(JSON.stringify(coordinates));
    setOpenMapEditor(false);
    setOpenCreate(true); // Open create dialog with coordinates filled in
  };

  return (
    <Box>
      <PageHeader
        title="Delivery Geofencing Zones"
        subtitle="Establish service regions and track driver border breach triggers"
        action={
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={() => setOpenMapEditor(true)}
            >
              Draw Geofence
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setOpenCreate(true)}
            >
              Create Zone
            </Button>
          </Box>
        }
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Zone Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Boundary Vertices</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {zones.map((zone) => (
              <TableRow key={zone._id}>
                <TableCell sx={{ fontWeight: 600, color: 'primary.light' }}>
                  {zone.name}
                </TableCell>
                <TableCell>{zone.description || 'No details provided'}</TableCell>
                <TableCell>
                  <Chip
                    label={zone.status.toUpperCase()}
                    size="small"
                    color={zone.status === 'active' ? 'success' : 'default'}
                    sx={{ fontWeight: 700, fontSize: '0.65rem' }}
                  />
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {JSON.stringify(zone.coordinates?.coordinates)}
                </TableCell>
                <TableCell align="center">
                  <IconButton color="error" onClick={() => handleDelete(zone._id)} size="small" title="Delete Zone">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {zones.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  No geofences mapped.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* CREATE ZONE DIALOG */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Define Geofencing Zone</DialogTitle>
        <DialogContent sx={{ width: 380, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField label="Zone Name" fullWidth required value={name} onChange={(e) => setName(e.target.value)} sx={{ mt: 2 }} />
          <TextField label="Description" fullWidth multiline rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          <TextField
            select
            label="Status"
            fullWidth
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
          <TextField
            label="Polygon JSON Coordinates"
            fullWidth
            multiline
            rows={4}
            value={polygonCoords}
            onChange={(e) => setPolygonCoords(e.target.value)}
            helperText="Format: [[[lng, lat], [lng, lat], ...]] (polygon must close itself)"
            FormHelperTextProps={{ sx: { fontSize: '0.65rem' } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* DRAW GEOFENCE MAP DIALOG */}
      <Dialog open={openMapEditor} onClose={() => setOpenMapEditor(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Interactive Geofence Designer</DialogTitle>
        <DialogContent sx={{ height: 500 }}>
          <GeofenceEditor onSaveCoordinates={handleEditorCoordinatesSaved} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMapEditor(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Zones;
export { Zones };
