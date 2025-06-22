'use client'

import { Avatar, SxProps, Theme, Box } from '@mui/material'
import { User } from '@/types/global'
import { getAbsoluteImageUrl } from '@/utils/imageUrl'

interface UserAvatarProps {
  user?: User | null
  size?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number }
  sx?: SxProps<Theme>
  showOnlineStatus?: boolean
  onClick?: () => void
  userName?: string // Allow passing name directly for cases where user object isn't available
}

const getInitials = (name?: string): string => {
  if (!name) return 'U'
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Consistent avatar styling - single source of truth
const getAvatarStyling = (size: number | object, hasImage: boolean = false) => {
  // Better font scaling for different avatar sizes
  const getFontSize = () => {
    if (typeof size === 'number') {
      // Optimized scaling for different sizes
      if (size <= 32) return size * 0.5;      // 16px for 32px avatar
      if (size <= 48) return size * 0.4;      // 19.2px for 48px avatar
      if (size <= 64) return size * 0.38;     // 24.3px for 64px avatar
      return size * 0.35;                      // Larger avatars
    }
    return { xs: '1rem', sm: '1.5rem', md: '2rem', lg: '2.5rem' };
  };

  return {
    width: size,
    height: size,
    backgroundColor: hasImage ? 'transparent' : '#6366f1', // Flat indigo background
    color: 'white',
    fontSize: getFontSize(),
    fontWeight: 600,
    border: 'none', // Clean flat look
    boxShadow: 'none', // Remove any shadows for flat design
    // Ensure crisp rendering
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
  };
}

export default function UserAvatar({ 
  user, 
  size = 32, 
  sx,
  showOnlineStatus = true,
  onClick,
  userName
}: UserAvatarProps) {
  const displayName = user?.name || userName || 'User'
  
  const avatarElement = (() => {
    // Try to get image URL from user object
    const imageUrl = user?.profileImage || (user as any)?.avatar || (user as any)?.profile_image;
    const absoluteImageUrl = getAbsoluteImageUrl(imageUrl)
    
    if (absoluteImageUrl && absoluteImageUrl.trim() !== '') {
      return (
        <Avatar
          src={absoluteImageUrl}
          alt={displayName}
          onClick={onClick}
          sx={{
            ...getAvatarStyling(size, true),
            cursor: onClick ? 'pointer' : 'default',
            ...sx
          }}
        >
          {/* Fallback to initials if image fails to load */}
          {getInitials(displayName)}
        </Avatar>
      )
    }

    // Fallback to initials with consistent indigo background
    return (
      <Avatar
        onClick={onClick}
        sx={{
          ...getAvatarStyling(size, false),
          cursor: onClick ? 'pointer' : 'default',
          ...sx
        }}
      >
        {getInitials(displayName)}
      </Avatar>
    )
  })()

  // If no online status needed, return just the avatar
  if (!showOnlineStatus) {
    return avatarElement
  }

  // Return avatar with online status indicator
  return (
    <Box 
      sx={{ 
        position: 'relative', 
        display: 'inline-block',
        ...sx 
      }}
    >
      {avatarElement}
      {/* Online status indicator */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: size * 0.25,
          height: size * 0.25,
          backgroundColor: '#4ade80', // Green for online
          borderRadius: '50%',
          border: '2px solid white',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        }}
      />
    </Box>
  )
}