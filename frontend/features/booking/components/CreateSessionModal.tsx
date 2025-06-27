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
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

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
  }) => Promise<void>;
  darkMode?: boolean;
}

// Mock connections data
const mockConnections: Connection[] = [
  {
    id: '1',
    name: 'Maria Garcia',
    avatar: 'https://i.pravatar.cc/150?img=5',
    languages: { native: ['Spanish'], learning: ['English'] },
    status: 'online',
  },
  {
    id: '2',
    name: 'Yuki Tanaka',
    avatar: 'https://i.pravatar.cc/150?img=10',
    languages: { native: ['Japanese'], learning: ['English', 'Korean'] },
    status: 'online',
  },
  {
    id: '3',
    name: 'Pierre Dubois',
    avatar: 'https://i.pravatar.cc/150?img=8',
    languages: { native: ['French'], learning: ['English', 'Spanish'] },
    status: 'offline',
  },
  {
    id: '4',
    name: 'Li Wei',
    avatar: 'https://i.pravatar.cc/150?img=12',
    languages: { native: ['Mandarin'], learning: ['English'] },
    status: 'busy',
  },
];

export const CreateSessionModal: React.FC<CreateSessionModalProps> = ({
  open,
  onClose,
  selectedDate,
  selectedTime,
  onCreateSession,
  darkMode = false,
}) => {
  const [sessionType, setSessionType] = useState<'one-on-one' | 'group'>('one-on-one');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedConnections, setSelectedConnections] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredConnections = mockConnections.filter(conn =>
    conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conn.languages.native.some(lang => lang.toLowerCase().includes(searchQuery.toLowerCase())) ||
    conn.languages.learning.some(lang => lang.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleConnectionToggle = (connectionId: string) => {
    if (sessionType === 'one-on-one' && selectedConnections.length > 0 && !selectedConnections.includes(connectionId)) {
      setSelectedConnections([connectionId]);
    } else {
      setSelectedConnections(prev =>
        prev.includes(connectionId)
          ? prev.filter(id => id !== connectionId)
          : [...prev, connectionId]
      );
    }
  };

  const handleCreate = async () => {
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
        date: selectedDate,
        time: selectedTime,
        type: sessionType,
        language: selectedLanguage,
        invitedConnections: selectedConnections,
        description,
      });
      onClose();
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
        {/* Date and Time Display */}
        <Box
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
            backgroundColor: darkMode
              ? 'rgba(99, 102, 241, 0.1)'
              : 'rgba(99, 102, 241, 0.08)',
            border: `1px solid ${darkMode ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.15)'}`,
          }}
        >
          <Stack direction="row" spacing={3} alignItems="center">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday sx={{ fontSize: 20, color: '#6366f1' }} />
              <Typography variant="body2" fontWeight={600}>
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTime sx={{ fontSize: 20, color: '#6366f1' }} />
              <Typography variant="body2" fontWeight={600}>
                {selectedTime}
              </Typography>
            </Box>
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
            onChange={(e, value) => value && setSessionType(value)}
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
              startAdornment={<Language sx={{ mr: 1, color: 'text.secondary' }} />}
            >
              <MenuItem value="english">English</MenuItem>
              <MenuItem value="spanish">Spanish</MenuItem>
              <MenuItem value="french">French</MenuItem>
              <MenuItem value="japanese">Japanese</MenuItem>
              <MenuItem value="mandarin">Mandarin</MenuItem>
              <MenuItem value="korean">Korean</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Invite Connections */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
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
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ mb: 2 }}
          />

          {/* Connections List */}
          <List sx={{ maxHeight: 200, overflow: 'auto' }}>
            {filteredConnections.map((connection) => {
              const isSelected = selectedConnections.includes(connection.id);
              const isDisabled = sessionType === 'one-on-one' && 
                selectedConnections.length > 0 && 
                !selectedConnections.includes(connection.id);

              return (
                <ListItem
                  key={connection.id}
                  onClick={() => handleConnectionToggle(connection.id)}
                  disabled={isDisabled}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
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
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            backgroundColor: getStatusColor(connection.status),
                            border: `2px solid ${darkMode ? '#0f0f0f' : '#fff'}`,
                          }}
                        />
                      }
                    >
                      <Avatar src={connection.avatar}>
                        {connection.name.charAt(0)}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {connection.name}
                    </Typography>
                    <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                      <Chip
                        label={`Native: ${connection.languages.native.join(', ')}`}
                        size="small"
                        sx={{ fontSize: '10px', height: 20 }}
                      />
                      <Chip
                        label={`Learning: ${connection.languages.learning.join(', ')}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '10px', height: 20 }}
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
            })}
          </List>

          {selectedConnections.length > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {selectedConnections.length} connection{selectedConnections.length > 1 ? 's' : ''} selected
            </Typography>
          )}
        </Box>

        {/* Description (Optional) */}
        <Box sx={{ mt: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Session Topic (Optional)"
            placeholder="What would you like to practice or discuss?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Box>

        {/* Video Call Info */}
        <Alert
          severity="info"
          icon={<VideoCall />}
          sx={{
            mt: 3,
            borderRadius: 2,
            backgroundColor: darkMode
              ? 'rgba(33, 150, 243, 0.1)'
              : 'rgba(33, 150, 243, 0.05)',
          }}
        >
          A video call link will be automatically created and shared with invited connections
        </Alert>

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
          disabled={isCreating || selectedConnections.length === 0}
          sx={{
            borderRadius: 2,
            minWidth: 120,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5558d9 0%, #7c4ed8 100%)',
            },
            '&.Mui-disabled': {
              background: darkMode 
                ? 'rgba(255, 255, 255, 0.12)' 
                : 'rgba(0, 0, 0, 0.12)',
              color: darkMode 
                ? 'rgba(255, 255, 255, 0.3)' 
                : 'rgba(0, 0, 0, 0.26)',
              border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
            },
          }}
        >
          {isCreating ? 'Creating...' : 'Create Session'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};