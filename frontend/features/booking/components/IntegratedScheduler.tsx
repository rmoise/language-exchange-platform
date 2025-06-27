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
  Collapse,
  Rating,
  LinearProgress,
  CircularProgress,
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
  Language,
  Verified,
  Star,
  ArrowBack,
  VideoCall,
  CheckCircle,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface Partner {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  languages: {
    native: string[];
    target: string[];
  };
  verified: boolean;
  sessionsCount: number;
}

interface TimeSlot {
  id: string;
  time: string;
  date: Date;
  availablePartners?: Partner[];
  bookedWith?: Partner;
  status: 'confirmed' | 'pending' | 'available';
}

interface IntegratedSchedulerProps {
  onBookSession?: (slot: TimeSlot, partner: Partner) => Promise<void>;
  darkMode?: boolean;
}

// Mock partners for demo
const mockPartners: Partner[] = [
  {
    id: '1',
    name: 'Maria Garcia',
    avatar: 'https://i.pravatar.cc/150?img=5',
    rating: 4.9,
    languages: { native: ['Spanish'], target: ['English'] },
    verified: true,
    sessionsCount: 342,
  },
  {
    id: '2',
    name: 'Yuki Tanaka',
    avatar: 'https://i.pravatar.cc/150?img=10',
    rating: 4.8,
    languages: { native: ['Japanese'], target: ['English'] },
    verified: true,
    sessionsCount: 256,
  },
  {
    id: '3',
    name: 'Pierre Dubois',
    avatar: 'https://i.pravatar.cc/150?img=8',
    rating: 4.7,
    languages: { native: ['French'], target: ['English'] },
    verified: false,
    sessionsCount: 198,
  },
];

// Generate time slots with available partners
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
      
      // Randomly assign available partners
      const availablePartners = mockPartners.filter(() => Math.random() > 0.3);
      const isBooked = Math.random() > 0.8;
      
      slots.push({
        id: `${day}-${hour}`,
        time,
        date: slotDate,
        status: isBooked ? 'confirmed' : 'available',
        availablePartners: isBooked ? [] : availablePartners,
        bookedWith: isBooked ? mockPartners[0] : undefined,
      });
    }
  }
  
  return slots;
};

