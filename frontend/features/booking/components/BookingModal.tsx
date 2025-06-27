"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  TextField,
  Avatar,
  Chip,
  IconButton,
  Alert,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  Close,
  Schedule,
  CalendarToday,
  Language,
  Person,
  Message,
  CheckCircle,
  VideoCall,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { TimeSlotPicker } from './TimeSlotPicker';
import { BookingRequest, TimeSlot } from '../types';

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  hostId: string;
  hostName: string;
  hostAvatar?: string;
  hostLanguages: {
    native: string[];
    target: string[];
  };
  selectedDate: Date;
  availableSlots: TimeSlot[];
  onConfirm: (booking: BookingRequest) => Promise<void>;
  isLoading?: boolean;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  open,
  onClose,
  hostId,
  hostName,
  hostAvatar,
  hostLanguages,
  selectedDate,
  availableSlots,
  onConfirm,
  isLoading = false,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!selectedSlot) {
      setError('Please select a time slot');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const booking: BookingRequest = {
        hostId,
        date: selectedDate.toISOString(),
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        message: message.trim(),
        languages: {
          native: hostLanguages.target, // Guest's native is host's target
          target: hostLanguages.native, // Guest's target is host's native
        },
      };

      await onConfirm(booking);
      setIsSuccess(true);
      
      // Close modal after showing success
      setTimeout(() => {
        onClose();
        // Reset state after animation
        setTimeout(() => {
          setSelectedSlot(null);
          setMessage('');
          setIsSuccess(false);
        }, 300);
      }, 1500);
    } catch (err) {
      setError('Failed to book session. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      // Reset state after animation
      setTimeout(() => {
        setSelectedSlot(null);
        setMessage('');
        setError(null);
        setIsSuccess(false);
      }, 300);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: theme => theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        },
      }}
    >
      <DialogTitle sx={{ p: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={700}>
            Book a Session
          </Typography>
          <IconButton onClick={handleClose} disabled={isSubmitting}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <Box
                sx={{
                  py: 6,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <CheckCircle sx={{ fontSize: 64, color: 'success.main' }} />
                <Typography variant="h6" fontWeight={600}>
                  Session Booked Successfully!
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Your session request has been sent to {hostName}.
                  You'll receive a confirmation once they accept.
                </Typography>
              </Box>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Host Info */}
              <Box
                sx={{
                  p: 2,
                  mb: 3,
                  borderRadius: 2,
                  backgroundColor: theme => theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.03)'
                    : 'rgba(0, 0, 0, 0.02)',
                  border: theme => `1px solid ${theme.palette.mode === 'dark' 
                    ? 'rgba(255,255,255,0.08)' 
                    : 'rgba(0,0,0,0.08)'}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    src={hostAvatar}
                    alt={hostName}
                    sx={{ width: 56, height: 56 }}
                  >
                    {hostName.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {hostName}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                      <Chip
                        icon={<Language sx={{ fontSize: 16 }} />}
                        label={`Native: ${hostLanguages.native.join(', ')}`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        icon={<Language sx={{ fontSize: 16 }} />}
                        label={`Learning: ${hostLanguages.target.join(', ')}`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Date Display */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CalendarToday sx={{ fontSize: 20, color: 'primary.main' }} />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Session Date
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Time Slot Selection */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Schedule sx={{ fontSize: 20, color: 'primary.main' }} />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Select Time Slot
                  </Typography>
                </Box>
                <TimeSlotPicker
                  slots={availableSlots}
                  selectedSlot={selectedSlot}
                  onSelectSlot={setSelectedSlot}
                  disabled={isSubmitting}
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Message */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Message sx={{ fontSize: 20, color: 'primary.main' }} />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Message (Optional)
                  </Typography>
                </Box>
                <TextField
                  multiline
                  rows={3}
                  fullWidth
                  placeholder="Introduce yourself or share what you'd like to focus on..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isSubmitting}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: theme => theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.03)'
                        : 'rgba(0, 0, 0, 0.02)',
                    },
                  }}
                />
              </Box>

              {/* Session Info */}
              <Alert
                severity="info"
                icon={<VideoCall />}
                sx={{
                  borderRadius: 2,
                  backgroundColor: theme => theme.palette.mode === 'dark'
                    ? 'rgba(33, 150, 243, 0.1)'
                    : 'rgba(33, 150, 243, 0.05)',
                  '& .MuiAlert-icon': {
                    color: 'info.main',
                  },
                }}
              >
                <Typography variant="body2">
                  Sessions are 30 minutes long and conducted via video call.
                  The meeting link will be shared once your booking is confirmed.
                </Typography>
              </Alert>

              {error && (
                <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>

      {!isSuccess && (
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleClose}
            disabled={isSubmitting}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedSlot}
            sx={{
              borderRadius: 2,
              minWidth: 120,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: '0 4px 20px rgba(99, 102, 241, 0.25)',
              '&:hover': {
                boxShadow: '0 8px 30px rgba(99, 102, 241, 0.35)',
              },
            }}
          >
            {isSubmitting ? 'Booking...' : 'Confirm Booking'}
          </Button>
        </DialogActions>
      )}

      {isSubmitting && (
        <LinearProgress
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            borderRadius: '12px 12px 0 0',
          }}
        />
      )}
    </Dialog>
  );
};