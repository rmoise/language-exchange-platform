'use client'

import { useState } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Grid,
  IconButton,
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

      // Update onboarding step
      const stepResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/onboarding-step`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ step: 2 }),
      })

      if (!stepResponse.ok) {
        console.warn('Failed to update onboarding step')
      }

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

      {/* Auto-detect section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          backgroundColor: 'rgba(102, 126, 234, 0.05)',
          border: '1px solid rgba(102, 126, 234, 0.1)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 1 }}>
              Auto-detect Location
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              We'll help you find language partners nearby
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<MyLocationIcon />}
            onClick={detectLocation}
            disabled={isDetecting}
            sx={{
              borderColor: '#667eea',
              color: '#667eea',
              '&:hover': {
                borderColor: '#5a6fd8',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
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
          backgroundColor: 'rgba(248, 250, 252, 0.8)',
          border: '1px solid rgba(226, 232, 240, 0.8)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <LocationIcon sx={{ color: '#667eea', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
            Your Location
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g., New York"
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g., United States"
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                },
              }}
            />
          </Grid>
        </Grid>

        {coordinates && (
          <Box 
            sx={{ 
              mt: 2, 
              p: 2, 
              backgroundColor: 'rgba(34, 197, 94, 0.05)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" sx={{ color: '#059669', fontWeight: 500 }}>
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
          backgroundColor: 'rgba(59, 130, 246, 0.05)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: 2,
        }}
      >
        <Typography variant="body2" sx={{ color: '#1d4ed8', fontWeight: 500, mb: 1 }}>
          🌍 Why we need your location:
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          • Find language partners in your area for in-person meetings<br/>
          • Match with people in compatible time zones<br/>
          • Discover local language exchange events and meetups
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