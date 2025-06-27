"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Avatar,
  AvatarGroup,
  Chip,
  Stack,
  Button,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Add,
  ChevronLeft,
  ChevronRight,
  Today,
  Schedule,
  Circle,
  ExpandMore,
  ExpandLess,
  KeyboardDoubleArrowLeft,
  KeyboardDoubleArrowRight,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme as useCustomTheme } from '@/contexts/ThemeContext';

interface TimeSlot {
  id: string;
  time: string;
  date: Date;
  title?: string;
  participants?: {
    id: string;
    name: string;
    avatar?: string;
    type: 'native' | 'learner';
  }[];
  status: 'confirmed' | 'pending' | 'available';
  sessionType?: 'one-on-one' | 'group';
}

interface CompactSchedulerProps {
  onAddSession?: (date: Date, time: string) => void;
  onSlotClick?: (slot: TimeSlot) => void;
}

// Generate time slots for multiple days
const generateTimeSlots = (startDate: Date, days: number = 7): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startHour = 9;
  const endHour = 18;
  
  for (let day = 0; day < days; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + day);
    
    for (let hour = startHour; hour < endHour; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      const slotDate = new Date(currentDate);
      slotDate.setHours(hour, 0, 0, 0);
      
      // Randomly generate some booked slots for demo
      const isBooked = Math.random() > 0.7;
      
      slots.push({
        id: `${day}-${hour}`,
        time,
        date: slotDate,
        status: isBooked ? (Math.random() > 0.5 ? 'confirmed' : 'pending') : 'available',
        ...(isBooked && {
          title: ['Spanish Practice', 'English Conversation', 'French Study'][Math.floor(Math.random() * 3)],
          participants: [
            { id: '1', name: 'Maria', avatar: 'https://i.pravatar.cc/150?img=5', type: 'native' },
            { id: '2', name: 'John', type: 'learner' },
          ],
          sessionType: Math.random() > 0.5 ? 'group' : 'one-on-one',
        }),
      });
    }
  }
  
  return slots;
};

