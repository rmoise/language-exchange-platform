'use client'

import { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  IconButton,
  Slider,
  FormControlLabel,
  Switch,
  Chip,
  Grid,
} from '@mui/material'
import { 
  Settings as SettingsIcon,
  ArrowBack as ArrowBackIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
} from '@mui/icons-material'
import { User } from '@/types/global'

interface PreferencesStepProps {
  user: User
  onNext: () => void
  onBack: () => void
}

export default function PreferencesStep({ user, onNext, onBack }: PreferencesStepProps) {
  const [maxDistance, setMaxDistance] = useState<number>(50) // km
  const [enableLocationMatching, setEnableLocationMatching] = useState(true)
  const [preferredMeetingTypes, setPreferredMeetingTypes] = useState<string[]>(['online', 'in-person'])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const meetingTypeOptions = [
    { value: 'online', label: 'Video Calls', icon: '💻' },
    { value: 'in-person', label: 'In-Person Meetings', icon: '☕' },
    { value: 'text', label: 'Text/Messages', icon: '💬' },
    { value: 'group', label: 'Group Sessions', icon: '👥' },
  ]

  const handleMeetingTypeToggle = (type: string) => {
    setPreferredMeetingTypes(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const handleContinue = async () => {
    if (preferredMeetingTypes.length === 0) {
      setError('Please select at least one preferred meeting type.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Save preferences (this would typically be a separate API endpoint)
      const preferences = {
        maxDistance: enableLocationMatching ? maxDistance : null,
        enableLocationMatching,
        preferredMeetingTypes,
      }

      // Get token from cookies
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]

      // For now, we'll save these as part of the user profile
      // In a real app, you might have a separate preferences table
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(preferences),
      })

      if (!response.ok) {
        throw new Error('Failed to update preferences')
      }

      // Update onboarding step
      const stepResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/onboarding-step`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ step: 4 }),
      })

      if (!stepResponse.ok) {
        console.warn('Failed to update onboarding step')
      }

      onNext()
    } catch (err) {
      setError('Failed to save preferences. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const canContinue = preferredMeetingTypes.length > 0

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={onBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Location Preferences */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          backgroundColor: 'rgba(102, 126, 234, 0.05)',
          border: '1px solid rgba(102, 126, 234, 0.1)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationIcon sx={{ color: '#667eea', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
            Location Preferences
          </Typography>
        </Box>
        
        <FormControlLabel
          control={
            <Switch
              checked={enableLocationMatching}
              onChange={(e) => setEnableLocationMatching(e.target.checked)}
              color="primary"
            />
          }
          label="Find partners near me"
          sx={{ mb: enableLocationMatching ? 3 : 0 }}
        />

        {enableLocationMatching && (
          <Box>
            <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
              Maximum distance: {maxDistance} km
            </Typography>
            <Slider
              value={maxDistance}
              onChange={(_, value) => setMaxDistance(value as number)}
              min={5}
              max={500}
              step={5}
              marks={[
                { value: 5, label: '5km' },
                { value: 50, label: '50km' },
                { value: 100, label: '100km' },
                { value: 500, label: '500km' },
              ]}
              sx={{
                color: '#667eea',
                '& .MuiSlider-thumb': {
                  backgroundColor: '#667eea',
                },
                '& .MuiSlider-track': {
                  backgroundColor: '#667eea',
                },
              }}
            />
          </Box>
        )}
      </Paper>

      {/* Meeting Type Preferences */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          backgroundColor: 'rgba(248, 250, 252, 0.8)',
          border: '1px solid rgba(226, 232, 240, 0.8)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PeopleIcon sx={{ color: '#667eea', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
            Preferred Meeting Types
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
          How would you like to practice languages with your partners?
        </Typography>
        
        <Grid container spacing={2}>
          {meetingTypeOptions.map((option) => (
            <Grid size={{ xs: 12, sm: 6 }} key={option.value}>
              <Box
                onClick={() => handleMeetingTypeToggle(option.value)}
                sx={{
                  p: 2,
                  border: '2px solid',
                  borderColor: preferredMeetingTypes.includes(option.value) 
                    ? '#667eea' 
                    : 'rgba(226, 232, 240, 0.8)',
                  borderRadius: 2,
                  backgroundColor: preferredMeetingTypes.includes(option.value) 
                    ? 'rgba(102, 126, 234, 0.05)' 
                    : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.05)',
                  },
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontSize: '1.5rem', 
                    mb: 1,
                    textAlign: 'center',
                  }}
                >
                  {option.icon}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: 500, 
                    color: '#1a1a1a',
                    textAlign: 'center',
                  }}
                >
                  {option.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {preferredMeetingTypes.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ color: '#667eea', fontWeight: 500, mb: 1 }}>
              Selected:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {preferredMeetingTypes.map((type) => {
                const option = meetingTypeOptions.find(o => o.value === type)
                return (
                  <Chip
                    key={type}
                    label={`${option?.icon} ${option?.label}`}
                    color="primary"
                    variant="filled"
                    sx={{ fontSize: '0.875rem' }}
                  />
                )
              })}
            </Box>
          </Box>
        )}
      </Paper>

      {/* Tips */}
      <Box 
        sx={{ 
          p: 3, 
          mb: 4, 
          backgroundColor: 'rgba(59, 130, 246, 0.05)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: 2,
        }}
      >
        <Typography variant="body2" sx={{ color: '#1d4ed8', fontWeight: 500, mb: 1 }}>
          💡 Tip:
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          You can always change these preferences later in your profile settings. 
          Having multiple meeting types selected will help you find more compatible partners!
        </Typography>
      </Box>

      {/* Navigation buttons */}
      <Grid container spacing={2}>
        <Grid size={6}>
          <Button
            fullWidth
            variant="outlined"
            onClick={onBack}
            sx={{
              py: 2,
              borderColor: '#d1d5db',
              color: '#6b7280',
            }}
          >
            Back
          </Button>
        </Grid>
        <Grid size={6}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleContinue}
            disabled={!canContinue || isLoading}
            sx={{
              py: 2,
              fontSize: '1rem',
              fontWeight: 600,
              backgroundColor: '#667eea',
              '&:hover': {
                backgroundColor: '#5a6fd8',
              },
            }}
          >
            {isLoading ? 'Saving...' : 'Continue'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  )
}