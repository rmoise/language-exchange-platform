'use client'

import { useState } from 'react'
import { useAppDispatch } from '@/lib/hooks'
import { updateOnboardingStep } from '@/features/onboarding/onboardingSlice'
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert,
  useTheme
} from '@mui/material'
import { User } from '@/types/global'
import { authenticatedFetch } from '@/utils/auth'

interface NameStepProps {
  user: User
  onNext: () => void
}

export default function NameStep({ user, onNext }: NameStepProps) {
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const [name, setName] = useState(user.name || '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateName = (value: string) => {
    return value.trim().length >= 2
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateName(name)) {
      setError('Name must be at least 2 characters long')
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
          name: name.trim()
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      // Update onboarding step using Redux
      await dispatch(updateOnboardingStep(1))
      
      onNext()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  // Check validation without calling the functions that set state
  const canContinue = name.trim().length >= 2

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
            Your Name
          </Typography>
          <TextField
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., John Smith"
            helperText="This is how others will see your name"
            error={name.length > 0 && name.trim().length < 2}
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: theme.palette.mode === 'dark' 
                  ? theme.palette.background.paper 
                  : 'white',
              },
            }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
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
      </form>
    </Box>
  )
}