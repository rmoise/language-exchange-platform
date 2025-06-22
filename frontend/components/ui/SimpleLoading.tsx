'use client'

import { Box, CircularProgress } from '@mui/material'

interface SimpleLoadingProps {
  fullScreen?: boolean
  size?: number
}

export default function SimpleLoading({ 
  fullScreen = true, 
  size = 40 
}: SimpleLoadingProps) {
  if (fullScreen) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
        }}
      >
        <CircularProgress 
          size={size}
          sx={{ 
            color: '#6366f1' 
          }} 
        />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <CircularProgress 
        size={size}
        sx={{ 
          color: '#6366f1' 
        }} 
      />
    </Box>
  )
}