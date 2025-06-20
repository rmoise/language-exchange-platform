'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useAppDispatch } from '@/lib/hooks'
import { loginWithGoogle } from '@/features/auth/authSlice'

export default function GoogleCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const error = searchParams.get('error')

      if (error) {
        console.error('Google OAuth error:', error)
        router.push('/auth/login?error=oauth_failed')
        return
      }

      if (!code) {
        console.error('No authorization code received')
        router.push('/auth/login?error=oauth_failed')
        return
      }

      try {
        await dispatch(loginWithGoogle(code)).unwrap()
        
        // Check if user needs onboarding
        // This will be handled by the protected route layout
        router.push('/protected/dashboard')
      } catch (error) {
        console.error('Google authentication failed:', error)
        router.push('/auth/login?error=oauth_failed')
      }
    }

    handleCallback()
  }, [searchParams, dispatch, router])

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
        color: 'white',
      }}
    >
      <CircularProgress size={40} sx={{ color: 'white', mb: 2 }} />
      <Typography variant="h6" sx={{ mb: 1 }}>
        Completing sign in...
      </Typography>
      <Typography variant="body2" sx={{ color: '#9ca3af' }}>
        Please wait while we set up your account
      </Typography>
    </Box>
  )
}