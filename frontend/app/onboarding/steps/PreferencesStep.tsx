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
  useTheme,
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
  const theme = useTheme()

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
        body: JSON.stringify({ step: 5 }),
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
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(139, 92, 246, 0.1)'
            : 'rgba(102, 126, 234, 0.05)',
          border: `1px solid ${theme.palette.mode === 'dark' 
            ? 'rgba(139, 92, 246, 0.3)'
            : 'rgba(102, 126, 234, 0.1)'}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
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
          <Box sx={{ px: 2, pt: 1 }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
              Maximum distance: <strong>{maxDistance} km</strong>
            </Typography>
            <Slider
              value={maxDistance}
              onChange={(_, value) => setMaxDistance(value as number)}
              valueLabelDisplay="auto"
              min={5}
              max={500}
              step={5}
              marks={[
                { value: 5, label: '5km' },
                { value: 100, label: '100km' },
                { value: 250, label: '250km' },
                { value: 500, label: '500km' },
              ]}
              sx={{
                color: theme.palette.primary.main,
                '& .MuiSlider-thumb': {
                  backgroundColor: theme.palette.primary.main,
                  width: 20,
                  height: 20,
                },
                '& .MuiSlider-track': {
                  backgroundColor: theme.palette.primary.main,
                  height: 6,
                },
                '& .MuiSlider-rail': {
                  height: 6,
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'rgba(0, 0, 0, 0.1)',
                },
                '& .MuiSlider-mark': {
                  backgroundColor: theme.palette.divider,
                  height: 10,
                  width: 2,
                  '&.MuiSlider-markActive': {
                    opacity: 1,
                    backgroundColor: 'currentColor',
                  },
                },
                '& .MuiSlider-markLabel': {
                  fontSize: '0.75rem',
                  color: theme.palette.text.secondary,
                  top: 34,
                },
                '& .MuiSlider-valueLabel': {
                  lineHeight: 1.2,
                  fontSize: 12,
                  background: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
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
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(45, 55, 72, 0.3)'
            : 'rgba(248, 250, 252, 0.8)',
          border: `1px solid ${theme.palette.mode === 'dark'
            ? 'rgba(74, 85, 104, 0.5)'
            : 'rgba(226, 232, 240, 0.8)'}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PeopleIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
            Preferred Meeting Types
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
          How would you like to practice languages with your partners?
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          {meetingTypeOptions.map((option) => (
            <Box key={option.value}>
              <Box
                onClick={() => handleMeetingTypeToggle(option.value)}
                sx={{
                  p: 2,
                  border: '2px solid',
                  borderColor: preferredMeetingTypes.includes(option.value) 
                    ? theme.palette.primary.main 
                    : theme.palette.mode === 'dark' ? 'rgba(74, 85, 104, 0.5)' : 'rgba(226, 232, 240, 0.8)',
                  borderRadius: 2,
                  backgroundColor: preferredMeetingTypes.includes(option.value) 
                    ? theme.palette.mode === 'dark' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(102, 126, 234, 0.05)' 
                    : theme.palette.background.paper,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(102, 126, 234, 0.05)',
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
                    color: theme.palette.text.primary,
                    textAlign: 'center',
                  }}
                >
                  {option.label}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {preferredMeetingTypes.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ color: theme.palette.primary.main, fontWeight: 500, mb: 1 }}>
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
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(59, 130, 246, 0.1)'
            : 'rgba(59, 130, 246, 0.05)',
          border: `1px solid ${theme.palette.mode === 'dark'
            ? 'rgba(59, 130, 246, 0.3)'
            : 'rgba(59, 130, 246, 0.2)'}`,
          borderRadius: 2,
        }}
      >
        <Typography variant="body2" sx={{ color: theme.palette.mode === 'dark' ? '#60a5fa' : '#1d4ed8', fontWeight: 500, mb: 1 }}>
          💡 Tip:
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          You can always change these preferences later in your profile settings. 
          Having multiple meeting types selected will help you find more compatible partners!
        </Typography>
      </Box>

      {/* Navigation buttons */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr' }, gap: 2 }}>
        <Box>
          <Button
            fullWidth
            variant="outlined"
            onClick={onBack}
            sx={{
              py: 2,
              borderColor: theme.palette.mode === 'dark' ? 'rgba(107, 114, 128, 0.5)' : '#d1d5db',
              color: theme.palette.text.secondary,
            }}
          >
            Back
          </Button>
        </Box>
        <Box>
          <Button
            fullWidth
            variant="contained"
            onClick={handleContinue}
            disabled={!canContinue || isLoading}
            sx={{
              py: 2,
              fontSize: '1rem',
              fontWeight: 600,
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            {isLoading ? 'Saving...' : 'Continue'}
          </Button>
        </Box>
      </Box>
    </Box>
  )
}