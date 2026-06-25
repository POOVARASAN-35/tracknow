import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Switch, FormControlLabel, Button } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EmailIcon from '@mui/icons-material/Email';
import SmsIcon from '@mui/icons-material/Sms';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import StarIcon from '@mui/icons-material/Star';
import SaveIcon from '@mui/icons-material/Save';

const NotificationSettings = ({ currentThemeMode = 'dark' }) => {
  const isDark = currentThemeMode === 'dark';

  // Toggle states
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [pushNotif, setPushNotif] = useState(true);
  const [deliveryAlert, setDeliveryAlert] = useState(true);
  const [promoNotif, setPromoNotif] = useState(false);
  const [systemUpdate, setSystemUpdate] = useState(true);

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const preferences = [
    { title: 'Email Notifications', desc: 'Receive invoice details, delivery completions, and feedback forms.', state: emailNotif, setter: setEmailNotif, icon: <EmailIcon /> },
    { title: 'SMS Notifications', desc: 'Receive instant text updates with OTP verifications and route ETA updates.', state: smsNotif, setter: setSmsNotif, icon: <SmsIcon /> },
    { title: 'Push Notifications', desc: 'Receive direct live app alerts for driver coordinates and dispatch flags.', state: pushNotif, setter: setPushNotif, icon: <TouchAppIcon /> },
    { title: 'Delivery Status Alerts', desc: 'Get updates on package transitions (Assigned, Picked Up, In Transit, Delivered).', state: deliveryAlert, setter: setDeliveryAlert, icon: <LocalShippingIcon /> },
    { title: 'Promotional Messages', desc: 'Receive offers, loyalty cashback news, and credit rewards events.', state: promoNotif, setter: setPromoNotif, icon: <StarIcon /> },
    { title: 'System Announcements', desc: 'Important server notices, maintenance logs, and feature additions.', state: systemUpdate, setter: setSystemUpdate, icon: <NotificationsIcon /> },
  ];

  return (
    <Card sx={{
      p: 1.5,
      borderRadius: '16px',
      bgcolor: isDark ? 'rgba(15, 20, 36, 0.6)' : '#ffffff',
      backdropFilter: 'blur(20px)',
      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.08)'}`,
      boxShadow: 'none'
    }}>
      <CardContent sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Communication Preferences
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              Choose how you want to be reached regarding order updates and accounts.
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            color="primary" 
            size="small"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
          >
            Save Options
          </Button>
        </Box>

        {saveSuccess && (
          <Box sx={{ p: 1.5, mb: 3, bgcolor: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '8px' }}>
            <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 800 }}>
              ✓ Notification preferences saved successfully!
            </Typography>
          </Box>
        )}

        <Box display="flex" flexDirection="column" gap={3}>
          {preferences.map((p, idx) => (
            <Box 
              key={idx} 
              display="flex" 
              alignItems="center" 
              justifyContent="space-between"
              pb={idx !== preferences.length - 1 ? 2.5 : 0}
              sx={{ borderBottom: idx !== preferences.length - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` : 'none' }}
            >
              <Box display="flex" gap={2} alignItems="flex-start" sx={{ maxWidth: '80%' }}>
                <Box sx={{ mt: 0.5, color: isDark ? 'primary.main' : 'primary.dark' }}>
                  {p.icon}
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {p.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, lineHeight: 1.4 }}>
                    {p.desc}
                  </Typography>
                </Box>
              </Box>
              <Switch 
                checked={p.state} 
                onChange={(e) => p.setter(e.target.checked)} 
                color="primary"
              />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
