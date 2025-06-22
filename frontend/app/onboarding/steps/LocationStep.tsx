'use client'

import { useState } from 'react'
import { useAppDispatch } from '@/lib/hooks'
import { updateOnboardingStep } from '@/features/onboarding/onboardingSlice'
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  IconButton,
  useTheme,
} from '@mui/material'
import { 
  LocationOn as LocationIcon, 
  MyLocation as MyLocationIcon,
  ArrowBack as ArrowBackIcon 
} from '@mui/icons-material'
import { User } from '@/types/global'

interface LocationStepProps {
  user: User
  onNext: () => void
  onBack: () => void
}

export default function LocationStep({ user, onNext, onBack }: LocationStepProps) {
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const [city, setCity] = useState(user.city || '')
  const [country, setCountry] = useState(user.country || '')
  const [timezone, setTimezone] = useState(user.timezone || '')
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(
    user.latitude && user.longitude ? { lat: user.latitude, lng: user.longitude } : null
  )
  const [isLoading, setIsLoading] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const detectLocation = async () => {
    setIsDetecting(true)
    setError(null)

    try {
      // Get user's location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        })
      })

      const { latitude, longitude } = position.coords
      setCoordinates({ lat: latitude, lng: longitude })

      // Reverse geocode to get city and country
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        )
        
        if (response.ok) {
          const data = await response.json()
          if (data.city) setCity(data.city)
          if (data.countryName) setCountry(data.countryName)
        }
      } catch (geocodeError) {
        console.warn('Failed to reverse geocode:', geocodeError)
      }

      // Detect timezone
      try {
        const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        setTimezone(detectedTimezone)
      } catch (timezoneError) {
        console.warn('Failed to detect timezone:', timezoneError)
      }

    } catch (locationError) {
      setError('Unable to detect location. Please enter your details manually.')
    } finally {
      setIsDetecting(false)
    }
  }

  const handleContinue = async () => {
    if (!city.trim() || !country.trim()) {
      setError('Please enter your city and country.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Get token from cookies
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          city: city.trim(),
          country: country.trim(),
          timezone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          latitude: coordinates?.lat || null,
          longitude: coordinates?.lng || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update location')
      }

      // Update onboarding step using Redux (should be step 3)
      await dispatch(updateOnboardingStep(3))
      
      onNext()
    } catch (err) {
      setError('Failed to save location. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const canContinue = city.trim() && country.trim()

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Auto-detect section */}
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 1 }}>
              Auto-detect Location
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              We'll help you find language partners nearby
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<MyLocationIcon />}
            onClick={detectLocation}
            disabled={isDetecting}
            sx={{
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              '&:hover': {
                borderColor: theme.palette.primary.dark,
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(102, 126, 234, 0.1)',
              },
            }}
          >
            {isDetecting ? 'Detecting...' : 'Detect'}
          </Button>
        </Box>
      </Paper>

      {/* Manual input */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 4, 
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(45, 55, 72, 0.3)'
            : 'rgba(248, 250, 252, 0.8)',
          border: `1px solid ${theme.palette.mode === 'dark'
            ? 'rgba(74, 85, 104, 0.5)'
            : 'rgba(226, 232, 240, 0.8)'}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <LocationIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
            Your Location
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <Box>
            <TextField
              fullWidth
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g., New York"
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? theme.palette.background.paper 
                    : 'white',
                },
              }}
            />
          </Box>
          <Box>
            <TextField
              fullWidth
              label="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g., United States"
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? theme.palette.background.paper 
                    : 'white',
                },
              }}
            />
          </Box>
        </Box>

        {coordinates && (
          <Box 
            sx={{ 
              mt: 2, 
              p: 2, 
              backgroundColor: theme.palette.mode === 'dark'
                ? 'rgba(34, 197, 94, 0.1)'
                : 'rgba(34, 197, 94, 0.05)',
              border: `1px solid ${theme.palette.mode === 'dark'
                ? 'rgba(34, 197, 94, 0.3)'
                : 'rgba(34, 197, 94, 0.2)'}`,
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" sx={{ color: theme.palette.mode === 'dark' ? '#10b981' : '#059669', fontWeight: 500 }}>
              ✓ Location coordinates detected for better matching
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Benefits info */}
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
          🌍 Why we need your location:
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          • Find language partners in your area for in-person meetings<br/>
          • Match with people in compatible time zones<br/>
          • Discover local language exchange events and meetups
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