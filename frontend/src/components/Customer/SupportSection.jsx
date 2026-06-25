import React, { useState } from 'react';
import { Grid, Card, CardContent, Typography, Box, Button, TextField, Accordion, AccordionSummary, AccordionDetails, Avatar, Divider, Chip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChatIcon from '@mui/icons-material/Chat';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import BugReportIcon from '@mui/icons-material/BugReport';
import CheckIcon from '@mui/icons-material/Check';
import { motion } from 'framer-motion';

const SupportSection = ({ currentThemeMode = 'dark' }) => {
  const isDark = currentThemeMode === 'dark';

  // Live Chat simulation state
  const [messages, setMessages] = useState([
    { sender: 'agent', text: 'Hello! Welcome to TrackFlow Customer Support. I am FlowBot, your automated logistic assistant. How can I help you today?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Ticket Form state
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [ticketId, setTicketId] = useState('');

  // Complaints state
  const [complaintId, setComplaintId] = useState('');
  const [complaintStatus, setComplaintStatus] = useState(null);

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsgs = [...messages, { sender: 'user', text: chatInput }];
    setMessages(newMsgs);
    setChatInput('');

    // Simulate Bot response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { sender: 'agent', text: 'Thank you for your message. Your query regarding current delivery locations has been noted. An agent will connect with you within 3 minutes.' }
      ]);
    }, 1000);
  };

  const handleRaiseTicket = (e) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDescription.trim()) return;
    const generatedId = `TK-${Math.floor(100000 + Math.random() * 900000)}`;
    setTicketId(generatedId);
    setTicketSuccess(true);
    setTicketSubject('');
    setTicketDescription('');
    setTimeout(() => setTicketSuccess(false), 8000);
  };

  const handleTrackComplaint = (e) => {
    e.preventDefault();
    if (!complaintId.trim()) return;
    // Simulate lookup
    if (complaintId.toLowerCase().includes('err') || complaintId.toLowerCase().includes('fail')) {
      setComplaintStatus({ id: complaintId, status: 'REJECTED', desc: 'Logistic investigation closed. Delivery photo matches coordinates.', date: 'Jun 15, 2026' });
    } else {
      setComplaintStatus({ id: complaintId.toUpperCase(), status: 'RESOLVED', desc: 'Driver partner re-dispatched. Package handed over successfully.', date: 'Jun 16, 2026' });
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Live Chat Simulator */}
      <Grid item xs={12} md={6}>
        <Card sx={{
          bgcolor: isDark ? 'rgba(15, 20, 36, 0.6)' : '#ffffff',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.08)'}`,
          borderRadius: '16px',
          boxShadow: 'none',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '90%', justifyContent: 'space-between' }}>
            <Box>
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <ChatIcon color="primary" />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Live Customer FlowBot Chat
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Chat with our AI bot to resolve standard ETA and delivery issues instantly.
                  </Typography>
                </Box>
              </Box>

              {/* Chat window */}
              <Box sx={{
                height: 250,
                overflowY: 'auto',
                bgcolor: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.02)',
                p: 2,
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                mb: 2.5
              }}>
                {messages.map((m, i) => (
                  <Box key={i} sx={{
                    alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                    bgcolor: m.sender === 'user' ? '#2563EB' : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    color: m.sender === 'user' ? '#fff' : 'text.primary',
                    px: 2,
                    py: 1.25,
                    borderRadius: m.sender === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                    maxWidth: '85%',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    lineHeight: 1.4
                  }}>
                    {m.text}
                  </Box>
                ))}
              </Box>
            </Box>

            <Box component="form" onSubmit={handleSendChat} display="flex" gap={1}>
              <TextField
                size="small"
                fullWidth
                placeholder="Ask a question about tracking status..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
              <Button type="submit" variant="contained" sx={{ px: 2.5, fontWeight: 700, borderRadius: '8px' }}>Send</Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Ticket form & complaint tracker */}
      <Grid item xs={12} md={6}>
        <Grid container spacing={3}>
          {/* Raise Support Ticket */}
          <Grid item xs={12}>
            <Card sx={{
              bgcolor: isDark ? 'rgba(15, 20, 36, 0.6)' : '#ffffff',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.08)'}`,
              borderRadius: '16px',
              boxShadow: 'none'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                  <SupportAgentIcon color="secondary" />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      Raise a Support Ticket
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Create a ticket for refund reviews, card issues, or driver reports.
                    </Typography>
                  </Box>
                </Box>

                {ticketSuccess && (
                  <Box sx={{ p: 1.5, mb: 2, bgcolor: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '8px' }}>
                    <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 800, display: 'block' }}>
                      ✓ Ticket successfully submitted! Ticket ID: <strong>{ticketId}</strong>. We will contact you via email.
                    </Typography>
                  </Box>
                )}

                <Box component="form" onSubmit={handleRaiseTicket} display="flex" flexDirection="column" gap={2}>
                  <TextField
                    label="Subject Title"
                    fullWidth
                    size="small"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                  />
                  <TextField
                    label="Issue Description"
                    fullWidth
                    multiline
                    rows={2}
                    required
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                  />
                  <Button type="submit" variant="outlined" color="secondary" sx={{ alignSelf: 'flex-start', fontWeight: 700, px: 2, borderRadius: '8px' }}>
                    Submit Ticket
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Track Complaint Status */}
          <Grid item xs={12}>
            <Card sx={{
              bgcolor: isDark ? 'rgba(15, 20, 36, 0.6)' : '#ffffff',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.08)'}`,
              borderRadius: '16px',
              boxShadow: 'none'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                  <BugReportIcon sx={{ color: '#EF4444' }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      Complaint & Dispute Tracker
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Input your Complaint ID (e.g. CP-9812) to check investigator status.
                    </Typography>
                  </Box>
                </Box>

                <Box component="form" onSubmit={handleTrackComplaint} display="flex" gap={1} mb={2}>
                  <TextField
                    placeholder="Enter Complaint ID..."
                    size="small"
                    fullWidth
                    value={complaintId}
                    onChange={(e) => setComplaintId(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                  />
                  <Button type="submit" variant="outlined" color="primary" sx={{ fontWeight: 700, borderRadius: '8px' }}>Search</Button>
                </Box>

                {complaintStatus && (
                  <Box sx={{ p: 2, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', borderRadius: '8px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        Dispute {complaintStatus.id}
                      </Typography>
                      <Chip 
                        label={complaintStatus.status} 
                        color={complaintStatus.status === 'RESOLVED' ? 'success' : 'error'} 
                        size="small"
                        sx={{ fontWeight: 800, fontSize: '0.6rem', height: 20 }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      {complaintStatus.desc}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Closed on: {complaintStatus.date}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* FAQs and Support helplines details */}
      <Grid item xs={12} md={7}>
        <Card sx={{
          bgcolor: isDark ? 'rgba(15, 20, 36, 0.6)' : '#ffffff',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.08)'}`,
          borderRadius: '16px',
          boxShadow: 'none'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
              <HelpOutlineIcon color="info" />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Frequently Asked Questions (FAQ)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Browse solutions to commonly reported logistic portal problems.
                </Typography>
              </Box>
            </Box>

            {[
              { q: 'How do I add a new location pin address?', a: 'Go to your Profile tab, click "Saved Locations", choose "Add Location", and input address fields along with latitude coordinates.' },
              { q: 'What is the refund turnaround period?', a: 'disputes are automatically reviewed. Funds are returned to credit cards/UPI wallets within 3 to 5 business banking days.' },
              { q: 'How does the customer referral rewards work?', a: 'Share your code from the rewards dashboard. When a friend finishes their first shipping delivery, your account is credited $10.' }
            ].map((faq, i) => (
              <Accordion key={i} sx={{ bgcolor: 'transparent', boxShadow: 'none', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{faq.q}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.4 }}>
                    {faq.a}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </CardContent>
        </Card>
      </Grid>

      {/* Helplines and email support contacts */}
      <Grid item xs={12} md={5}>
        <Card sx={{
          bgcolor: isDark ? 'rgba(15, 20, 36, 0.6)' : '#ffffff',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.08)'}`,
          borderRadius: '16px',
          boxShadow: 'none',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', borderRadius: '12px' }}>
                <PhoneIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
                  Enterprise Phone Support
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  +1 (800) 555-FLOW (Free Call)
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />

            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'rgba(37, 99, 235, 0.1)', color: '#2563EB', borderRadius: '12px' }}>
                <EmailIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
                  Logistic Support Email
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  support@trackflow.com
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default SupportSection;
