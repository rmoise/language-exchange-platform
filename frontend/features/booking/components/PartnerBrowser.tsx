"use client";

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Avatar,
  Chip,
  Grid,
  Paper,
  IconButton,
  Rating,
  Stack,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Search,
  Language,
  Schedule,
  Star,
  FilterList,
  CalendarMonth,
  Verified,
  FavoriteBorder,
  Favorite,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface Partner {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  languages: {
    native: string[];
    target: string[];
  };
  bio: string;
  hourlyRate?: number;
  availability: string;
  verified: boolean;
  responseTime: string;
  sessionsCompleted: number;
}

interface PartnerBrowserProps {
  onSelectPartner: (partner: Partner) => void;
  darkMode?: boolean;
}

const mockPartners: Partner[] = [
  {
    id: '1',
    name: 'Maria Garcia',
    avatar: 'https://i.pravatar.cc/150?img=5',
    rating: 4.9,
    reviewCount: 127,
    languages: {
      native: ['Spanish'],
      target: ['English'],
    },
    bio: 'Native Spanish speaker from Madrid. I love helping people improve their conversational skills!',
    hourlyRate: 0,
    availability: 'Available today',
    verified: true,
    responseTime: 'Responds in ~1 hour',
    sessionsCompleted: 342,
  },
  {
    id: '2',
    name: 'Yuki Tanaka',
    avatar: 'https://i.pravatar.cc/150?img=10',
    rating: 4.8,
    reviewCount: 89,
    languages: {
      native: ['Japanese'],
      target: ['English', 'Korean'],
    },
    bio: 'Professional Japanese teacher. Specialized in business Japanese and JLPT preparation.',
    availability: 'Available tomorrow',
    verified: true,
    responseTime: 'Responds in ~2 hours',
    sessionsCompleted: 256,
  },
  {
    id: '3',
    name: 'Pierre Dubois',
    avatar: 'https://i.pravatar.cc/150?img=8',
    rating: 4.7,
    reviewCount: 65,
    languages: {
      native: ['French'],
      target: ['English', 'Spanish'],
    },
    bio: 'French teacher with 5 years experience. I make learning fun and engaging!',
    availability: 'Available this week',
    verified: false,
    responseTime: 'Responds in ~30 min',
    sessionsCompleted: 198,
  },
];

export const PartnerBrowser: React.FC<PartnerBrowserProps> = ({
  onSelectPartner,
  darkMode = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const toggleFavorite = (partnerId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(partnerId)) {
        newFavorites.delete(partnerId);
      } else {
        newFavorites.add(partnerId);
      }
      return newFavorites;
    });
  };

  return (
    <Box>
      {/* Search and Filters */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search by name or language..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: darkMode
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.02)',
              },
            }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{
              borderRadius: 2,
              minWidth: 120,
              borderColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
            }}
          >
            Filters
          </Button>
        </Stack>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Box sx={{ p: 2, backgroundColor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={languageFilter}
                      onChange={(e) => setLanguageFilter(e.target.value)}
                      label="Language"
                    >
                      <MenuItem value="all">All Languages</MenuItem>
                      <MenuItem value="spanish">Spanish</MenuItem>
                      <MenuItem value="japanese">Japanese</MenuItem>
                      <MenuItem value="french">French</MenuItem>
                      <MenuItem value="german">German</MenuItem>
                      <MenuItem value="korean">Korean</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Availability</InputLabel>
                    <Select defaultValue="any">
                      <MenuItem value="any">Any time</MenuItem>
                      <MenuItem value="today">Available today</MenuItem>
                      <MenuItem value="week">This week</MenuItem>
                      <MenuItem value="weekend">Weekends</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </motion.div>
        )}
      </Box>

      {/* Partner Cards */}
      <Grid container spacing={3}>
        {mockPartners.map((partner, index) => (
          <Grid item xs={12} key={partner.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  background: darkMode
                    ? 'linear-gradient(135deg, rgba(30, 30, 30, 0.8) 0%, rgba(20, 20, 20, 0.8) 100%)'
                    : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#6366f1',
                    boxShadow: darkMode
                      ? '0 8px 32px rgba(99, 102, 241, 0.2)'
                      : '0 8px 32px rgba(99, 102, 241, 0.15)',
                  },
                }}
                onClick={() => onSelectPartner(partner)}
              >
                {/* Verified Badge */}
                {partner.verified && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      backgroundColor: '#6366f1',
                      color: '#fff',
                      px: 2,
                      py: 0.5,
                      borderRadius: '0 12px 0 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    <Verified sx={{ fontSize: 16 }} />
                    <Typography variant="caption" fontWeight={600}>
                      Verified
                    </Typography>
                  </Box>
                )}

                <Stack direction="row" spacing={3}>
                  {/* Avatar and Basic Info */}
                  <Box>
                    <Avatar
                      src={partner.avatar}
                      alt={partner.name}
                      sx={{
                        width: 80,
                        height: 80,
                        border: '3px solid',
                        borderColor: partner.verified ? '#6366f1' : 'transparent',
                      }}
                    >
                      {partner.name.charAt(0)}
                    </Avatar>
                  </Box>

                  {/* Main Content */}
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          {partner.name}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <Rating value={partner.rating} precision={0.1} readOnly size="small" />
                          <Typography variant="body2" color="text.secondary">
                            {partner.rating} ({partner.reviewCount} reviews)
                          </Typography>
                          <Chip
                            label={`${partner.sessionsCompleted} sessions`}
                            size="small"
                            sx={{
                              backgroundColor: darkMode
                                ? 'rgba(34, 197, 94, 0.2)'
                                : 'rgba(34, 197, 94, 0.1)',
                              color: '#22c55e',
                              fontSize: '11px',
                            }}
                          />
                        </Stack>
                      </Box>

                      {/* Favorite Button */}
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(partner.id);
                        }}
                        sx={{
                          color: favorites.has(partner.id) ? '#ef4444' : 'text.secondary',
                        }}
                      >
                        {favorites.has(partner.id) ? <Favorite /> : <FavoriteBorder />}
                      </IconButton>
                    </Stack>

                    {/* Languages */}
                    <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                      <Chip
                        icon={<Language sx={{ fontSize: 16 }} />}
                        label={`Native: ${partner.languages.native.join(', ')}`}
                        size="small"
                        sx={{
                          backgroundColor: darkMode
                            ? 'rgba(99, 102, 241, 0.2)'
                            : 'rgba(99, 102, 241, 0.1)',
                          color: '#6366f1',
                        }}
                      />
                      <Chip
                        icon={<Language sx={{ fontSize: 16 }} />}
                        label={`Learning: ${partner.languages.target.join(', ')}`}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                        }}
                      />
                    </Stack>

                    {/* Bio */}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {partner.bio}
                    </Typography>

                    {/* Bottom Info */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {partner.availability}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {partner.responseTime}
                          </Typography>
                        </Box>
                      </Stack>

                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<CalendarMonth />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPartner(partner);
                        }}
                        sx={{
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                          '&:hover': {
                            boxShadow: '0 6px 20px rgba(99, 102, 241, 0.35)',
                          },
                        }}
                      >
                        Book Session
                      </Button>
                    </Stack>
                  </Box>
                </Stack>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};