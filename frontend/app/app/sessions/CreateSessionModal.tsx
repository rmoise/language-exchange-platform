"use client";

import React, { useState, useEffect } from 'react';
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
  Stack,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Badge,
  Paper,
  Grid,
} from '@mui/material';
import {
  Close,
  CalendarToday,
  AccessTime,
  Language,
  People,
  Person,
  VideoCall,
  Add,
  Search,
  CheckCircle,
  Draw,
  Chat,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { MatchService, Match } from '@/features/matches/matchService';

interface Connection {
  id: string;
  name: string;
  avatar?: string;
  languages: {
    native: string[];
    learning: string[];
  };
  status: 'online' | 'offline' | 'busy';
}

interface CreateSessionModalProps {
  open: boolean;
  onClose: () => void;
  selectedDate: Date;
  selectedTime: string;
  onCreateSession: (session: {
    date: Date;
    time: string;
    type: 'one-on-one' | 'group';
    language: string;
    invitedConnections: string[];
    description: string;
    name: string;
  }) => Promise<void>;
  darkMode?: boolean;
}


const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 
  'Russian', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi'
];

export const CreateSessionModal: React.FC<CreateSessionModalProps> = ({
  open,
  onClose,
  selectedDate: initialDate,
  selectedTime: initialTime,
  onCreateSession,
  darkMode = false,
}) => {
  const [sessionType, setSessionType] = useState<'one-on-one' | 'group'>('one-on-one');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedConnections, setSelectedConnections] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedTime, setSelectedTime] = useState(initialTime);

  // Convert matches to connections format
  const connections: Connection[] = matches.map(match => {
    // Assuming we're showing the other user (not the current user)
    const otherUser = match.user1; // In real app, determine which user is the other one
    return {
      id: otherUser.id,
      name: otherUser.name,
      avatar: otherUser.profilePhotoUrl || undefined,
      languages: {
        native: otherUser.nativeLanguages || [],
        learning: otherUser.targetLanguages || [],
      },
      status: 'online' as const, // You could add real status tracking
    };
  });

  useEffect(() => {
    if (open) {
      loadMatches();
      // Set default time if not provided
      if (!selectedTime) {
        const now = new Date();
        const nextHour = new Date(now.setHours(now.getHours() + 1, 0, 0, 0));
        // selectedTime should be set by parent component
      }
    }
  }, [open]);

  const loadMatches = async () => {
    setLoadingMatches(true);
    try {
      const userMatches = await MatchService.getMatches();
      setMatches(Array.isArray(userMatches) ? userMatches : []);
    } catch (error) {
      console.error('Failed to load matches:', error);
      setMatches([]);
    } finally {
      setLoadingMatches(false);
    }
  };

  const filteredConnections = connections.filter(conn =>
    conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conn.languages.native.some(lang => lang.toLowerCase().includes(searchQuery.toLowerCase())) ||
    conn.languages.learning.some(lang => lang.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleConnectionToggle = (connectionId: string) => {
    if (sessionType === 'one-on-one' && selectedConnections.length > 0 && !selectedConnections.includes(connectionId)) {
      setSelectedConnections([connectionId]);
    } else if (sessionType === 'group') {
      setSelectedConnections(prev => {
        if (prev.includes(connectionId)) {
          return prev.filter(id => id !== connectionId);
        } else if (prev.length < 3) { // Max 3 connections for group (4 people total including user)
          return [...prev, connectionId];
        }
        return prev;
      });
    } else {
      setSelectedConnections(prev =>
        prev.includes(connectionId)
          ? prev.filter(id => id !== connectionId)
          : [...prev, connectionId]
      );
    }
  };

  const handleCreate = async () => {
    if (!sessionName.trim()) {
      setError('Please enter a session name');
      return;
    }
    if (!selectedLanguage) {
      setError('Please select a language for the session');
      return;
    }
    if (selectedConnections.length === 0) {
      setError('Please invite at least one connection');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      await onCreateSession({
        name: sessionName,
        date: selectedDate,
        time: selectedTime,
        type: sessionType,
        language: selectedLanguage,
        invitedConnections: selectedConnections,
        description,
      });
      onClose();
      // Reset form
      setSessionName('');
      setDescription('');
      setSelectedConnections([]);
      setSelectedLanguage('');
      setSessionType('one-on-one');
    } catch (err) {
      setError('Failed to create session. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#22c55e';
      case 'busy': return '#f59e0b';
      case 'offline': return '#94a3b8';
      default: return '#94a3b8';
    }
  };


  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: darkMode
            ? 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        },
      }}
    >
      <DialogTitle sx={{ p: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={700}>
            Create Language Session
          </Typography>
          <IconButton onClick={onClose} disabled={isCreating}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 0 }}>
        {/* Session Name */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Session Name"
            placeholder="e.g., Spanish Conversation Practice"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
              },
            }}
          />
        </Box>

        {/* Date and Time Selection */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Date"
              type="date"
              value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                min: new Date().toISOString().split('T')[0], // Disable past dates
              }}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                },
              }}
            />
            <TextField
              label="Time"
              type="time"
              value={selectedTime ? selectedTime.replace(' AM', '').replace(' PM', '') : ''}
              onChange={(e) => {
                const [hours, minutes] = e.target.value.split(':');
                const hour = parseInt(hours);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                setSelectedTime(`${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`);
              }}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                step: 1800, // 30 minute intervals
              }}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                },
              }}
            />
          </Stack>
        </Box>

        {/* Session Type */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
            Session Type
          </Typography>
          <ToggleButtonGroup
            value={sessionType}
            exclusive
            onChange={(e, value) => {
              if (value) {
                setSessionType(value);
                // Clear selections when changing type
                setSelectedConnections([]);
              }
            }}
            fullWidth
            sx={{
              '& .MuiToggleButton-root': {
                py: 1.5,
                textTransform: 'none',
                fontWeight: 500,
                '&.Mui-selected': {
                  backgroundColor: '#6366f1',
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: '#5558d9',
                  },
                },
              },
            }}
          >
            <ToggleButton value="one-on-one">
              <Person sx={{ mr: 1 }} />
              One-on-One
            </ToggleButton>
            <ToggleButton value="group">
              <People sx={{ mr: 1 }} />
              Group (2-4 people)
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Language Selection */}
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Session Language</InputLabel>
            <Select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              label="Session Language"
              startAdornment={<Language sx={{ mr: 1, ml: 1, color: 'text.secondary' }} />}
            >
              {LANGUAGES.map((language) => (
                <MenuItem key={language} value={language}>
                  {language}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Description */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Session Topic (Optional)"
            placeholder="What would you like to practice or discuss?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
              },
            }}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Invite Connections */}
        <Box>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Invite Connections
          </Typography>
          
          {/* Search */}
          <TextField
            fullWidth
            size="small"
            placeholder="Search connections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, ml: 1, color: 'text.secondary' }} />,
            }}
            sx={{ mb: 2 }}
          />

          {/* Connections List */}
          <List sx={{ maxHeight: 200, overflow: 'auto' }}>
            {loadingMatches ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Loading your connections...
                </Typography>
              </Box>
            ) : filteredConnections.length > 0 ? (
              filteredConnections.map((connection) => {
                const isSelected = selectedConnections.includes(connection.id);
                const isDisabled = (sessionType === 'one-on-one' && 
                  selectedConnections.length > 0 && 
                  !selectedConnections.includes(connection.id)) ||
                  (sessionType === 'group' && 
                  selectedConnections.length >= 3 && 
                  !selectedConnections.includes(connection.id));

                return (
                  <ListItem
                    key={connection.id}
                    onClick={() => handleConnectionToggle(connection.id)}
                    disabled={isDisabled}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      backgroundColor: isSelected
                        ? darkMode
                          ? 'rgba(99, 102, 241, 0.15)'
                          : 'rgba(99, 102, 241, 0.08)'
                        : 'transparent',
                      '&:hover': {
                        backgroundColor: darkMode
                          ? 'rgba(255, 255, 255, 0.05)'
                          : 'rgba(0, 0, 0, 0.05)',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: getStatusColor(connection.status),
                              border: `2px solid ${darkMode ? '#0f0f0f' : '#fff'}`,
                            }}
                          />
                        }
                      >
                        <Avatar src={connection.avatar} sx={{ width: 44, height: 44 }}>
                          {connection.name.charAt(0)}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {connection.name}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                        <Chip
                          label={`Native: ${connection.languages.native.join(', ')}`}
                          size="small"
                          sx={{ fontSize: '11px', height: 22 }}
                        />
                        <Chip
                          label={`Learning: ${connection.languages.learning.join(', ')}`}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '11px', height: 22 }}
                        />
                      </Stack>
                    </Box>
                    <ListItemSecondaryAction>
                      <Checkbox
                        checked={isSelected}
                        disabled={isDisabled}
                        sx={{
                          color: '#6366f1',
                          '&.Mui-checked': {
                            color: '#6366f1',
                          },
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  {connections.length === 0 
                    ? 'No connections found. Find language partners in the search page first.'
                    : 'No connections match your search.'}
                </Typography>
              </Box>
            )}
          </List>

          {selectedConnections.length > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {selectedConnections.length} connection{selectedConnections.length > 1 ? 's' : ''} selected
              {sessionType === 'group' && ` (up to ${4 - selectedConnections.length} more can be added)`}
            </Typography>
          )}
        </Box>

        {/* Session Features */}
        <Box sx={{ 
          mt: 3,
          backgroundColor: darkMode
            ? 'rgba(99, 102, 241, 0.1)'
            : 'rgba(99, 102, 241, 0.05)',
          border: `1px solid ${darkMode ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.15)'}`,
          borderRadius: 2, 
          p: 2 
        }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
            Session Features:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip 
              icon={<Draw sx={{ fontSize: 16 }} />}
              label="Interactive Whiteboard" 
              size="small" 
              sx={{ backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }} 
            />
            <Chip 
              icon={<Chat sx={{ fontSize: 16 }} />}
              label="Real-time Chat" 
              size="small" 
              sx={{ backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }} 
            />
            <Chip 
              icon={<VideoCall sx={{ fontSize: 16 }} />}
              label="Video Call Ready" 
              size="small" 
              sx={{ backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }} 
            />
          </Stack>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} disabled={isCreating} sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={isCreating || !sessionName.trim() || selectedConnections.length === 0 || !selectedLanguage}
          sx={{
            borderRadius: 2,
            minWidth: 120,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5558d9 0%, #7c4ed8 100%)',
            },
          }}
        >
          {isCreating ? 'Creating...' : 'Create Session'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};