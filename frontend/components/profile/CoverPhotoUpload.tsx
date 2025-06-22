'use client'

import { Box } from '@mui/material'
import ImageUpload from '@/app/protected/profile/ImageUpload'
import { useDispatch, useSelector } from 'react-redux'
import { updateCoverPhoto } from '@/features/auth/authSlice'
import { RootState } from '@/lib/store'

interface CoverPhotoUploadProps {
  width?: string | number
  height?: string | number
  borderRadius?: number
  onClick?: () => void
}

export default function CoverPhotoUpload({ 
  width = '100%', 
  height = 300, 
  borderRadius = 2,
  onClick
}: CoverPhotoUploadProps) {
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.auth.user)

  const handleCoverPhotoUpdate = (imageUrl: string) => {
    dispatch(updateCoverPhoto(imageUrl))
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width,
        height,
        borderRadius,
        overflow: 'hidden',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        backgroundImage: user?.coverPhoto ? `url('${user.coverPhoto}')` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        cursor: onClick ? 'pointer' : 'auto',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onClick ? {
          transform: 'scale(1.01)',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
        } : {},
      }}
      onClick={onClick}
    >
      {/* Upload Component */}
      <ImageUpload
        currentImage={user?.coverPhoto}
        userName={user?.name || 'User'}
        isProfilePicture={false}
        onImageUpdate={handleCoverPhotoUpdate}
      />
      
      {/* Overlay for no cover photo */}
      {!user?.coverPhoto && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            color: 'white',
            fontSize: '1.1rem',
            fontWeight: 500,
            textAlign: 'center',
            padding: 2,
          }}
        >
          Add Cover Photo
        </Box>
      )}
    </Box>
  )
}