"use client";

import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Schedule } from '@mui/icons-material';
import { TimeSlot } from '../types';

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
  disabled?: boolean;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  slots,
  selectedSlot,
  onSelectSlot,
  disabled = false,
}) => {
  const theme = useTheme();

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const groupedSlots = React.useMemo(() => {
    const groups: { [key: string]: TimeSlot[] } = {
      morning: [],
      afternoon: [],
      evening: [],
    };

    slots.forEach(slot => {
      const hour = new Date(slot.startTime).getHours();
      if (hour < 12) {
        groups.morning.push(slot);
      } else if (hour < 17) {
        groups.afternoon.push(slot);
      } else {
        groups.evening.push(slot);
      }
    });

    return groups;
  }, [slots]);

  if (slots.length === 0) {
    return (
      <Box
        sx={{
          py: 4,
          textAlign: 'center',
          borderRadius: 2,
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.03)'
            : 'rgba(0, 0, 0, 0.02)',
          border: `1px dashed ${theme.palette.mode === 'dark' 
            ? 'rgba(255,255,255,0.1)' 
            : 'rgba(0,0,0,0.1)'}`,
        }}
      >
        <Schedule sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          No available time slots for this date
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {Object.entries(groupedSlots).map(([period, periodSlots]) => {
        if (periodSlots.length === 0) return null;

        return (
          <Box key={period} sx={{ mb: 3 }}>
            <Typography
              variant="caption"
              fontWeight={600}
              color="text.secondary"
              sx={{ textTransform: 'capitalize', mb: 1, display: 'block' }}
            >
              {period}
            </Typography>
            <Grid container spacing={1}>
              {periodSlots.map((slot, index) => {
                const isSelected = selectedSlot?.id === slot.id;
                const isAvailable = slot.available && !disabled;

                return (
                  <Grid item xs={6} sm={4} key={slot.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={isAvailable ? { scale: 1.05 } : {}}
                      whileTap={isAvailable ? { scale: 0.95 } : {}}
                    >
                      <Paper
                        onClick={() => isAvailable && onSelectSlot(slot)}
                        elevation={0}
                        sx={{
                          p: 2,
                          cursor: isAvailable ? 'pointer' : 'not-allowed',
                          textAlign: 'center',
                          borderRadius: 2,
                          position: 'relative',
                          overflow: 'hidden',
                          border: `1px solid ${
                            isSelected
                              ? theme.palette.primary.main
                              : theme.palette.mode === 'dark'
                                ? 'rgba(255,255,255,0.1)'
                                : 'rgba(0,0,0,0.1)'
                          }`,
                          backgroundColor: isSelected
                            ? theme.palette.mode === 'dark'
                              ? 'rgba(99, 102, 241, 0.2)'
                              : 'rgba(99, 102, 241, 0.1)'
                            : slot.available
                              ? theme.palette.mode === 'dark'
                                ? 'rgba(255, 255, 255, 0.03)'
                                : 'rgba(0, 0, 0, 0.02)'
                              : theme.palette.mode === 'dark'
                                ? 'rgba(255, 255, 255, 0.01)'
                                : 'rgba(0, 0, 0, 0.01)',
                          opacity: slot.available ? 1 : 0.5,
                          transition: 'all 0.2s ease',
                          '&:hover': isAvailable ? {
                            borderColor: theme.palette.primary.main,
                            backgroundColor: theme.palette.mode === 'dark'
                              ? 'rgba(99, 102, 241, 0.1)'
                              : 'rgba(99, 102, 241, 0.05)',
                          } : {},
                        }}
                      >
                        {isSelected && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: 3,
                              background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
                            }}
                          />
                        )}
                        
                        <Typography
                          variant="body2"
                          fontWeight={isSelected ? 600 : 500}
                          color={!slot.available ? 'text.disabled' : 'text.primary'}
                        >
                          {formatTime(slot.startTime)}
                        </Typography>
                        
                        {!slot.available && (
                          <Typography
                            variant="caption"
                            color="text.disabled"
                            sx={{ display: 'block', mt: 0.5 }}
                          >
                            Booked
                          </Typography>
                        )}
                      </Paper>
                    </motion.div>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        );
      })}
    </Box>
  );
};