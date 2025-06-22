'use client'

import React from 'react'
import { IconButton, Tooltip } from '@mui/material'
import { LightMode, DarkMode } from '@mui/icons-material'
import { useTheme as useCustomTheme } from '@/contexts/ThemeContext'

export default function ThemeToggle() {
  const { mode, toggleTheme } = useCustomTheme()

  return (
    <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        aria-label="Toggle theme"
        sx={{
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.1)',
          },
        }}
      >
        {mode === 'light' ? <DarkMode /> : <LightMode />}
      </IconButton>
    </Tooltip>
  )
}