import { cookies } from 'next/headers'
import { Box, Typography } from '@mui/material'
import SessionsClient from './SessionsClient'

async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  
  if (!token) {
    throw new Error('No authentication token')
  }
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.data || data.user
    }
  } catch (error) {
    console.error('Failed to fetch current user:', error)
  }
  return null
}

export default async function SessionsPage() {
  let currentUser = null
  let error = null
  
  try {
    currentUser = await getCurrentUser()
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load user data'
  }

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        textAlign: 'center'
      }}>
        <Typography sx={{ color: '#ef4444', fontWeight: 500, mb: 2 }}>
          ⚠️ {error}
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', p: { xs: 2, md: 4 } }}>
      <SessionsClient currentUser={currentUser} />
    </Box>
  )
}