'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Box, CircularProgress } from '@mui/material'
import { useAppDispatch } from '@/lib/hooks'
import { loginWithGoogle } from '@/features/auth/authSlice'

interface GoogleAuthButtonProps {
  variant?: 'signin' | 'signup'
}

export default function GoogleAuthButton({ variant = 'signin' }: GoogleAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const dispatch = useAppDispatch()
  const router = useRouter()

  const handleGoogleAuth = async () => {
    setIsLoading(true)
    try {
      // Call backend to get Google OAuth URL
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to get Google OAuth URL')
      }

      const { authUrl } = await response.json()
      
      // Redirect to Google OAuth
      window.location.href = authUrl
    } catch (error) {
      console.error('Google OAuth error:', error)
      setIsLoading(false)
    }
  }

  const buttonText = variant === 'signin' 
    ? 'Continue with Google' 
    : 'Sign up with Google'

  return (
    <Button
      fullWidth
      variant="outlined"
      onClick={handleGoogleAuth}
      disabled={isLoading}
      sx={{
        py: { xs: 1.75, sm: 2 },
        borderRadius: 1,
        fontWeight: 300,
        fontSize: { xs: '0.875rem', sm: '0.95rem' },
        textTransform: 'none',
        backgroundColor: 'transparent',
        color: 'white',
        border: '1px solid #374151',
        boxShadow: 'none',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderColor: '#6366f1',
        },
        '&:disabled': {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          color: 'rgba(255, 255, 255, 0.5)',
          borderColor: '#374151',
        },
        transition: 'all 0.3s ease',
      }}
    >
      {isLoading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} color="inherit" />
          Connecting...
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {buttonText}
        </Box>
      )}
    </Button>
  )
}