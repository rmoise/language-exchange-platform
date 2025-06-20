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
  Chip,
  Avatar,
} from '@mui/material'
import { 
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
} from '@mui/icons-material'
import { User } from '@/types/global'

interface ProfileStepProps {
  user: User
  onNext: () => void
  onBack: () => void
}

const COMMON_INTERESTS = [
  'Travel', 'Movies', 'Music', 'Books', 'Sports', 'Cooking', 'Photography',
  'Art', 'Technology', 'Gaming', 'Fitness', 'Nature', 'Culture', 'Food',
  'Dancing', 'Writing', 'Learning', 'Business', 'Science', 'History'
]

export default function ProfileStep({ user, onNext, onBack }: ProfileStepProps) {
  const [bio, setBio] = useState(user.bio || '')
  const [interests, setInterests] = useState<string[]>(user.interests || [])
  const [customInterest, setCustomInterest] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInterestToggle = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    )
  }

  const handleAddCustomInterest = () => {
    const trimmed = customInterest.trim()
    if (trimmed && !interests.includes(trimmed)) {
      setInterests(prev => [...prev, trimmed])
      setCustomInterest('')
    }
  }

  const handleRemoveInterest = (interest: string) => {
    setInterests(prev => prev.filter(i => i !== interest))
  }

  const handleContinue = async () => {
    if (!bio.trim()) {
      setError('Please write a short bio to help others get to know you.')
      return
    }

    if (interests.length === 0) {
      setError('Please select at least one interest.')
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
          bio: bio.trim(),
          interests: interests,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      // Update onboarding step
      const stepResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/onboarding-step`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ step: 3 }),
      })

      if (!stepResponse.ok) {
        console.warn('Failed to update onboarding step')
      }

      onNext()
    } catch (err) {
      setError('Failed to save profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const canContinue = bio.trim() && interests.length > 0

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

      {/* Profile Preview */}
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
          <Avatar 
            src={user.profileImage}
            sx={{ 
              width: 56, 
              height: 56, 
              mr: 2,
              backgroundColor: '#667eea',
              fontSize: '1.5rem',
              fontWeight: 600,
            }}
          >
            {user.name?.charAt(0) || 'U'}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
              {user.name}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              {user.city && user.country ? `${user.city}, ${user.country}` : 'Location not set'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Bio Section */}
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
          <PersonIcon sx={{ color: '#667eea', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
            About You
          </Typography>
        </Box>
        
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Write a short bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell potential language partners about yourself, your interests, and why you want to learn languages..."
          variant="outlined"
          inputProps={{ maxLength: 500 }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
            },
          }}
        />
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#666', 
            mt: 1, 
            textAlign: 'right' 
          }}
        >
          {bio.length}/500 characters
        </Typography>
      </Paper>

      {/* Interests Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 4, 
          backgroundColor: 'rgba(248, 250, 252, 0.8)',
          border: '1px solid rgba(226, 232, 240, 0.8)'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 2 }}>
          Your Interests
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
          Select interests to help find compatible language partners with similar hobbies.
        </Typography>
        
        {/* Selected Interests */}
        {interests.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ color: '#667eea', fontWeight: 500, mb: 1 }}>
              Selected ({interests.length}):
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {interests.map((interest) => (
                <Chip
                  key={interest}
                  label={interest}
                  onDelete={() => handleRemoveInterest(interest)}
                  color="primary"
                  variant="filled"
                  sx={{ fontSize: '0.875rem' }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Common Interests */}
        <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
          Choose from popular interests:
        </Typography>
        <Grid container spacing={1} sx={{ mb: 3 }}>
          {COMMON_INTERESTS.map((interest) => (
            <Grid item key={interest}>
              <Chip
                label={interest}
                onClick={() => handleInterestToggle(interest)}
                color={interests.includes(interest) ? 'primary' : 'default'}
                variant={interests.includes(interest) ? 'filled' : 'outlined'}
                sx={{
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: interests.includes(interest) 
                      ? '#5a6fd8' 
                      : 'rgba(102, 126, 234, 0.1)',
                  },
                }}
              />
            </Grid>
          ))}
        </Grid>

        {/* Custom Interest Input */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Add custom interest"
            value={customInterest}
            onChange={(e) => setCustomInterest(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCustomInterest()}
            sx={{
              flexGrow: 1,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
              },
            }}
          />
          <Button
            variant="outlined"
            onClick={handleAddCustomInterest}
            disabled={!customInterest.trim() || interests.includes(customInterest.trim())}
            sx={{
              minWidth: 'auto',
              px: 2,
              borderColor: '#667eea',
              color: '#667eea',
            }}
          >
            <AddIcon />
          </Button>
        </Box>
      </Paper>

      {/* Navigation buttons */}
      <Grid container spacing={2}>
        <Grid item xs={6}>
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
        <Grid item xs={6}>
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