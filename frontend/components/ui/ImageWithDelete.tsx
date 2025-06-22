'use client'

import { Box, IconButton } from '@mui/material'
import { Delete } from '@mui/icons-material'

interface ImageWithDeleteProps {
  imageUrl?: string
  onDelete?: () => void
  children: React.ReactNode
  isProfile?: boolean
}

export default function ImageWithDelete({ 
  imageUrl, 
  onDelete, 
  children,
  isProfile = false 
}: ImageWithDeleteProps) {
  // Only show the delete button if we have an image, delete handler, and the image exists
  const showDeleteButton = imageUrl && onDelete && imageUrl.trim() !== ''
  
  if (!showDeleteButton) {
    return <>{children}</>
  }

  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      {children}
      <IconButton
        onClick={onDelete}
        sx={{
          position: 'absolute',
          top: isProfile ? -8 : 8,
          right: isProfile ? -8 : 8,
          width: 32,
          height: 32,
          backgroundColor: 'error.main',
          color: 'white',
          '&:hover': {
            backgroundColor: 'error.dark',
          },
          zIndex: 10,
        }}
      >
        <Delete sx={{ fontSize: 16 }} />
      </IconButton>
    </Box>
  )
}