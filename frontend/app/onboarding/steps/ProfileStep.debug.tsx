'use client'

import { useState, useEffect } from 'react'
import { useAppDispatch } from '@/lib/hooks'
import { updateOnboardingStep } from '@/features/onboarding/onboardingSlice'
import { useGetCurrentUserQuery, useUpdateUserProfileMutation } from '@/features/api/apiSlice'
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  IconButton,
  Chip,
  Avatar,
} from '@mui/material'
import { 
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  CameraAlt as CameraIcon,
} from '@mui/icons-material'
import { User } from '@/types/global'
import { API_ENDPOINTS } from '@/utils/constants'
import { getAbsoluteImageUrl, getRelativeImageUrl } from '@/utils/imageUrl'
import ImageUpload from '../../app/profile/ImageUpload'

interface ProfileStepProps {
  user: User
  onNext: () => void
  onBack: () => void
}

const COMMON_INTERESTS = [
  'Travel', 'Movies', 'Music', 'Books', 'Sports', 'Cooking', 'Photography',
  'Art', 'Technology', 'Gaming', 'Fitness', 'Nature', 'Culture', 'Food',
  'Dancing', 'Writing', 'Learning', 'Business', 'Science', 'History'
]

export default function ProfileStep({ user, onNext, onBack }: ProfileStepProps) {
  const dispatch = useAppDispatch()
  const { data: currentUser, refetch, isLoading, error } = useGetCurrentUserQuery()
  const [updateProfile] = useUpdateUserProfileMutation()
  
  // Debug logging
  console.log('🔍 RTK Query Debug:', {
    isLoading,
    error,
    currentUser,
    userProp: user,
  })
  
  // Check if token exists
  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1]
    console.log('🔑 Token found:', !!token)
    
    // Try manual fetch to debug
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => console.log('📡 Manual fetch response:', data))
      .catch(err => console.error('❌ Manual fetch error:', err))
    }
  }, [])
  
  // Use currentUser from RTK Query as the source of truth, fallback to user prop
  const userData = currentUser || user
  
  const [bio, setBio] = useState(userData.bio || '')
  const [interests, setInterests] = useState<string[]>(userData.interests || [])
  const [customInterest, setCustomInterest] = useState('')
  const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>(
    userData.profileImage || undefined
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  
  // Force refetch on mount to ensure we have the latest data
  useEffect(() => {
    console.log('🔄 Refetching user data...')
    refetch()
  }, [refetch])
  
  // Sync with current user data from RTK Query
  useEffect(() => {
    if (currentUser && !isUploadingImage) {
      console.log('📥 Syncing with currentUser:', currentUser)
      setBio(currentUser.bio || '')
      setInterests(currentUser.interests || [])
      // Only sync profile image on initial load or if server has a different image
      if (!profileImageUrl && currentUser.profileImage) {
        setProfileImageUrl(currentUser.profileImage)
      } else if (profileImageUrl && currentUser.profileImage) {
        const localFilename = profileImageUrl.split('/').pop()
        const serverFilename = currentUser.profileImage.split('/').pop()
        if (localFilename !== serverFilename) {
          setProfileImageUrl(currentUser.profileImage)
        }
      }
    }
  }, [currentUser, isUploadingImage])
  
  // Use profile image from RTK Query data or local state
  const currentProfileImage = profileImageUrl || currentUser?.profileImage || user.profileImage
  const displayImage = getAbsoluteImageUrl(currentProfileImage)
  
  // Debug logging
  console.log('🖼️ ProfileStep - Image URLs:', {
    profileImageUrl,
    currentUserImage: currentUser?.profileImage,
    userImage: user.profileImage,
    currentProfileImage,
    displayImage,
    apiUrl: process.env.NEXT_PUBLIC_API_URL
  })

  const handleImageUpdate = async (imageUrl: string) => {
    console.log('📤 Handling image update:', imageUrl)
    setIsUploadingImage(true)
    setProfileImageUrl(imageUrl)
    
    try {
      const updatedUser = await updateProfile({ profileImage: imageUrl }).unwrap()
      console.log('✅ Profile updated:', updatedUser)
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const { data: refreshedUser } = await refetch()
      console.log('🔄 Refetched user:', refreshedUser)
      
      if (refreshedUser?.profileImage) {
        setProfileImageUrl(refreshedUser.profileImage)
      }
    } catch (err) {
      console.error('❌ Failed to update profile image:', err)
      setProfileImageUrl(undefined)
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleInterestToggle = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    )
  }

  const handleAddCustomInterest = () => {
    const trimmed = customInterest.trim()
    if (trimmed && !interests.includes(trimmed)) {
      setInterests(prev => [...prev, trimmed])
      setCustomInterest('')
    }
  }

  const handleRemoveInterest = (interest: string) => {
    setInterests(prev => prev.filter(i => i !== interest))
  }

  const handleContinue = async () => {
    if (!bio.trim()) {
      setError('Please write a short bio to help others get to know you.')
      return
    }

    if (interests.length === 0) {
      setError('Please select at least one interest.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const relativeImageUrl = profileImageUrl ? getRelativeImageUrl(profileImageUrl) : undefined
      
      console.log('💾 Saving profile with image:', relativeImageUrl)
      
      await updateProfile({
        bio: bio.trim(),
        interests: interests,
        ...(relativeImageUrl && { profileImage: relativeImageUrl }),
      }).unwrap()

      await dispatch(updateOnboardingStep(4))
      await refetch()
      
      onNext()
    } catch (err) {
      console.error('❌ Failed to save profile:', err)
      setError('Failed to save profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const canContinue = bio.trim() && interests.length > 0

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={onBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
      </Box>

      {/* Debug Info */}
      <Alert severity="info" sx={{ mb: 2 }}>
        Debug Mode - Check console for detailed logs
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Profile Preview */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          backgroundColor: 'rgba(102, 126, 234, 0.05)',
          border: '1px solid rgba(102, 126, 234, 0.1)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar 
            src={displayImage}
            sx={{ 
              width: 56, 
              height: 56, 
              mr: 2,
              backgroundColor: '#667eea',
              fontSize: '1.5rem',
              fontWeight: 600,
            }}
          >
            {userData.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
              {userData.name}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              {userData.city && userData.country ? `${userData.city}, ${userData.country}` : userData.city || userData.country || 'Location not set'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Profile Photo Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          backgroundColor: 'rgba(139, 69, 19, 0.05)',
          border: '1px solid rgba(139, 69, 19, 0.1)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CameraIcon sx={{ color: '#8b4513', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
            Profile Photo (Optional)
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
          Add a profile photo to help language partners recognize you. You can skip this and add one later.
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <ImageUpload 
            key={displayImage || 'no-image'}
            currentImage={displayImage} 
            userName={userData.name || 'User'} 
            size={120}
            onImageUpdate={handleImageUpdate}
          />
        </Box>
        
        <Typography variant="body2" sx={{ color: '#999', textAlign: 'center', mt: 2, fontSize: '0.8rem' }}>
          Don't worry - you can always update your photo later in your profile settings
        </Typography>
      </Paper>

      {/* Bio Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          backgroundColor: 'rgba(248, 250, 252, 0.8)',
          border: '1px solid rgba(226, 232, 240, 0.8)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PersonIcon sx={{ color: '#667eea', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
            About You
          </Typography>
        </Box>
        
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Write a short bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell potential language partners about yourself, your interests, and why you want to learn languages..."
          variant="outlined"
          slotProps={{
            htmlInput: { maxLength: 500 }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
            },
          }}
        />
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#666', 
            mt: 1, 
            textAlign: 'right' 
          }}
        >
          {bio.length}/500 characters
        </Typography>
      </Paper>

      {/* Interests Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 4, 
          backgroundColor: 'rgba(248, 250, 252, 0.8)',
          border: '1px solid rgba(226, 232, 240, 0.8)'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 2 }}>
          Your Interests
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
          Select interests to help find compatible language partners with similar hobbies.
        </Typography>
        
        {/* Selected Interests */}
        {interests.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ color: '#667eea', fontWeight: 500, mb: 1 }}>
              Selected ({interests.length}):
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {interests.map((interest) => (
                <Chip
                  key={interest}
                  label={interest}
                  onDelete={() => handleRemoveInterest(interest)}
                  color="primary"
                  variant="filled"
                  sx={{ fontSize: '0.875rem' }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Common Interests */}
        <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
          Choose from popular interests:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
          {COMMON_INTERESTS.map((interest) => (
              <Chip
                key={interest}
                label={interest}
                onClick={() => handleInterestToggle(interest)}
                color={interests.includes(interest) ? 'primary' : 'default'}
                variant={interests.includes(interest) ? 'filled' : 'outlined'}
                sx={{
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: interests.includes(interest) 
                      ? '#5a6fd8' 
                      : 'rgba(102, 126, 234, 0.1)',
                  },
                }}
              />
          ))}
        </Box>

        {/* Custom Interest Input */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Add custom interest"
            value={customInterest}
            onChange={(e) => setCustomInterest(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCustomInterest()}
            sx={{
              flexGrow: 1,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
              },
            }}
          />
          <Button
            variant="outlined"
            onClick={handleAddCustomInterest}
            disabled={!customInterest.trim() || interests.includes(customInterest.trim())}
            sx={{
              minWidth: 'auto',
              px: 2,
              borderColor: '#667eea',
              color: '#667eea',
            }}
          >
            <AddIcon />
          </Button>
        </Box>
      </Paper>

      {/* Navigation buttons */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr' }, gap: 2 }}>
        <Box>
          <Button
            fullWidth
            variant="outlined"
            onClick={onBack}
            sx={{
              py: 2,
              borderColor: '#d1d5db',
              color: '#6b7280',
            }}
          >
            Back
          </Button>
        </Box>
        <Box>
          <Button
            fullWidth
            variant="contained"
            onClick={handleContinue}
            disabled={!canContinue || isLoading}
            sx={{
              py: 2,
              fontSize: '1rem',
              fontWeight: 600,
              backgroundColor: '#667eea',
              '&:hover': {
                backgroundColor: '#5a6fd8',
              },
            }}
          >
            {isLoading ? 'Saving...' : 'Continue'}
          </Button>
        </Box>
      </Box>
    </Box>
  )
}