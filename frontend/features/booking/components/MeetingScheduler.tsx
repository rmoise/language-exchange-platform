"use client";

import React, { useState } from 'react';
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
  Select,
  MenuItem,
  FormControl,
  Tab,
  Tabs,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Add,
  MoreHoriz,
  CalendarMonth,
  AccessTime,
  Person,
  Group,
  Videocam,
  Language,
  CheckCircle,
  Circle,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface TimeSlot {
  id: string;
  time: string;
  title: string;
  participants: {
    id: string;
    name: string;
    avatar?: string;
    type: 'native' | 'learner';
  }[];
  status: 'confirmed' | 'pending' | 'available';
  sessionType: 'one-on-one' | 'group';
  languages?: {
    native: string;
    learning: string;
  };
}

interface MeetingSchedulerProps {
  selectedDate: Date;
  onAddSession?: () => void;
  onSlotClick?: (slot: TimeSlot) => void;
  darkMode?: boolean;
}

const mockTimeSlots: TimeSlot[] = [
  {
    id: '1',
    time: '13:00',
    title: 'Spanish Conversation',
    participants: [
      { id: '1', name: 'Maria', avatar: 'https://i.pravatar.cc/150?img=5', type: 'native' },
      { id: '2', name: 'John', avatar: 'https://i.pravatar.cc/150?img=8', type: 'learner' },
      { id: '3', name: 'Lisa', avatar: 'https://i.pravatar.cc/150?img=9', type: 'learner' },
    ],
    status: 'confirmed',
    sessionType: 'group',
    languages: {
      native: 'Spanish',
      learning: 'English',
    },
  },
  {
    id: '2',
    time: '14:00',
    title: 'Available for booking',
    participants: [],
    status: 'available',
    sessionType: 'one-on-one',
  },
  {
    id: '3',
    time: '15:00',
    title: 'Japanese Practice',
    participants: [
      { id: '4', name: 'Yuki', avatar: 'https://i.pravatar.cc/150?img=10', type: 'native' },
      { id: '5', name: 'Alex', type: 'learner' },
    ],
    status: 'pending',
    sessionType: 'one-on-one',
    languages: {
      native: 'Japanese',
      learning: 'English',
    },
  },
  {
    id: '4',
    time: '16:00',
    title: 'French Group Session',
    participants: [
      { id: '6', name: 'Pierre', avatar: 'https://i.pravatar.cc/150?img=11', type: 'native' },
      { id: '7', name: 'Emma', avatar: 'https://i.pravatar.cc/150?img=12', type: 'learner' },
    ],
    status: 'confirmed',
    sessionType: 'group',
    languages: {
      native: 'French',
      learning: 'English',
    },
  },
];

