'use client'

import { useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Typography, useTheme, Alert } from '@mui/material'
import { useTheme as useCustomTheme } from '@/contexts/ThemeContext'
import ThemeToggle from '@/components/ui/ThemeToggle'
import ThemeAwareLoading from '@/components/ui/ThemeAwareLoading'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { selectUser } from '@/features/user/userSlice'
import { useGetCurrentUserQuery } from '@/features/api/apiSlice'
import {
  selectCurrentStep,
  selectOnboardingLoading,
  setCurrentStep,
  goToNextStep,
  goToPreviousStep,
  initializeFromUser
} from '@/features/onboarding/onboardingSlice'
import NameStep from './steps/NameStep'
import LanguageStep from './steps/LanguageStep'
import LocationStep from './steps/LocationStep'
import BirthdayStep from './steps/BirthdayStep'
import ProfileStep from './steps/ProfileStep'
import PreferencesStep from './steps/PreferencesStep'
import CompleteStep from './steps/CompleteStep'

const TOTAL_STEPS = 7

const stepTitles = [
  'Set Your Name & Username',
  'Choose Your Languages',
  'Set Your Location',
  'When\'s Your Birthday?',
  'Complete Your Profile',
  'Set Your Preferences',
  'Welcome to Language Exchange!'
]

const stepDescriptions = [
  'Choose how you want to be identified on the platform',
  'Tell us what languages you speak and want to learn',
  'Help us find language partners near you',
  'Your age helps us find compatible language partners',
  'Add some personal details to your profile',
  'Set your matching preferences',
  'You\'re all set! Start finding language partners'
]

export default function OnboardingFlow() {
  const dispatch = useAppDispatch()
  const { data: user, isLoading, error, refetch } = useGetCurrentUserQuery()
  const currentStep = useAppSelector(selectCurrentStep)
  const onboardingLoading = useAppSelector(selectOnboardingLoading)
  const router = useRouter()
  const theme = useTheme()
  const { mode } = useCustomTheme()
  const [mounted, setMounted] = useState(false)


  // Handle mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Memoized handlers following React best practices
  const handleNext = useCallback(() => {
    dispatch(goToNextStep())
    // Refresh user data after moving to next step
    setTimeout(() => {
      refetch()
    }, 100)
  }, [dispatch, refetch])

  const handleBack = useCallback(() => {
    dispatch(goToPreviousStep())
  }, [dispatch])

  // Effect with proper router handling - following Next.js patterns
  useEffect(() => {
    // Data is fetched automatically by RTK Query
  }, [])

  // Handle authentication and navigation based on user data
  useEffect(() => {
    if (error) {
      // Redirect to login if authentication fails
      console.error('OnboardingFlow - Error fetching user:', error)
      router.push('/auth/login')
      return
    }

    // If not loading and no user data, redirect to login
    if (!isLoading && !user && !error) {
      router.push('/auth/login')
      return
    }

    if (user) {
      const userStep = user.onboardingStep || 0

      // Only initialize Redux state if it's uninitialized (-1)
      // This prevents resetting the step when navigating back
      if (currentStep === -1) {
        dispatch(initializeFromUser(userStep))
      }

      // If user has completed onboarding, redirect to dashboard
      if (userStep >= 6) {
        router.push('/protected/dashboard')
        return
      }
    }
  }, [user, error, currentStep, dispatch, router, isLoading])

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" color="error">Error</Typography>
        <Typography>Failed to load user data</Typography>
      </Box>
    )
  }

  // Show loading only when step is uninitialized (-1) or during initial user fetch
  if (currentStep === -1 || (isLoading && !user)) {
    return <ThemeAwareLoading />
  }

  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: mode === 'dark'
          ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'relative',
      }}
    >
      {/* Theme Toggle */}
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 1000,
        }}
      >
        <ThemeToggle />
      </Box>

      <Box
        sx={{
          width: '100%',
          maxWidth: 600,
          backgroundColor: theme.palette.background.paper,
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: mode === 'dark'
            ? '0 20px 40px rgba(0, 0, 0, 0.5)'
            : '0 20px 40px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Progress Header */}
        <Box sx={{ p: 4, pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
              Step {currentStep + 1} of {TOTAL_STEPS}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
              {Math.round(progress)}% Complete
            </Typography>
          </Box>

          <Box sx={{
            height: 8,
            backgroundColor: mode === 'dark'
              ? 'rgba(139, 92, 246, 0.2)'
              : 'rgba(102, 126, 234, 0.1)',
            borderRadius: 4,
            overflow: 'hidden'
          }}>
            <Box
              sx={{
                height: '100%',
                backgroundColor: theme.palette.primary.main,
                width: `${progress}%`,
                transition: 'width 0.3s ease'
              }}
            />
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 1,
                fontSize: { xs: '1.5rem', sm: '2rem' },
              }}
            >
              {stepTitles[currentStep]}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                lineHeight: 1.6,
              }}
            >
              {stepDescriptions[currentStep]}
            </Typography>
          </Box>
        </Box>

        {/* Step Content */}
        <Box sx={{ px: 4, pb: 4 }}>
          {user && currentStep >= 0 && (
            <>
              {currentStep === 0 && <NameStep user={user} onNext={handleNext} />}
              {currentStep === 1 && <LanguageStep user={user} onNext={handleNext} onBack={handleBack} />}
              {currentStep === 2 && <LocationStep user={user} onNext={handleNext} onBack={handleBack} />}
              {currentStep === 3 && <BirthdayStep user={user} onNext={handleNext} onBack={handleBack} />}
              {currentStep === 4 && (
                <>
                  <ProfileStep user={user} onNext={handleNext} onBack={handleBack} />
                </>
              )}
              {currentStep === 5 && <PreferencesStep user={user} onNext={handleNext} onBack={handleBack} />}
              {currentStep === 6 && <CompleteStep user={user} onNext={handleNext} />}
            </>
          )}
          {!user && !isLoading && (
            <Alert severity="error">
              Unable to load user data. Please refresh the page or try logging in again.
            </Alert>
          )}
        </Box>
      </Box>
    </Box>
  )
}