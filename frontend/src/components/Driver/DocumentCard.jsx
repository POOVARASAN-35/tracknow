import React, { useRef } from 'react';
import { Box, Card, CardContent, Typography, Grid, Button, IconButton, Chip } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PendingIcon from '@mui/icons-material/Pending';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AutorenewIcon from '@mui/icons-material/Autorenew';

const DocumentCard = ({ documents = [], onUploadDoc, themeMode = 'dark' }) => {
  const fileInputRef = useRef(null);
  const activeDocNameRef = useRef('');

  // Built-in list of documents we expect a driver to have
  const expectedDocs = [
    { name: 'Driving License', key: 'driving_license', status: 'verified', uploadDate: 'Jan 10, 2026' },
    { name: 'Aadhaar Card', key: 'aadhaar', status: 'verified', uploadDate: 'Jan 10, 2026' },
    { name: 'PAN Card', key: 'pan', status: 'verified', uploadDate: 'Jan 12, 2026' },
    { name: 'Vehicle RC', key: 'vehicle_rc', status: 'verified', uploadDate: 'Feb 15, 2026' },
    { name: 'Background Verification', key: 'background_check', status: 'verified', uploadDate: 'Jan 10, 2026' },
    { name: 'Fleet Insurance', key: 'insurance', status: 'verified', uploadDate: 'Mar 01, 2026' }
  ];

  // Map database documents to our list or append new ones
  const docsList = expectedDocs.map((doc) => {
    const matched = documents.find((d) => d.name.toLowerCase().includes(doc.name.toLowerCase()));
    if (matched) {
      return {
        ...doc,
        uploadDate: new Date(matched.uploadedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
        url: matched.url,
        status: 'verified'
      };
    }
    return {
      ...doc,
      status: 'pending', // Default since not uploaded
      url: null
    };
  });

  const getStatusChip = (status) => {
    switch (status) {
      case 'verified':
        return (
          <Chip
            icon={<VerifiedUserIcon sx={{ fontSize: '0.9rem !important', color: '#10B981' }} />}
            label="Verified"
            size="small"
            sx={{ bgcolor: 'rgba(16,185,129,0.08)', color: '#10B981', fontWeight: 800, fontSize: '0.65rem' }}
          />
        );
      case 'pending':
        return (
          <Chip
            icon={<PendingIcon sx={{ fontSize: '0.9rem !important', color: '#F59E0B' }} />}
            label="Pending Review"
            size="small"
            sx={{ bgcolor: 'rgba(245,158,11,0.08)', color: '#F59E0B', fontWeight: 800, fontSize: '0.65rem' }}
          />
        );
      default:
        return (
          <Chip
            icon={<WarningAmberIcon sx={{ fontSize: '0.9rem !important', color: '#EF4444' }} />}
            label="Required"
            size="small"
            sx={{ bgcolor: 'rgba(239,68,68,0.08)', color: '#EF4444', fontWeight: 800, fontSize: '0.65rem' }}
          />
        );
    }
  };

  const handleUploadClick = (docName) => {
    activeDocNameRef.current = docName;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      onUploadDoc({
        docName: activeDocNameRef.current,
        docUrl: reader.result
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <Box>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept="image/*,application/pdf"
      />
      <Grid container spacing={2.5}>
        {docsList.map((doc, idx) => (
          <Grid item xs={12} sm={6} key={idx}>
            <Card sx={{
              bgcolor: themeMode === 'light' ? '#FFFFFF' : '#111827',
              borderRadius: '16px',
              border: themeMode === 'light' ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.06)',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: themeMode === 'light' ? '0 10px 20px rgba(0,0,0,0.04)' : '0 10px 30px rgba(0,0,0,0.4)',
                borderColor: 'primary.main'
              }
            }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box display="flex" gap={1.5} alignItems="center">
                    <Box sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '10px',
                      bgcolor: 'rgba(37,99,235,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'primary.main'
                    }}>
                      <DescriptionIcon />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: 'Poppins' }}>
                        {doc.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Uploaded: {doc.uploadDate || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                  {getStatusChip(doc.status)}
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center" gap={1} mt={3}>
                  <Box display="flex" gap={0.5}>
                    {doc.url ? (
                      <>
                        <IconButton
                          size="small"
                          color="primary"
                          component="a"
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          title="View Document"
                          sx={{ bgcolor: 'rgba(37,99,235,0.04)' }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="success"
                          component="a"
                          href={doc.url}
                          download={`${doc.name.replace(/\s+/g, '_')}`}
                          title="Download Document"
                          sx={{ bgcolor: 'rgba(16,185,129,0.04)' }}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </>
                    ) : (
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', pl: 1 }}>
                        Not uploaded yet
                      </Typography>
                    )}
                  </Box>

                  <Button
                    size="small"
                    variant="text"
                    startIcon={doc.url ? <AutorenewIcon fontSize="small" /> : <CloudUploadIcon fontSize="small" />}
                    onClick={() => handleUploadClick(doc.name)}
                    sx={{ fontWeight: 800, fontSize: '0.75rem', fontFamily: 'Poppins' }}
                  >
                    {doc.url ? 'Replace' : 'Upload'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DocumentCard;
export { DocumentCard };
