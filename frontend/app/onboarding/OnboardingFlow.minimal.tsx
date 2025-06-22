'use client'

import { useState } from 'react'
import { Box, Typography } from '@mui/material'

let renderCount = 0

export default function OnboardingFlowMinimal() {
  renderCount++
  const [count, setCount] = useState(0)

  console.log(`Render #${renderCount}: OnboardingFlow render, count:`, count)
  
  if (renderCount > 50) {
    console.error('TOO MANY RENDERS DETECTED!')
    throw new Error('Infinite render loop detected in minimal component')
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography>Test Component - Count: {count}</Typography>
      <button onClick={() => setCount(c => c + 1)}>
        Increment
      </button>
    </Box>
  )
}