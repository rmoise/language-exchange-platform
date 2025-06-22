'use client'

import { useState, useEffect } from 'react'
import { useAppDispatch } from '@/lib/hooks'
import { updateOnboardingStep } from '@/features/onboarding/onboardingSlice'
import { useGetCurrentUserQuery, useUpdateUserProfileMutation } from '@/features/api/apiSlice'
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
} from '@mui/material'
import { 
  CakeOutlined as CakeIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { User } from '@/types/global'

interface BirthdayStepProps {
  user: User
  onNext: () => void
  onBack: () => void
}

export default function BirthdayStep({ user, onNext, onBack }: BirthdayStepProps) {
  const dispatch = useAppDispatch()
  const { data: currentUser, refetch } = useGetCurrentUserQuery()
  const [updateProfile] = useUpdateUserProfileMutation()
  
  // Use currentUser from RTK Query as the source of truth, fallback to user prop
  const userData = currentUser || user
  
  // Initialize state with user's birthday if available
  const [birthday, setBirthday] = useState<Date | null>(
    userData?.birthday ? new Date(userData.birthday) : null
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Force refetch on mount to ensure we have the latest data
  useEffect(() => {
    refetch()
  }, [refetch])
  
  // Sync with current user data from RTK Query or props
  useEffect(() => {
    const sourceData = currentUser || user
    if (sourceData?.birthday && !birthday) {
      setBirthday(new Date(sourceData.birthday))
    }
  }, [currentUser, user, birthday])

  const calculateAge = (birthDate: Date): number => {
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const validateBirthday = (date: Date | null): string | null => {
    if (!date) return null
    
    const age = calculateAge(date)
    const today = new Date()
    
    if (date > today) {
      return 'Birthday cannot be in the future'
    }
    
    if (age < 13) {
      return 'You must be at least 13 years old to use this platform'
    }
    
    if (age > 120) {
      return 'Please enter a valid birth date'
    }
    
    return null
  }

  const handleContinue = async () => {
    // Birthday is optional, allow user to skip
    if (birthday) {
      const validationError = validateBirthday(birthday)
      if (validationError) {
        setError(validationError)
        return
      }
    }

    setIsLoading(true)
    setError(null)

    try {
      // Only update birthday if one is selected
      if (birthday) {
        await updateProfile({
          birthday: birthday.toISOString(),
        }).unwrap()
      }

      // Update onboarding step using Redux
      await dispatch(updateOnboardingStep(4))
      
      // Force a final refetch before navigating away
      await refetch()
      
      onNext()
    } catch (err) {
      setError('Failed to save birthday. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Update onboarding step without setting birthday
      await dispatch(updateOnboardingStep(4))
      
      // Force a final refetch before navigating away
      await refetch()
      
      onNext()
    } catch (err) {
      setError('Failed to continue. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const age = birthday ? calculateAge(birthday) : null

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Birthday Selection */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 3, 
            backgroundColor: theme => theme.palette.mode === 'dark' 
              ? 'rgba(30, 41, 59, 0.8)' 
              : 'rgba(248, 250, 252, 0.8)',
            border: theme => theme.palette.mode === 'dark'
              ? '1px solid rgba(71, 85, 105, 0.8)'
              : '1px solid rgba(226, 232, 240, 0.8)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <CakeIcon sx={{ color: theme => theme.palette.primary.main, mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              When's Your Birthday?
            </Typography>
          </Box>
          
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Your age will be displayed on your profile to help find compatible language partners. 
            This is optional and you can always add it later.
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <DatePicker
              label="Select your birthday"
              value={birthday}
              onChange={setBirthday}
              maxDate={new Date()}
              minDate={new Date('1900-01-01')}
              slotProps={{
                textField: {
                  fullWidth: true,
                  sx: {
                    maxWidth: 300,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: theme => theme.palette.mode === 'dark' 
                        ? theme.palette.background.paper 
                        : 'white',
                    },
                  }
                }
              }}
            />
            
            {age !== null && (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme => theme.palette.primary.main,
                  fontWeight: 500,
                  textAlign: 'center'
                }}
              >
                You are {age} years old
              </Typography>
            )}
          </Box>
        </Paper>

        {/* Privacy Notice */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            mb: 4, 
            backgroundColor: theme => theme.palette.mode === 'dark'
              ? 'rgba(34, 197, 94, 0.1)'
              : 'rgba(34, 197, 94, 0.05)',
            border: theme => theme.palette.mode === 'dark'
              ? '1px solid rgba(34, 197, 94, 0.2)'
              : '1px solid rgba(34, 197, 94, 0.1)'
          }}
        >
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
            🔒 Your exact birthday is private. Only your age will be visible to other users.
          </Typography>
        </Paper>

        {/* Navigation buttons */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr 1fr' }, gap: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={onBack}
            startIcon={<ArrowBackIcon />}
            sx={{
              py: 2,
              borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(107, 114, 128, 0.5)' : '#d1d5db',
              color: theme => theme.palette.text.secondary,
            }}
          >
            Back
          </Button>
          
          <Button
            fullWidth
            variant="outlined"
            onClick={handleSkip}
            disabled={isLoading}
            sx={{
              py: 2,
              borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(107, 114, 128, 0.5)' : '#d1d5db',
              color: theme => theme.palette.text.secondary,
            }}
          >
            Skip
          </Button>
          
          <Button
            fullWidth
            variant="contained"
            onClick={handleContinue}
            disabled={isLoading || (birthday !== null && validateBirthday(birthday) !== null)}
            sx={{
              py: 2,
              fontSize: '1rem',
              fontWeight: 600,
              backgroundColor: theme => theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme => theme.palette.primary.dark,
              },
            }}
          >
            {isLoading ? 'Saving...' : 'Continue'}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  )
}