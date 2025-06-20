'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Typography, LinearProgress, CircularProgress } from '@mui/material'
import { User } from '@/types/global'
import { authenticatedFetch } from '@/utils/auth'
import NameStep from './steps/NameStep'
import LanguageStep from './steps/LanguageStep'
import LocationStep from './steps/LocationStep'
import ProfileStep from './steps/ProfileStep'
import PreferencesStep from './steps/PreferencesStep'
import CompleteStep from './steps/CompleteStep'

const TOTAL_STEPS = 6

const stepTitles = [
  'Set Your Name & Username',
  'Choose Your Languages',
  'Set Your Location', 
  'Complete Your Profile',
  'Set Your Preferences',
  'Welcome to Language Exchange!'
]

const stepDescriptions = [
  'Choose how you want to be identified on the platform',
  'Tell us what languages you speak and want to learn',
  'Help us find language partners near you',
  'Add some personal details to your profile',
  'Set your matching preferences',
  'You\'re all set! Start finding language partners'
]

export default function OnboardingFlow() {
  const [user, setUser] = useState<User | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`)
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/auth/login')
            return
          }
          throw new Error('Failed to fetch user data')
        }

        const data = await response.json()
        const userData = data.data || data.user
        
        setUser(userData)
        setCurrentStep(userData.onboardingStep || 0)
        
        // If user has completed onboarding, redirect to search
        if (userData.onboardingStep >= 5) {
          router.push('/protected/search')
          return
        }
      } catch (err) {
        setError('Failed to load user data')
        console.error('Failed to fetch user:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [router])

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Onboarding complete, redirect to dashboard
      router.push('/protected/dashboard')
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center', color: 'white' }}>
          <CircularProgress size={40} sx={{ color: 'white', mb: 2 }} />
          <Typography>Loading your profile...</Typography>
        </Box>
      </Box>
    )
  }

  if (error || !user) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center', color: 'white' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {error || 'Failed to load profile'}
          </Typography>
          <Typography>
            Please try refreshing the page or contact support if the issue persists.
          </Typography>
        </Box>
      </Box>
    )
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <NameStep user={user} onNext={handleNext} />
      case 1:
        return <LanguageStep user={user} onNext={handleNext} onBack={handleBack} />
      case 2:
        return <LocationStep user={user} onNext={handleNext} onBack={handleBack} />
      case 3:
        return <ProfileStep user={user} onNext={handleNext} onBack={handleBack} />
      case 4:
        return <PreferencesStep user={user} onNext={handleNext} onBack={handleBack} />
      case 5:
        return <CompleteStep user={user} onNext={handleNext} />
      default:
        return <NameStep user={user} onNext={handleNext} />
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 600,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Progress Header */}
        <Box sx={{ p: 4, pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
              Step {currentStep + 1} of {TOTAL_STEPS}
            </Typography>
            <Typography variant="body2" sx={{ color: '#667eea', fontWeight: 600 }}>
              {Math.round(progress)}% Complete
            </Typography>
          </Box>
          
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#667eea',
                borderRadius: 4,
              },
            }}
          />
          
          <Box sx={{ mt: 3 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                color: '#1a1a1a',
                mb: 1,
                fontSize: { xs: '1.5rem', sm: '2rem' },
              }}
            >
              {stepTitles[currentStep]}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#666',
                lineHeight: 1.6,
              }}
            >
              {stepDescriptions[currentStep]}
            </Typography>
          </Box>
        </Box>

        {/* Step Content */}
        <Box sx={{ px: 4, pb: 4 }}>
          {renderStep()}
        </Box>
      </Box>
    </Box>
  )
}