export const IntegratedScheduler: React.FC<IntegratedSchedulerProps> = ({
  onBookSession,
  darkMode = false,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(new Date());
  const [expandedSlot, setExpandedSlot] = useState<string | null>(null);
  const [bookingSlot, setBookingSlot] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const monday = new Date(weekStart);
    const day = monday.getDay();
    const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
    monday.setDate(diff);
    setTimeSlots(generateTimeSlots(monday, 7));
  }, [weekStart]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const getDaySlots = (date: Date) => {
    return timeSlots.filter(slot => 
      slot.date.toDateString() === date.toDateString()
    );
  };

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const handleBooking = async (slot: TimeSlot, partner: Partner) => {
    setBookingSlot(slot.id);
    try {
      await onBookSession?.(slot, partner);
      // Update slot status
      setTimeSlots(prev => prev.map(s => 
        s.id === slot.id 
          ? { ...s, status: 'confirmed' as const, bookedWith: partner, availablePartners: [] }
          : s
      ));
      setExpandedSlot(null);
    } catch (error) {
      console.error('Booking failed:', error);
    }
    setBookingSlot(null);
  };

  const isPast = (date: Date) => date < new Date();

  const getSessionCount = (date: Date) => {
    const daySlots = getDaySlots(date);
    return daySlots.filter(s => s.status !== 'available').length;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        background: darkMode ? 'rgba(30, 30, 30, 0.5)' : 'white',
        border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}`,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: '14px' }}>
            Book a Session
          </Typography>
          <IconButton size="small" onClick={() => setSelectedDate(new Date())}>
            <Today sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>

        {/* Week Navigation */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <IconButton size="small" onClick={() => {
            const newWeek = new Date(weekStart);
            newWeek.setDate(newWeek.getDate() - 7);
            setWeekStart(newWeek);
          }}>
            <ChevronLeft sx={{ fontSize: 16 }} />
          </IconButton>
          <Typography variant="caption" fontWeight={600} sx={{ fontSize: '12px' }}>
            {formatDate(weekStart)} - {formatDate(new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000))}
          </Typography>
          <IconButton size="small" onClick={() => {
            const newWeek = new Date(weekStart);
            newWeek.setDate(newWeek.getDate() + 7);
            setWeekStart(newWeek);
          }}>
            <ChevronRight sx={{ fontSize: 16 }} />
          </IconButton>
        </Stack>

        {/* Day Selector */}
        <Stack direction="row" spacing={0.5}>
          {getWeekDays().map((date) => {
            const selected = date.toDateString() === selectedDate.toDateString();
            const hasSession = getSessionCount(date) > 0;
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <Box
                key={date.toDateString()}
                onClick={() => {
                  setSelectedDate(date);
                  setExpandedSlot(null);
                }}
                sx={{
                  flex: 1,
                  p: 1,
                  borderRadius: 1,
                  cursor: 'pointer',
                  textAlign: 'center',
                  backgroundColor: selected
                    ? '#6366f1'
                    : isToday
                      ? darkMode ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)'
                      : 'transparent',
                  color: selected ? '#fff' : 'inherit',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  '&:hover': {
                    backgroundColor: selected ? '#6366f1' : darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                  },
                }}
              >
                <Typography variant="caption" sx={{ fontSize: '10px', fontWeight: selected ? 600 : 500, display: 'block' }}>
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontSize: '14px', fontWeight: selected ? 700 : 600 }}>
                  {date.getDate()}
                </Typography>
                {hasSession && (
                  <Badge
                    badgeContent={getSessionCount(date)}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      '& .MuiBadge-badge': {
                        fontSize: '9px',
                        height: 14,
                        minWidth: 14,
                        backgroundColor: selected ? '#fff' : '#6366f1',
                        color: selected ? '#6366f1' : '#fff',
                      },
                    }}
                  />
                )}
              </Box>
            );
          })}
        </Stack>
      </Box>

      {/* Time Slots with Integrated Partner Selection */}
      <Box
        ref={scrollContainerRef}
        sx={{
          height: 400,
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-track': { backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', borderRadius: 3 },
        }}
      >
        <Box sx={{ p: 1.5 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDate.toDateString()}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Stack spacing={0.5}>
                {getDaySlots(selectedDate).map((slot, index) => {
                  const isPastSlot = slot.date < new Date();
                  const isExpanded = expandedSlot === slot.id;
                  const hasPartners = (slot.availablePartners?.length ?? 0) > 0;
                  
                  return (
                    <motion.div
                      key={slot.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <Box>
                        {/* Time Slot Row */}
                        <Box
                          onClick={() => {
                            if (!isPastSlot && hasPartners && slot.status === 'available') {
                              setExpandedSlot(isExpanded ? null : slot.id);
                            }
                          }}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: 1,
                            borderRadius: 1,
                            cursor: isPastSlot || !hasPartners ? 'default' : 'pointer',
                            opacity: isPastSlot ? 0.5 : 1,
                            backgroundColor: slot.status !== 'available'
                              ? darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'
                              : isExpanded
                                ? darkMode ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.08)'
                                : 'transparent',
                            border: `1px solid ${
                              isExpanded
                                ? '#6366f1'
                                : slot.status === 'available' && hasPartners && !isPastSlot
                                  ? darkMode ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)'
                                  : 'transparent'
                            }`,
                            borderStyle: slot.status === 'available' && hasPartners ? 'solid' : 'solid',
                            transition: 'all 0.2s ease',
                            '&:hover': !isPastSlot && hasPartners ? {
                              backgroundColor: darkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
                              borderColor: '#6366f1',
                            } : {},
                          }}
                        >
                          {/* Time */}
                          <Box sx={{ width: 50, flexShrink: 0 }}>
                            <Typography variant="caption" sx={{ fontSize: '11px', fontWeight: 500, color: 'text.secondary' }}>
                              {slot.time}
                            </Typography>
                          </Box>

                          {/* Content */}
                          {slot.status !== 'available' ? (
                            // Booked slot
                            <Box sx={{ flex: 1 }}>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Avatar src={slot.bookedWith?.avatar} sx={{ width: 24, height: 24 }}>
                                  {slot.bookedWith?.name.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography variant="caption" sx={{ fontSize: '12px', fontWeight: 600, display: 'block' }}>
                                    {slot.bookedWith?.name}
                                  </Typography>
                                  <Typography variant="caption" sx={{ fontSize: '10px', color: 'text.secondary' }}>
                                    {slot.bookedWith?.languages.native.join(', ')} session
                                  </Typography>
                                </Box>
                                <CheckCircle sx={{ fontSize: 16, color: '#22c55e', ml: 'auto' }} />
                              </Stack>
                            </Box>
                          ) : hasPartners ? (
                            // Available with partners
                            <Box sx={{ flex: 1 }}>
                              <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 20, height: 20, fontSize: '10px' } }}>
                                    {slot.availablePartners?.slice(0, 3).map(p => (
                                      <Avatar key={p.id} src={p.avatar}>{p.name.charAt(0)}</Avatar>
                                    ))}
                                  </AvatarGroup>
                                  <Typography variant="caption" sx={{ fontSize: '11px', color: '#6366f1', fontWeight: 600 }}>
                                    {slot.availablePartners?.length} available
                                  </Typography>
                                </Stack>
                                <ExpandMore 
                                  sx={{ 
                                    fontSize: 16, 
                                    color: '#6366f1',
                                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.2s ease',
                                  }} 
                                />
                              </Stack>
                            </Box>
                          ) : (
                            // No partners available
                            <Box sx={{ flex: 1, textAlign: 'center' }}>
                              <Typography variant="caption" sx={{ fontSize: '11px', color: 'text.secondary' }}>
                                No partners available
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        {/* Expanded Partner Selection */}
                        <Collapse in={isExpanded}>
                          <Box sx={{ pl: 6, pr: 1, pb: 1, pt: 0.5 }}>
                            <Stack spacing={0.5}>
                              {slot.availablePartners?.map((partner) => (
                                <motion.div
                                  key={partner.id}
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  whileHover={{ x: 2 }}
                                >
                                  <Paper
                                    sx={{
                                      p: 1.5,
                                      backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                                      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease',
                                      '&:hover': {
                                        borderColor: '#6366f1',
                                        backgroundColor: darkMode ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.04)',
                                      },
                                    }}
                                  >
                                    <Stack direction="row" alignItems="center" spacing={1.5}>
                                      <Avatar src={partner.avatar} sx={{ width: 32, height: 32 }}>
                                        {partner.name.charAt(0)}
                                      </Avatar>
                                      <Box sx={{ flex: 1 }}>
                                        <Stack direction="row" alignItems="center" spacing={0.5}>
                                          <Typography variant="caption" sx={{ fontSize: '12px', fontWeight: 600 }}>
                                            {partner.name}
                                          </Typography>
                                          {partner.verified && <Verified sx={{ fontSize: 12, color: '#6366f1' }} />}
                                        </Stack>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                          <Stack direction="row" alignItems="center" spacing={0.25}>
                                            <Star sx={{ fontSize: 12, color: '#f59e0b' }} />
                                            <Typography variant="caption" sx={{ fontSize: '10px' }}>
                                              {partner.rating}
                                            </Typography>
                                          </Stack>
                                          <Typography variant="caption" sx={{ fontSize: '10px', color: 'text.secondary' }}>
                                            {partner.languages.native.join(', ')} → {partner.languages.target.join(', ')}
                                          </Typography>
                                          <Typography variant="caption" sx={{ fontSize: '10px', color: 'text.secondary' }}>
                                            {partner.sessionsCount} sessions
                                          </Typography>
                                        </Stack>
                                      </Box>
                                      <Button
                                        size="small"
                                        variant="contained"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleBooking(slot, partner);
                                        }}
                                        disabled={bookingSlot === slot.id}
                                        sx={{
                                          minWidth: 60,
                                          height: 28,
                                          fontSize: '11px',
                                          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                          '&:hover': { background: 'linear-gradient(135deg, #5558d9 0%, #7c4ed8 100%)' },
                                        }}
                                      >
                                        {bookingSlot === slot.id ? (
                                          <CircularProgress size={14} sx={{ color: '#fff' }} />
                                        ) : (
                                          'Book'
                                        )}
                                      </Button>
                                    </Stack>
                                  </Paper>
                                </motion.div>
                              ))}
                            </Stack>
                          </Box>
                        </Collapse>
                      </Box>
                    </motion.div>
                  );
                })}
              </Stack>
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>
    </Paper>
  );
};