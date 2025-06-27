"use client";

import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Grid,
  Badge,
  useTheme,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Today,
  Schedule,
  Language,
  VideocamOutlined,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Session } from '../types';

interface SessionCalendarProps {
  sessions?: Session[];
  onDateSelect?: (date: Date) => void;
  onSessionClick?: (session: Session) => void;
  selectedDate?: Date;
  isLoading?: boolean;
  hostMode?: boolean; // Show as host view vs guest view
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const SessionCalendar: React.FC<SessionCalendarProps> = ({
  sessions = [],
  onDateSelect,
  onSessionClick,
  selectedDate = new Date(),
  isLoading = false,
  hostMode = false,
}) => {
  const theme = useTheme();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: Date[] = [];
    const current = new Date(startDate);

    while (current <= lastDay || current.getDay() !== 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [currentMonth]);

  const sessionsByDate = useMemo(() => {
    const map = new Map<string, Session[]>();
    sessions.forEach(session => {
      const dateKey = new Date(session.date).toDateString();
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(session);
    });
    return map;
  }, [sessions]);

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    onDateSelect?.(today);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate.toDateString() === date.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const getSessionsForDate = (date: Date) => {
    return sessionsByDate.get(date.toDateString()) || [];
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
      }}
    >
      {/* Calendar Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={handlePreviousMonth} size="small">
              <ChevronLeft />
            </IconButton>
            <Typography variant="h6" fontWeight={600}>
              {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Typography>
            <IconButton onClick={handleNextMonth} size="small">
              <ChevronRight />
            </IconButton>
          </Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Today />}
            onClick={handleToday}
            sx={{
              borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
            }}
          >
            Today
          </Button>
        </Box>

        {/* Weekday Headers */}
        <Grid container spacing={1}>
          {WEEKDAYS.map(day => (
            <Grid item xs key={day} sx={{ textAlign: 'center' }}>
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
                sx={{ textTransform: 'uppercase' }}
              >
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Calendar Days */}
      <Grid container spacing={1}>
        <AnimatePresence mode="wait">
          {calendarDays.map((date, index) => {
            const daysSessions = getSessionsForDate(date);
            const hasSession = daysSessions.length > 0;
            const isPast = date < new Date() && !isToday(date);

            return (
              <Grid item xs key={index}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: index * 0.01 }}
                >
                  <Box
                    onClick={() => !isPast && onDateSelect?.(date)}
                    onMouseEnter={() => setHoveredDate(date)}
                    onMouseLeave={() => setHoveredDate(null)}
                    sx={{
                      position: 'relative',
                      aspectRatio: '1',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 2,
                      cursor: isPast ? 'default' : 'pointer',
                      opacity: isPast ? 0.4 : (isCurrentMonth(date) ? 1 : 0.6),
                      backgroundColor: isSelected(date)
                        ? theme.palette.primary.main
                        : isToday(date)
                          ? theme.palette.mode === 'dark'
                            ? 'rgba(99, 102, 241, 0.2)'
                            : 'rgba(99, 102, 241, 0.1)'
                          : hoveredDate?.toDateString() === date.toDateString()
                            ? theme.palette.mode === 'dark'
                              ? 'rgba(255, 255, 255, 0.05)'
                              : 'rgba(0, 0, 0, 0.05)'
                            : 'transparent',
                      color: isSelected(date) ? '#fff' : 'inherit',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: isPast ? 'none' : 'scale(1.05)',
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={isToday(date) ? 700 : 500}
                    >
                      {date.getDate()}
                    </Typography>

                    {hasSession && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 4,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          display: 'flex',
                          gap: 0.5,
                        }}
                      >
                        {daysSessions.slice(0, 3).map((_, i) => (
                          <Box
                            key={i}
                            sx={{
                              width: 4,
                              height: 4,
                              borderRadius: '50%',
                              backgroundColor: isSelected(date)
                                ? '#fff'
                                : theme.palette.primary.main,
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                </motion.div>
              </Grid>
            );
          })}
        </AnimatePresence>
      </Grid>

      {/* Selected Date Sessions */}
      {selectedDate && (
        <Box sx={{ mt: 3, pt: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Sessions on {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Typography>

          <Box sx={{ mt: 2 }}>
            {getSessionsForDate(selectedDate).length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                No sessions scheduled for this date
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {getSessionsForDate(selectedDate).map((session) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Paper
                      onClick={() => onSessionClick?.(session)}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        backgroundColor: theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.03)'
                          : 'rgba(0, 0, 0, 0.02)',
                        border: `1px solid ${theme.palette.mode === 'dark' 
                          ? 'rgba(255,255,255,0.08)' 
                          : 'rgba(0,0,0,0.08)'}`,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(0, 0, 0, 0.03)',
                          borderColor: theme.palette.primary.main,
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Schedule sx={{ fontSize: 20, color: theme.palette.primary.main }} />
                          <Typography variant="body2" fontWeight={600}>
                            {session.startTime} - {session.endTime}
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          label={session.status}
                          color={
                            session.status === 'confirmed' ? 'success' :
                            session.status === 'pending' ? 'warning' :
                            session.status === 'cancelled' ? 'error' : 'default'
                          }
                        />
                      </Box>

                      <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Language sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {hostMode ? session.guestName || 'Pending' : session.hostName}
                          </Typography>
                        </Box>
                        {session.meetingLink && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <VideocamOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              Video call
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Paper>
                  </motion.div>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Paper>
  );
};