import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Grid,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import BadgeIcon from '@mui/icons-material/Badge';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import KeyIcon from '@mui/icons-material/Key';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CircleIcon from '@mui/icons-material/Circle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const ProfileCard = ({
  user,
  profile,
  themeMode = 'light',
  onUpdateProfile,
  onUploadDoc
}) => {
  const [openEdit, setOpenEdit] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);
  const [openUpload, setOpenUpload] = useState(false);

  // Forms states
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  
  const [docName, setDocName] = useState('');
  const [docUrl, setDocUrl] = useState('');

  // Drag & drop file states
  const [isDragActive, setIsDragActive] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = React.useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    if (!docName) {
      setDocName(file.name.split('.').slice(0, -1).join('.') || file.name);
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setDocUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    onUpdateProfile({ name, email });
    setOpenEdit(false);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    onUpdateProfile({ password });
    setPassword('');
    setOpenPassword(false);
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!docName || !docUrl) return;
    onUploadDoc({ docName, docUrl });
    setDocName('');
    setDocUrl('');
    setFileName('');
    setOpenUpload(false);
  };

  const handleUploadClose = () => {
    setDocName('');
    setDocUrl('');
    setFileName('');
    setOpenUpload(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'success';
      case 'busy': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        
        {/* DRIVER SUMMARY CARD */}
        <Grid item xs={12} md={5}>
          <Card sx={{ bgcolor: themeMode === 'light' ? '#FFFFFF' : '#1E293B', border: `1px solid ${themeMode === 'light' ? '#E2E8F0' : 'rgba(255, 255, 255, 0.08)'}`, borderRadius: '16px', textAlign: 'center', p: 3 }}>
            <CardContent>
              <Avatar
                sx={{
                  width: 96,
                  height: 96,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: '#2563EB',
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  boxShadow: '0 4px 15px rgba(37,99,235,0.2)'
                }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>

              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {user?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Professional Courier Agent
              </Typography>

              <Box display="flex" justifyContent="center" gap={1.5} sx={{ mt: 2, mb: 3 }}>
                <Chip
                  label={profile?.status?.toUpperCase() || 'OFFLINE'}
                  color={getStatusColor(profile?.status)}
                  size="small"
                  sx={{ fontWeight: 800 }}
                />
                <Chip
                  label={`★ ${profile?.rating?.toFixed(1) || '5.0'} Rating`}
                  color="warning"
                  size="small"
                  sx={{ fontWeight: 800 }}
                />
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* ACTION BUTTONS */}
              <Box display="flex" flexDirection="column" gap={1.5}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setOpenEdit(true)}
                  sx={{ borderRadius: '8px', py: 1.2, fontWeight: 700 }}
                >
                  Edit profile details
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  startIcon={<KeyIcon />}
                  onClick={() => setOpenPassword(true)}
                  sx={{ borderRadius: '8px', py: 1.2, fontWeight: 700 }}
                >
                  Update Access Password
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* GENERAL SPECS AND VEHICLE INFO */}
        <Grid item xs={12} md={7}>
          <Grid container spacing={3}>
            
            {/* SPECS CARD */}
            <Grid item xs={12}>
              <Card sx={{ bgcolor: themeMode === 'light' ? '#FFFFFF' : '#1E293B', border: `1px solid ${themeMode === 'light' ? '#E2E8F0' : 'rgba(255, 255, 255, 0.08)'}`, borderRadius: '16px', p: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 3 }}>
                  Driver Credentials Specs
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} display="flex" gap={2} alignItems="center">
                    <FingerprintIcon color="primary" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">DRIVER SYSTEM ID</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{profile?._id || 'N/A'}</Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6} display="flex" gap={2} alignItems="center">
                    <BadgeIcon color="primary" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">LICENSE REGISTRATION NO</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{profile?.licenseNumber || 'N/A'}</Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6} display="flex" gap={2} alignItems="center">
                    <EmailIcon color="primary" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">EMAIL ADDRESS</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{user?.email || 'N/A'}</Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6} display="flex" gap={2} alignItems="center">
                    <PhoneIcon color="primary" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">CONTACT NUMBER</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{user?.phone || '+91 98765 43210'}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            {/* VEHICLE DETAILS CARD */}
            <Grid item xs={12}>
              <Card sx={{ bgcolor: themeMode === 'light' ? '#FFFFFF' : '#1E293B', border: `1px solid ${themeMode === 'light' ? '#E2E8F0' : 'rgba(255, 255, 255, 0.08)'}`, borderRadius: '16px', p: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 3 }}>
                  Assigned Cargo Vehicle Details
                </Typography>
                
                {profile?.vehicle ? (
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} display="flex" gap={2} alignItems="center">
                      <DriveEtaIcon color="primary" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">VEHICLE PLATE REGISTRATION</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#2563EB' }}>
                          {profile.vehicle.vehicleNumber}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} display="flex" gap={2} alignItems="center">
                      <ContactPhoneIcon color="primary" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">VEHICLE MODEL SPEC</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {profile.vehicle.model}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} display="flex" gap={2} alignItems="center">
                      <CircleIcon color="success" sx={{ fontSize: 14 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">VEHICLE TYPE CLEARANCE</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                          {profile.vehicle.type}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No fleet vehicle linked. Contact admin dispatchers immediately.
                  </Typography>
                )}
              </Card>
            </Grid>

            {/* DOCUMENTS SPECIFICATIONS CARD */}
            <Grid item xs={12}>
              <Card sx={{ bgcolor: themeMode === 'light' ? '#FFFFFF' : '#1E293B', border: `1px solid ${themeMode === 'light' ? '#E2E8F0' : 'rgba(255, 255, 255, 0.08)'}`, borderRadius: '16px', p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    Uploaded Driver License & Documents
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<UploadFileIcon />}
                    onClick={() => setOpenUpload(true)}
                    sx={{ borderRadius: '6px', fontWeight: 700 }}
                  >
                    Upload Document
                  </Button>
                </Box>
                <Divider sx={{ mb: 2 }} />
                {profile?.documents?.length > 0 ? (
                  <List sx={{ p: 0 }}>
                    {profile.documents.map((doc, i) => (
                      <ListItem key={i} sx={{ px: 0, py: 1.25 }}>
                        <ListItemIcon><DescriptionIcon color="primary" /></ListItemIcon>
                        <ListItemText
                          primary={doc.name}
                          secondary={`Uploaded: ${new Date(doc.uploadedAt).toLocaleDateString()}`}
                          primaryTypographyProps={{ variant: 'body2', fontWeight: 700 }}
                        />
                        <Button size="small" variant="text" component="a" href={doc.url} target="_blank" rel="noopener noreferrer">
                          View
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No credential documents logged. Please upload your driver license or ID proof.
                  </Typography>
                )}
              </Card>
            </Grid>

          </Grid>
        </Grid>
      </Grid>

      {/* EDIT PROFILE DIALOG */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800 }}>Edit Profile</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <TextField label="Full Name" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
          <TextField label="Email Address" fullWidth type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained" sx={{ fontWeight: 700 }}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* UPDATE PASSWORD DIALOG */}
      <Dialog open={openPassword} onClose={() => setOpenPassword(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800 }}>Change Access Password</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <TextField label="New Password" fullWidth type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPassword(false)}>Cancel</Button>
          <Button onClick={handlePasswordSubmit} variant="contained" color="error" sx={{ fontWeight: 700 }}>Update Password</Button>
        </DialogActions>
      </Dialog>

      {/* UPLOAD DOCUMENT DIALOG */}
      <Dialog open={openUpload} onClose={handleUploadClose} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800 }}>Upload Driver Document</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <TextField 
            label="Document Name (e.g. License Front, ID Card)" 
            fullWidth 
            value={docName} 
            onChange={(e) => setDocName(e.target.value)} 
            required
          />
          
          {/* Drag & Drop File Upload Area */}
          <Box
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={onButtonClick}
            sx={{
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'divider',
              borderRadius: 3,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: isDragActive 
                ? (theme) => theme.palette.mode === 'light' ? 'rgba(37,99,235,0.05)' : 'rgba(37,99,235,0.1)'
                : 'background.default',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(37,99,235,0.02)' : 'rgba(37,99,235,0.05)'
              }
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleChange}
              style={{ display: 'none' }}
              accept="image/*,application/pdf"
            />
            
            <CloudUploadIcon 
              sx={{ 
                fontSize: 40, 
                color: isDragActive ? 'primary.main' : 'text.secondary',
                mb: 1.5,
                transition: 'color 0.2s'
              }} 
            />
            
            {fileName ? (
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
                  ✓ Selected: {fileName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Click or drag another file to replace
                </Typography>
              </Box>
            ) : (
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Drag & drop your document here
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  or click to browse from device
                </Typography>
                <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 1 }}>
                  Supports PDF, PNG, JPG (Max 5MB)
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUploadClose}>Cancel</Button>
          <Button 
            onClick={handleUploadSubmit} 
            variant="contained" 
            disabled={!docName || !docUrl}
            sx={{ fontWeight: 700 }}
          >
            Upload Document
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default ProfileCard;
export { ProfileCard };
