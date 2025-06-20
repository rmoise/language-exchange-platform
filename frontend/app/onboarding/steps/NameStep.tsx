'use client'

import { useState } from 'react'
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert,
  InputAdornment,
  CircularProgress 
} from '@mui/material'
import { User } from '@/types/global'
import { authenticatedFetch } from '@/utils/auth'

interface NameStepProps {
  user: User
  onNext: () => void
}

export default function NameStep({ user, onNext }: NameStepProps) {
  const [name, setName] = useState(user.name || '')
  const [username, setUsername] = useState(user.username || '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usernameError, setUsernameError] = useState<string | null>(null)

  const validateUsername = (value: string) => {
    if (!value) {
      setUsernameError('Username is required')
      return false
    }
    if (value.length < 3) {
      setUsernameError('Username must be at least 3 characters')
      return false
    }
    if (value.length > 30) {
      setUsernameError('Username must be less than 30 characters')
      return false
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      setUsernameError('Username can only contain letters, numbers, _ and -')
      return false
    }
    setUsernameError(null)
    return true
  }

  const validateName = (value: string) => {
    return value.trim().length >= 2
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '')
    setUsername(value)
    validateUsername(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateName(name)) {
      setError('Name must be at least 2 characters long')
      return
    }
    
    if (!validateUsername(username)) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim()
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 409 && errorData.code === 'DUPLICATE_USERNAME') {
          setUsernameError('This username is already taken')
          return
        }
        throw new Error(errorData.error || 'Failed to update profile')
      }

      // Update onboarding step
      await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/onboarding-step`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ step: 1 }),
      })

      onNext()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const canContinue = validateName(name) && validateUsername(username) && !usernameError

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 600, color: '#333' }}>
        Set Your Name & Username
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: '#666' }}>
        Choose how you want to be identified on the platform
      </Typography>

      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
            Display Name
          </Typography>
          <TextField
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., John Smith"
            helperText="This is how others will see your name"
            error={name.length > 0 && !validateName(name)}
            required
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
            Username
          </Typography>
          <TextField
            fullWidth
            value={username}
            onChange={handleUsernameChange}
            placeholder="e.g., johnsmith123"
            InputProps={{
              startAdornment: <InputAdornment position="start">@</InputAdornment>,
            }}
            helperText={usernameError || "Your unique identifier (3-30 characters, letters, numbers, _ and - only)"}
            error={!!usernameError}
            required
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={!canContinue || isLoading}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: 2,
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b5b95 100%)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
              },
            }}
          >
            {isLoading ? (
              <CircularProgress size={20} sx={{ color: 'white' }} />
            ) : (
              'Continue'
            )}
          </Button>
        </Box>
      </form>
    </Box>
  )
}