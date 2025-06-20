'use client'

import { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Paper,
  Avatar,
  Chip,
  Grid,
} from '@mui/material'
import { 
  CheckCircle as CheckCircleIcon,
  Language as LanguageIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Search as SearchIcon,
} from '@mui/icons-material'
import { User } from '@/types/global'

interface CompleteStepProps {
  user: User
  onNext: () => void
}

export default function CompleteStep({ user, onNext }: CompleteStepProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleStartMatching = async () => {
    setIsLoading(true)
    
    try {
      // Get token from cookies
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]

      // Update onboarding step to complete
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

      // Small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onNext()
    } catch (err) {
      console.error('Failed to complete onboarding:', err)
      // Still proceed to next step even if API call fails
      onNext()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box sx={{ textAlign: 'center' }}>
      {/* Success Icon */}
      <Box sx={{ mb: 4 }}>
        <CheckCircleIcon 
          sx={{ 
            fontSize: 80, 
            color: '#22c55e',
            mb: 2,
          }} 
        />
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 600, 
            color: '#1a1a1a',
            mb: 1,
          }}
        >
          Welcome to Language Exchange!
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#666',
            fontSize: '1.1rem',
          }}
        >
          Your profile is complete and you're ready to start finding language partners!
        </Typography>
      </Box>

      {/* Profile Summary */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 4, 
          backgroundColor: 'rgba(102, 126, 234, 0.05)',
          border: '1px solid rgba(102, 126, 234, 0.1)',
          textAlign: 'left',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar 
            src={user.profileImage}
            sx={{ 
              width: 64, 
              height: 64, 
              mr: 2,
              backgroundColor: '#667eea',
              fontSize: '1.75rem',
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
              {user.city && user.country ? `${user.city}, ${user.country}` : 'Global'}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LanguageIcon sx={{ color: '#667eea', mr: 1, fontSize: 20 }} />
              <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a1a' }}>
                Native Languages
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
              {user.nativeLanguages?.map((lang) => (
                <Chip 
                  key={lang}
                  label={lang} 
                  size="small" 
                  color="primary"
                  variant="filled"
                />
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LanguageIcon sx={{ color: '#764ba2', mr: 1, fontSize: 20 }} />
              <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a1a' }}>
                Learning Languages
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
              {user.targetLanguages?.map((lang) => (
                <Chip 
                  key={lang}
                  label={lang} 
                  size="small" 
                  color="secondary"
                  variant="filled"
                />
              ))}
            </Box>
          </Grid>
        </Grid>

        {user.interests && user.interests.length > 0 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PersonIcon sx={{ color: '#059669', mr: 1, fontSize: 20 }} />
              <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a1a' }}>
                Interests
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {user.interests.slice(0, 6).map((interest) => (
                <Chip 
                  key={interest}
                  label={interest} 
                  size="small" 
                  variant="outlined"
                  sx={{ borderColor: '#059669', color: '#059669' }}
                />
              ))}
              {user.interests.length > 6 && (
                <Chip 
                  label={`+${user.interests.length - 6} more`}
                  size="small" 
                  variant="outlined"
                  sx={{ borderColor: '#9ca3af', color: '#9ca3af' }}
                />
              )}
            </Box>
          </Box>
        )}
      </Paper>

      {/* Next Steps */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 4, 
          backgroundColor: 'rgba(34, 197, 94, 0.05)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          textAlign: 'left',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 2 }}>
          What's next?
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SearchIcon sx={{ color: '#22c55e', mr: 2, fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: '#666' }}>
              Browse and discover language partners who match your criteria
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ 
              width: 20, 
              height: 20, 
              borderRadius: '50%', 
              backgroundColor: '#22c55e', 
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 600,
              mr: 2,
            }}>
              ❤️
            </Box>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Send match requests to people you'd like to practice with
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ 
              width: 20, 
              height: 20, 
              borderRadius: '50%', 
              backgroundColor: '#22c55e', 
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 600,
              mr: 2,
            }}>
              💬
            </Box>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Start conversations and begin your language learning journey
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Start Button */}
      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={handleStartMatching}
        disabled={isLoading}
        sx={{
          py: 2.5,
          fontSize: '1.1rem',
          fontWeight: 600,
          backgroundColor: '#22c55e',
          '&:hover': {
            backgroundColor: '#16a34a',
          },
          '&:disabled': {
            backgroundColor: '#e5e7eb',
            color: '#9ca3af',
          },
        }}
      >
        {isLoading ? 'Setting up your account...' : 'Start Finding Language Partners!'}
      </Button>

      <Typography 
        variant="body2" 
        sx={{ 
          color: '#9ca3af', 
          mt: 2,
          fontSize: '0.875rem',
        }}
      >
        You can always update your profile and preferences later in settings
      </Typography>
    </Box>
  )
}