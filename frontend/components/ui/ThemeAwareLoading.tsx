'use client'

import { Box, CircularProgress } from '@mui/material'
import { useAppSelector } from '@/lib/hooks'
import { selectThemeMode } from '@/features/theme/themeSlice'

interface ThemeAwareLoadingProps {
  fullScreen?: boolean
  size?: number
}

export default function ThemeAwareLoading({ 
  fullScreen = true, 
  size = 40 
}: ThemeAwareLoadingProps) {
  const currentTheme = useAppSelector(selectThemeMode)

  if (fullScreen) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: currentTheme === 'dark' ? '#0f172a' : '#f8fafc',
        }}
      >
        <CircularProgress 
          size={size}
          sx={{ 
            color: currentTheme === 'dark' ? '#8b5cf6' : '#6366f1' 
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
          color: currentTheme === 'dark' ? '#8b5cf6' : '#6366f1' 
        }} 
      />
    </Box>
  )
}