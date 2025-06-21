'use client'

import { Avatar, SxProps, Theme, Box } from '@mui/material'
import { User } from '@/types/global'

interface UserAvatarProps {
  user?: User | null
  size?: number
  sx?: SxProps<Theme>
  showOnlineStatus?: boolean
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function UserAvatar({ 
  user, 
  size = 32, 
  sx,
  showOnlineStatus = true
}: UserAvatarProps) {
  const avatarElement = (() => {
    // If no user, show default avatar with initials "U"
    if (!user) {
      return (
        <Avatar
          sx={{
            width: size,
            height: size,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontSize: size * 0.4,
            fontWeight: 600,
            color: 'white',
          }}
        >
          U
        </Avatar>
      )
    }

    // If user has profile image or avatar, use it
    const imageUrl = user.profileImage || (user as any).avatar;
    if (imageUrl) {
      return (
        <Avatar
          src={imageUrl}
          alt={user.name}
          sx={{
            width: size,
            height: size,
          }}
        >
          {/* Fallback to initials if image fails to load */}
          {getInitials(user.name)}
        </Avatar>
      )
    }

    // Fallback to initials
    return (
      <Avatar
        sx={{
          width: size,
          height: size,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          fontSize: size * 0.4,
          fontWeight: 600,
          color: 'white',
        }}
      >
        {getInitials(user.name)}
      </Avatar>
    )
  })()

  // If no online status needed, return just the avatar
  if (!showOnlineStatus) {
    return <Box sx={sx}>{avatarElement}</Box>
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