export const CompactScheduler: React.FC<CompactSchedulerProps> = ({
  onAddSession,
  onSlotClick,
}) => {
  const { mode } = useCustomTheme();
  const darkMode = mode === 'dark';
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    // Generate slots for the entire month
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    setTimeSlots(generateTimeSlots(firstDay, 35)); // Generate enough slots for the view
  }, [currentMonth]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const getDaySlots = (date: Date) => {
    return timeSlots.filter(slot => 
      slot.date.toDateString() === date.toDateString()
    );
  };

  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    const startDayOfWeek = firstDay.getDay();
    
    // Start from the beginning of the week
    startDate.setDate(startDate.getDate() - startDayOfWeek);
    
    const days = [];
    const endDate = new Date(lastDay);
    // Ensure we show complete weeks
    const endDayOfWeek = lastDay.getDay();
    if (endDayOfWeek < 6) {
      endDate.setDate(endDate.getDate() + (6 - endDayOfWeek));
    }
    
    const current = new Date(startDate);
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const handlePrevMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
    
    // Select the first day of the new month or today if it's in this month
    const today = new Date();
    if (today.getMonth() === newMonth.getMonth() && today.getFullYear() === newMonth.getFullYear()) {
      setSelectedDate(today);
    } else {
      const firstDay = new Date(newMonth.getFullYear(), newMonth.getMonth(), 1);
      setSelectedDate(firstDay);
    }
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
    
    // Select the first day of the new month or today if it's in this month
    const today = new Date();
    if (today.getMonth() === newMonth.getMonth() && today.getFullYear() === newMonth.getFullYear()) {
      setSelectedDate(today);
    } else {
      const firstDay = new Date(newMonth.getFullYear(), newMonth.getMonth(), 1);
      setSelectedDate(firstDay);
    }
  };

  const handleToday = () => {
    const today = new Date();
    
    // Only update if we're not already on today
    if (selectedDate.toDateString() !== today.toDateString()) {
      setSelectedDate(today);
    }
    
    // Only update month if needed
    if (currentMonth.getMonth() !== today.getMonth() || 
        currentMonth.getFullYear() !== today.getFullYear()) {
      setCurrentMonth(today);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // If selecting a date in a different month, update the current month
    if (date.getMonth() !== currentMonth.getMonth() || 
        date.getFullYear() !== currentMonth.getFullYear()) {
      setCurrentMonth(date);
    }
  };

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
    
    // Update month if needed
    if (newDate.getMonth() !== currentMonth.getMonth() || 
        newDate.getFullYear() !== currentMonth.getFullYear()) {
      setCurrentMonth(newDate);
    }
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
    
    // Update month if needed
    if (newDate.getMonth() !== currentMonth.getMonth() || 
        newDate.getFullYear() !== currentMonth.getFullYear()) {
      setCurrentMonth(newDate);
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth() && 
           date.getFullYear() === currentMonth.getFullYear();
  };

  const getSessionCount = (date: Date) => {
    const daySlots = getDaySlots(date);
    return daySlots.filter(s => s.status !== 'available').length;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        background: darkMode
          ? 'rgba(30, 30, 30, 0.5)'
          : 'white',
        border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}`,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "16px" }}>
            Book a session
          </Typography>
          <Stack direction="row" spacing={0.5}>
            <Button
              size="small"
              variant="outlined"
              onClick={handleToday}
              sx={{
                fontSize: '11px',
                py: 0.5,
                px: 1.5,
                borderColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
              }}
            >
              Today
            </Button>
            <IconButton
              size="small"
              onClick={() => setShowCalendar(!showCalendar)}
              title={showCalendar ? "Hide calendar" : "Show calendar"}
            >
              {showCalendar ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />}
            </IconButton>
          </Stack>
        </Stack>

        {/* Month and Day Navigation */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <IconButton size="small" onClick={handlePrevMonth} title="Previous month">
              <KeyboardDoubleArrowLeft sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton size="small" onClick={handlePrevDay} title="Previous day">
              <ChevronLeft sx={{ fontSize: 20 }} />
            </IconButton>
          </Stack>
          
          <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '16px' }}>
            {formatMonthYear(currentMonth)}
          </Typography>
          
          <Stack direction="row" spacing={0.5} alignItems="center">
            <IconButton size="small" onClick={handleNextDay} title="Next day">
              <ChevronRight sx={{ fontSize: 20 }} />
            </IconButton>
            <IconButton size="small" onClick={handleNextMonth} title="Next month">
              <KeyboardDoubleArrowRight sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>
        </Stack>

        {/* Calendar Grid */}
        {showCalendar && (
          <>
            {/* Weekday Headers */}
            <Stack direction="row" spacing={0.5} sx={{ mb: 1 }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <Box
                  key={day}
                  sx={{
                    flex: 1,
                    textAlign: 'center',
                    py: 0.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                    }}
                  >
                    {day}
                  </Typography>
                </Box>
              ))}
            </Stack>

            {/* Calendar Days */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
              {getCalendarDays().map((date) => {
                const selected = date.toDateString() === selectedDate.toDateString();
                const today = isToday(date);
                const inCurrentMonth = isCurrentMonth(date);
                const past = isPast(date);
                const hasSession = getSessionCount(date) > 0;
                
                return (
                  <Box
                    key={date.toDateString()}
                    onClick={() => !past && handleDateSelect(date)}
                    sx={{
                      aspectRatio: '1',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 1,
                      cursor: past ? 'default' : 'pointer',
                      position: 'relative',
                      opacity: !inCurrentMonth ? 0.3 : past ? 0.5 : 1,
                      backgroundColor: selected
                        ? '#6366f1'
                        : today
                          ? darkMode
                            ? 'rgba(99, 102, 241, 0.2)'
                            : 'rgba(99, 102, 241, 0.1)'
                          : 'transparent',
                      color: selected ? '#fff' : 'inherit',
                      transition: 'all 0.2s ease',
                      '&:hover': !past ? {
                        backgroundColor: selected
                          ? '#6366f1'
                          : darkMode
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(0, 0, 0, 0.05)',
                      } : {},
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '14px',
                        fontWeight: selected || today ? 600 : 400,
                      }}
                    >
                      {date.getDate()}
                    </Typography>
                    {hasSession && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 2,
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          backgroundColor: selected ? '#fff' : '#6366f1',
                        }}
                      />
                    )}
                  </Box>
                );
              })}
            </Box>
          </>
        )}
      </Box>

      {/* Time Slots */}
      <Box
        ref={scrollContainerRef}
        sx={{
          height: showCalendar ? 200 : 350,
          overflowY: 'auto',
          overflowX: 'hidden',
          transition: 'height 0.3s ease',
          '&::-webkit-scrollbar': {
            width: 6,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
            borderRadius: 3,
          },
        }}
      >
        <Box sx={{ p: 1.5 }}>
          {/* Selected Date Header */}
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 600, 
              mb: 2,
              color: darkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)',
            }}
          >
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Typography>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDate.toDateString()}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <Stack spacing={0.5}>
                {getDaySlots(selectedDate).map((slot, index) => {
                  const isPastSlot = slot.date < new Date();
                  
                  return (
                    <motion.div
                      key={slot.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <Box
                        onClick={() => {
                          if (!isPastSlot) {
                            if (slot.status === 'available') {
                              if (onAddSession) {
                                onAddSession(slot.date, slot.time);
                              } else if ((window as any).__openCreateSession) {
                                (window as any).__openCreateSession(slot.date, slot.time);
                              }
                            } else if (onSlotClick) {
                              onSlotClick(slot);
                            }
                          }
                        }}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: 1,
                          borderRadius: 1,
                          cursor: isPastSlot ? 'default' : 'pointer',
                          opacity: isPastSlot ? 0.5 : 1,
                          backgroundColor: slot.status === 'available'
                            ? 'transparent'
                            : darkMode
                              ? 'rgba(255, 255, 255, 0.03)'
                              : 'rgba(0, 0, 0, 0.02)',
                          border: `1px solid ${
                            slot.status === 'available' && !isPastSlot
                              ? darkMode
                                ? 'rgba(99, 102, 241, 0.3)'
                                : 'rgba(99, 102, 241, 0.2)'
                              : 'transparent'
                          }`,
                          borderStyle: slot.status === 'available' ? 'dashed' : 'solid',
                          transition: 'all 0.2s ease',
                          '&:hover': !isPastSlot ? {
                            backgroundColor: darkMode
                              ? 'rgba(99, 102, 241, 0.1)'
                              : 'rgba(99, 102, 241, 0.05)',
                            borderColor: '#6366f1',
                          } : {},
                        }}
                      >
                        {/* Time */}
                        <Box sx={{ width: 50, flexShrink: 0 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: '11px',
                              fontWeight: 500,
                              color: 'text.secondary',
                            }}
                          >
                            {slot.time}
                          </Typography>
                        </Box>

                        {/* Content */}
                        {slot.status === 'available' ? (
                          <Box sx={{ 
                            flex: 1, 
                            display: 'flex', 
                            alignItems: 'center',
                            justifyContent: 'center',
                            py: 1,
                          }}>
                            <Add sx={{ fontSize: 16, color: '#6366f1', mr: 0.5 }} />
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#6366f1',
                                fontSize: '11px',
                                fontWeight: 600,
                              }}
                            >
                              Available
                            </Typography>
                          </Box>
                        ) : (
                          <Box sx={{ flex: 1 }}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    display: 'block',
                                  }}
                                >
                                  {slot.title}
                                </Typography>
                                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.25 }}>
                                  <AvatarGroup
                                    max={2}
                                    sx={{
                                      '& .MuiAvatar-root': {
                                        width: 16,
                                        height: 16,
                                        fontSize: '9px',
                                        borderWidth: 1,
                                      },
                                    }}
                                  >
                                    {slot.participants?.map((p) => (
                                      <Avatar key={p.id} src={p.avatar}>
                                        {p.name.charAt(0)}
                                      </Avatar>
                                    ))}
                                  </AvatarGroup>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontSize: '10px',
                                      color: 'text.secondary',
                                    }}
                                  >
                                    {slot.sessionType}
                                  </Typography>
                                </Stack>
                              </Box>
                              {slot.status === 'pending' && (
                                <Tooltip title="Pending confirmation">
                                  <Circle sx={{ fontSize: 6, color: '#f59e0b' }} />
                                </Tooltip>
                              )}
                            </Stack>
                          </Box>
                        )}
                      </Box>
                    </motion.div>
                  );
                })}
              </Stack>
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>

      {/* Quick Add Button */}
      <Box
        sx={{
          p: 1.5,
          borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        }}
      >
        <Button
          fullWidth
          size="small"
          variant="contained"
          startIcon={<Add />}
          onClick={() => onAddSession?.(selectedDate, '')}
          sx={{
            py: 1,
            borderRadius: 1.5,
            fontSize: '12px',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.25)',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
            },
          }}
        >
          Book New Session
        </Button>
      </Box>
    </Paper>
  );
};