export const MeetingScheduler: React.FC<MeetingSchedulerProps> = ({
  selectedDate,
  onAddSession,
  onSlotClick,
  darkMode = false,
}) => {
  const [view, setView] = useState<'day' | 'week' | 'month'>('day');
  const [filter, setFilter] = useState('all');

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#22c55e';
      case 'pending':
        return '#f59e0b';
      case 'available':
        return '#6366f1';
      default:
        return '#94a3b8';
    }
  };

  const getParticipantColors = (type: string) => {
    return type === 'native' 
      ? { bg: 'rgba(99, 102, 241, 0.1)', border: '#6366f1' }
      : { bg: 'rgba(34, 197, 94, 0.1)', border: '#22c55e' };
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        background: darkMode
          ? 'rgba(30, 30, 30, 0.5)'
          : 'white',
        border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: '14px' }}>
            {formatDate(selectedDate)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Meeting Scheduler
          </Typography>
        </Box>
        
        <IconButton
          onClick={onAddSession}
          size="small"
          sx={{
            backgroundColor: '#6366f1',
            color: '#fff',
            width: 32,
            height: 32,
            '&:hover': {
              backgroundColor: '#5558d9',
              transform: 'scale(1.05)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <Add sx={{ fontSize: 18 }} />
        </IconButton>
      </Stack>

      {/* View Tabs */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Tabs
          value={view}
          onChange={(e, v) => setView(v)}
          sx={{
            minHeight: 28,
            '& .MuiTab-root': {
              minHeight: 28,
              py: 0.5,
              px: 1.5,
              textTransform: 'capitalize',
              fontSize: '12px',
              fontWeight: 500,
              minWidth: 50,
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#6366f1',
              height: 2,
            },
          }}
        >
          <Tab label="Day" value="day" />
          <Tab label="Week" value="week" />
          <Tab label="Month" value="month" />
        </Tabs>

        <FormControl size="small" sx={{ minWidth: 90 }}>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{
              fontSize: '12px',
              height: 28,
              '& .MuiSelect-select': {
                py: 0.5,
                px: 1,
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              },
            }}
          >
            <MenuItem value="all" sx={{ fontSize: '12px' }}>All</MenuItem>
            <MenuItem value="confirmed" sx={{ fontSize: '12px' }}>Confirmed</MenuItem>
            <MenuItem value="pending" sx={{ fontSize: '12px' }}>Pending</MenuItem>
            <MenuItem value="available" sx={{ fontSize: '12px' }}>Available</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Time Slots */}
      <Box sx={{ position: 'relative' }}>
        {/* Time Grid Lines */}
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            pointerEvents: 'none',
          }}
        >
          {mockTimeSlots.map((_, index) => (
            <Box
              key={index}
              sx={{
                position: 'absolute',
                left: 40,
                right: 0,
                top: index * 68,
                height: 1,
                backgroundColor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
              }}
            />
          ))}
        </Box>

        {/* Slots */}
        <Stack spacing={1}>
          {mockTimeSlots.map((slot, index) => (
            <motion.div
              key={slot.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Box sx={{ display: 'flex', gap: 1, position: 'relative' }}>
                {/* Time */}
                <Box sx={{ width: 40, flexShrink: 0 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 500,
                      fontSize: '11px',
                    }}
                  >
                    {slot.time}
                  </Typography>
                </Box>

                {/* Slot Content */}
                <Box
                  onClick={() => onSlotClick?.(slot)}
                  sx={{
                    flex: 1,
                    p: 1.5,
                    borderRadius: 1.5,
                    cursor: 'pointer',
                    position: 'relative',
                    minHeight: 60,
                    backgroundColor: slot.status === 'available'
                      ? darkMode
                        ? 'rgba(99, 102, 241, 0.1)'
                        : 'rgba(99, 102, 241, 0.05)'
                      : darkMode
                        ? 'rgba(255, 255, 255, 0.03)'
                        : 'rgba(0, 0, 0, 0.02)',
                    border: `1px ${slot.status === 'available' ? 'dashed' : 'solid'}`,
                    borderColor: slot.status === 'available'
                      ? '#6366f1'
                      : darkMode
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(0,0,0,0.08)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateX(2px)',
                      borderColor: '#6366f1',
                      backgroundColor: darkMode
                        ? 'rgba(99, 102, 241, 0.15)'
                        : 'rgba(99, 102, 241, 0.08)',
                    },
                  }}
                >
                  {/* Status Indicator */}
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 3,
                      backgroundColor: getStatusColor(slot.status),
                      borderRadius: '1.5px 0 0 1.5px',
                    }}
                  />

                  {slot.status === 'available' ? (
                    // Available Slot
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      gap: 0.5,
                    }}>
                      <Add sx={{ color: '#6366f1', fontSize: 20 }} />
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#6366f1',
                          fontWeight: 600,
                          fontSize: '11px',
                        }}
                      >
                        Available
                      </Typography>
                    </Box>
                  ) : (
                    // Booked Slot
                    <>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" fontWeight={600} sx={{ fontSize: '12px', display: 'block' }}>
                            {slot.title}
                          </Typography>
                          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                            <AvatarGroup 
                              max={3} 
                              sx={{ 
                                '& .MuiAvatar-root': { 
                                  width: 20, 
                                  height: 20, 
                                  fontSize: '10px',
                                  borderWidth: 1,
                                } 
                              }}
                            >
                              {slot.participants.map((p) => (
                                <Avatar key={p.id} src={p.avatar} alt={p.name}>
                                  {p.name.charAt(0)}
                                </Avatar>
                              ))}
                            </AvatarGroup>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px', ml: 0.5 }}>
                              {slot.participants.filter(p => p.type === 'native').length} native, 
                              {slot.participants.filter(p => p.type === 'learner').length} learner
                            </Typography>
                          </Stack>
                        </Box>

                        <Stack direction="row" spacing={0.5} alignItems="center">
                          {slot.sessionType === 'group' ? (
                            <Group sx={{ fontSize: 14, color: 'text.secondary' }} />
                          ) : (
                            <Person sx={{ fontSize: 14, color: 'text.secondary' }} />
                          )}
                          {slot.status === 'pending' && (
                            <Circle sx={{ fontSize: 8, color: getStatusColor(slot.status) }} />
                          )}
                        </Stack>
                      </Stack>
                    </>
                  )}
                </Box>

              </Box>
            </motion.div>
          ))}
        </Stack>
      </Box>
    </Paper>
  );
};