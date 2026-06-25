import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Button, TextField, Grid, Divider, FormControlLabel, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import DevicesIcon from '@mui/icons-material/Devices';
import SecurityIcon from '@mui/icons-material/Security';
import ShieldIcon from '@mui/icons-material/Shield';
import KeyIcon from '@mui/icons-material/Key';

const SecuritySettings = ({ currentThemeMode = 'dark' }) => {
  const isDark = currentThemeMode === 'dark';

  // State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState('');

  const [tfaEnabled, setTfaEnabled] = useState(false);
  const [tfaStatus, setTfaStatus] = useState('');

  const [sessions, setSessions] = useState([
    { id: 1, device: 'Chrome Browser (Windows)', location: 'Bengaluru, India', ip: '192.168.1.45', status: 'Active Now', current: true },
    { id: 2, device: 'TrackFlow Mobile App (iOS 15)', location: 'Bengaluru, India', ip: '103.54.21.90', status: 'Active 2 hours ago', current: false },
    { id: 3, device: 'Safari Browser (MacBook Pro)', location: 'Mumbai, India', ip: '115.110.42.12', status: 'Active 3 days ago', current: false }
  ]);

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordStatus('error-empty');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus('error-mismatch');
      return;
    }
    setPasswordStatus('success');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordStatus(''), 3000);
  };

  const handleTfaToggle = (e) => {
    const checked = e.target.checked;
    setTfaEnabled(checked);
    setTfaStatus(checked ? 'activated' : 'deactivated');
    setTimeout(() => setTfaStatus(''), 3000);
  };

  const handleLogoutAll = () => {
    // Keep only current session
    setSessions(sessions.filter(s => s.current));
    alert('Logged out from all other active session devices.');
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Change Password Form */}
        <Grid item xs={12} md={6}>
          <Card sx={{
            p: 1.5,
            borderRadius: '16px',
            bgcolor: isDark ? 'rgba(15, 20, 36, 0.6)' : '#ffffff',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.08)'}`,
            boxShadow: 'none',
            height: '100%'
          }}>
            <CardContent sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
                <KeyIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Update Password
                </Typography>
              </Box>

              {passwordStatus === 'error-empty' && (
                <Box sx={{ p: 1.5, mb: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px' }}>
                  <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 800 }}>
                    Please fill out all password fields.
                  </Typography>
                </Box>
              )}
              {passwordStatus === 'error-mismatch' && (
                <Box sx={{ p: 1.5, mb: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px' }}>
                  <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 800 }}>
                    Confirm password does not match new password.
                  </Typography>
                </Box>
              )}
              {passwordStatus === 'success' && (
                <Box sx={{ p: 1.5, mb: 2, bgcolor: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '8px' }}>
                  <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 800 }}>
                    Password successfully updated!
                  </Typography>
                </Box>
              )}

              <Box component="form" onSubmit={handlePasswordUpdate} display="flex" flexDirection="column" gap={2}>
                <TextField 
                  label="Current Password" 
                  type="password" 
                  fullWidth 
                  size="small"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
                <TextField 
                  label="New Password" 
                  type="password" 
                  fullWidth 
                  size="small"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <TextField 
                  label="Confirm New Password" 
                  type="password" 
                  fullWidth 
                  size="small"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button type="submit" variant="outlined" color="primary" sx={{ alignSelf: 'flex-start', fontWeight: 700, mt: 1 }}>
                  Change Password
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 2FA Security Switch */}
        <Grid item xs={12} md={6}>
          <Card sx={{
            p: 1.5,
            borderRadius: '16px',
            bgcolor: isDark ? 'rgba(15, 20, 36, 0.6)' : '#ffffff',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.08)'}`,
            boxShadow: 'none',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <CardContent sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
                <ShieldIcon color="secondary" />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Account Protection
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontSize: '0.8rem', lineHeight: 1.5 }}>
                Two-Factor Authentication (2FA) adds an extra layer of security to your TrackFlow portal. When logging in, you will be prompted to enter a verification code sent to your registered email or phone.
              </Typography>

              {tfaStatus === 'activated' && (
                <Box sx={{ p: 1.5, mb: 2, bgcolor: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '8px' }}>
                  <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 800 }}>
                    Two-Factor Authentication enabled.
                  </Typography>
                </Box>
              )}
              {tfaStatus === 'deactivated' && (
                <Box sx={{ p: 1.5, mb: 2, bgcolor: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b', borderRadius: '8px' }}>
                  <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 800 }}>
                    Two-Factor Authentication disabled.
                  </Typography>
                </Box>
              )}

              <FormControlLabel
                control={
                  <Switch 
                    checked={tfaEnabled} 
                    onChange={handleTfaToggle} 
                    color="secondary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                      Enable Two-Factor Authentication
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Send code to: {tfaEnabled ? 'Registered Email' : 'Disabled'}
                    </Typography>
                  </Box>
                }
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Devices Roster / Active Sessions */}
        <Grid item xs={12}>
          <Card sx={{
            p: 1.5,
            borderRadius: '16px',
            bgcolor: isDark ? 'rgba(15, 20, 36, 0.6)' : '#ffffff',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.08)'}`,
            boxShadow: 'none'
          }}>
            <CardContent sx={{ p: 2 }}>
              <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2} mb={3}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <DevicesIcon color="info" />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      Active Devices & Login History
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                      Review other sessions logged into your TrackFlow portal account.
                    </Typography>
                  </Box>
                </Box>
                {sessions.length > 1 && (
                  <Button 
                    variant="outlined" 
                    color="error" 
                    size="small"
                    onClick={handleLogoutAll}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                  >
                    Logout All Other Devices
                  </Button>
                )}
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Device Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>IP Address</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sessions.map((s) => (
                      <TableRow key={s.id} hover>
                        <TableCell sx={{ fontWeight: 800 }}>{s.device}</TableCell>
                        <TableCell>{s.location}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace' }}>{s.ip}</TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: s.current ? 'success.main' : 'text.secondary' }}>
                            {s.status}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SecuritySettings;
