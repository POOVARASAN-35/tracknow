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
  Tooltip,
  Divider
} from '@mui/material';
import RateReviewIcon from '@mui/icons-material/RateReview';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const SupportCenter = ({
  tickets = [],
  themeMode = 'light',
  onResolveTicket
}) => {
  const [detailOpen, setDetailOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const openTicketDetail = (ticket) => {
    setSelectedTicket(ticket);
    setDetailOpen(true);
  };

  const openReplyModal = (ticket) => {
    setSelectedTicket(ticket);
    setReplyText('');
    setReplyOpen(true);
  };

  const handleReplySubmit = () => {
    if (selectedTicket && replyText.trim()) {
      // Typically updates state/DB or sends an email via backend.
      // We will mark the ticket as resolved when a reply is sent.
      onResolveTicket(selectedTicket._id, 'resolved');
      setReplyOpen(false);
      setSelectedTicket(null);
    }
  };

  const getStatusChipColor = (status) => {
    switch (status) {
      case 'resolved': return 'success';
      case 'pending': return 'warning';
      case 'open': default: return 'error';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchCategory = categoryFilter === 'all' || ticket.category === categoryFilter;
    const matchStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchCategory && matchStatus;
  });

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
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3.5}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Customer & Driver Support Center
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Process complaints, system feedback, and rider/courier support tickets.
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <TextField
            select
            label="Filter Category"
            size="small"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="all">All Categories</MenuItem>
            <MenuItem value="Customer Complaint">Customer Complaint</MenuItem>
            <MenuItem value="Driver Complaint">Driver Complaint</MenuItem>
            <MenuItem value="System Feedback">System Feedback</MenuItem>
          </TextField>

          <TextField
            select
            label="Filter Status"
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
          </TextField>
        </Box>
      </Box>

      <TableContainer sx={{ border: themeMode === 'light' ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
        <Table>
          <TableHead sx={{ bgcolor: themeMode === 'light' ? '#F8FAFC' : '#0F172A' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>Ticket Subject</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>User / Contact</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Created Date</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 800 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTickets.map((ticket) => (
              <TableRow key={ticket._id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {ticket.subject}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ticket.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {ticket.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {ticket.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={ticket.category || 'General'}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 700, fontSize: '0.65rem' }}
                  />
                </TableCell>
                <TableCell>
                  {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={ticket.status?.toUpperCase() || 'OPEN'}
                    color={getStatusChipColor(ticket.status)}
                    size="small"
                    sx={{ fontWeight: 800, fontSize: '0.65rem' }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Box display="flex" justifyContent="center" gap={1}>
                    <Tooltip title="View Ticket Content">
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => openTicketDetail(ticket)}
                        sx={{ bgcolor: themeMode === 'light' ? 'rgba(37,99,235,0.06)' : 'rgba(37,99,235,0.15)' }}
                      >
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {ticket.status !== 'resolved' ? (
                      <>
                        <Tooltip title="Send Email Reply">
                          <IconButton
                            color="info"
                            size="small"
                            onClick={() => openReplyModal(ticket)}
                            sx={{ bgcolor: themeMode === 'light' ? 'rgba(3,169,244,0.06)' : 'rgba(3,169,244,0.15)' }}
                          >
                            <RateReviewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Mark Resolved Directly">
                          <IconButton
                            color="success"
                            size="small"
                            onClick={() => onResolveTicket(ticket._id, 'resolved')}
                            sx={{ bgcolor: themeMode === 'light' ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.15)' }}
                          >
                            <CheckCircleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    ) : (
                      <Chip label="Handled" color="success" size="small" variant="outlined" sx={{ fontWeight: 800, fontSize: '0.65rem' }} />
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}

            {filteredTickets.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    No tickets found matching filters.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* TICKET DETAIL DIALOG */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Support Case Details</DialogTitle>
        <DialogContent dividers>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Box>
              <Typography variant="caption" color="text.secondary">FROM</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedTicket?.name} ({selectedTicket?.email})</Typography>
            </Box>
            <Box textAlign="right">
              <Typography variant="caption" color="text.secondary">CATEGORY</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedTicket?.category}</Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="caption" color="text.secondary">SUBJECT</Typography>
          <Typography variant="body1" sx={{ fontWeight: 800, mb: 2 }}>{selectedTicket?.subject}</Typography>
          
          <Typography variant="caption" color="text.secondary">DESCRIPTION</Typography>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: themeMode === 'light' ? '#F8FAFC' : '#0F172A', border: '1px solid rgba(0,0,0,0.05)', mb: 2 }}>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {selectedTicket?.description}
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          {selectedTicket?.status !== 'resolved' && (
            <Button variant="contained" color="primary" onClick={() => { setDetailOpen(false); openReplyModal(selectedTicket); }}>
              Write Response
            </Button>
          )}
          <Button onClick={() => setDetailOpen(false)} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>

      {/* TICKET REPLY DIALOG */}
      <Dialog open={replyOpen} onClose={() => setReplyOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Write Email Dispatch Response</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Drafting response to <strong>{selectedTicket?.email}</strong> regarding subject <em>"{selectedTicket?.subject}"</em>.
          </Typography>
          <TextField
            label="Logistics Support Response"
            required
            fullWidth
            multiline
            rows={5}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type support response or follow-up questions to resolve the ticket..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setReplyOpen(false)} variant="outlined">Close</Button>
          <Button onClick={handleReplySubmit} variant="contained" color="primary" disabled={!replyText.trim()}>
            Send Response & Resolve
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default SupportCenter;
export { SupportCenter };
