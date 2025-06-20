'use client'

import { IconButton, Tooltip } from '@mui/material'
import { Brightness4, Brightness7 } from '@mui/icons-material'
import { useColorScheme } from '@mui/material/styles'

export default function ColorModeToggle() {
  const { mode, setMode } = useColorScheme()

  if (!mode) {
    return null
  }

  const toggleColorMode = () => {
    setMode(mode === 'dark' ? 'light' : 'dark')
  }

  return (
    <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
      <IconButton onClick={toggleColorMode} color="inherit">
        {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
      </IconButton>
    </Tooltip>
  )
}