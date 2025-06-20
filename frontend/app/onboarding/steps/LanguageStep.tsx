'use client'

import { useState } from 'react'
import {
  Box,
  Typography,
  Chip,
  Button,
  Paper,
  Grid,
  Alert,
} from '@mui/material'
import { Language as LanguageIcon } from '@mui/icons-material'
import { User } from '@/types/global'
import { LANGUAGES } from '@/utils/constants'

interface LanguageStepProps {
  user: User
  onNext: () => void
  onBack?: () => void
}

export default function LanguageStep({ user, onNext }: LanguageStepProps) {
  const [nativeLanguages, setNativeLanguages] = useState<string[]>(
    user.nativeLanguages || []
  )
  const [targetLanguages, setTargetLanguages] = useState<string[]>(
    user.targetLanguages || []
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleNativeLanguageToggle = (language: string) => {
    setNativeLanguages(prev => 
      prev.includes(language)
        ? prev.filter(l => l !== language)
        : [...prev, language]
    )
    setError(null)
  }

  const handleTargetLanguageToggle = (language: string) => {
    setTargetLanguages(prev => 
      prev.includes(language)
        ? prev.filter(l => l !== language)
        : [...prev, language]
    )
    setError(null)
  }

  const handleContinue = async () => {
    if (nativeLanguages.length === 0 || targetLanguages.length === 0) {
      setError('Please select at least one native language and one target language.')
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/languages`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          native: nativeLanguages,
          target: targetLanguages,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update languages')
      }

      // Update onboarding step
      const stepResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/onboarding-step`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ step: 1 }),
      })

      if (!stepResponse.ok) {
        console.warn('Failed to update onboarding step')
      }

      onNext()
    } catch (err) {
      setError('Failed to save languages. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const canContinue = nativeLanguages.length > 0 && targetLanguages.length > 0

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Native Languages */}
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
          <LanguageIcon sx={{ color: '#667eea', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
            Languages I Speak
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
          Select the languages you can speak fluently and help others learn.
        </Typography>
        
        <Grid container spacing={1}>
          {LANGUAGES.map((language) => (
            <Grid item key={`native-${language}`}>
              <Chip
                label={language}
                onClick={() => handleNativeLanguageToggle(language)}
                color={nativeLanguages.includes(language) ? 'primary' : 'default'}
                variant={nativeLanguages.includes(language) ? 'filled' : 'outlined'}
                sx={{
                  fontSize: '0.875rem',
                  '&:hover': {
                    backgroundColor: nativeLanguages.includes(language) 
                      ? '#5a6fd8' 
                      : 'rgba(102, 126, 234, 0.1)',
                  },
                }}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Target Languages */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 4, 
          backgroundColor: 'rgba(118, 75, 162, 0.05)',
          border: '1px solid rgba(118, 75, 162, 0.1)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LanguageIcon sx={{ color: '#764ba2', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
            Languages I Want to Learn
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
          Select the languages you want to learn or improve with native speakers.
        </Typography>
        
        <Grid container spacing={1}>
          {LANGUAGES.map((language) => (
            <Grid item key={`target-${language}`}>
              <Chip
                label={language}
                onClick={() => handleTargetLanguageToggle(language)}
                color={targetLanguages.includes(language) ? 'secondary' : 'default'}
                variant={targetLanguages.includes(language) ? 'filled' : 'outlined'}
                sx={{
                  fontSize: '0.875rem',
                  '&:hover': {
                    backgroundColor: targetLanguages.includes(language) 
                      ? '#6b4c8e' 
                      : 'rgba(118, 75, 162, 0.1)',
                  },
                }}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Matching Info */}
      {nativeLanguages.length > 0 && targetLanguages.length > 0 && (
        <Box 
          sx={{ 
            p: 3, 
            mb: 4, 
            backgroundColor: 'rgba(34, 197, 94, 0.05)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            borderRadius: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: '#059669', fontWeight: 500, mb: 1 }}>
            🎯 How matching works:
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            You'll be matched with people who speak your target languages natively 
            and want to learn your native languages. It's a win-win exchange!
          </Typography>
        </Box>
      )}

      {/* Continue Button */}
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
          '&:disabled': {
            backgroundColor: '#e5e7eb',
            color: '#9ca3af',
          },
        }}
      >
        {isLoading ? 'Saving...' : 'Continue'}
      </Button>
    </Box>
  )
}