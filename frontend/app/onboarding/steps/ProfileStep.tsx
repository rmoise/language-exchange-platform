'use client'

import { useState, useEffect } from 'react'
import { useAppDispatch } from '@/lib/hooks'
import { updateOnboardingStep } from '@/features/onboarding/onboardingSlice'
import { useGetCurrentUserQuery, useUpdateUserProfileMutation, useUpdateProfileImageCacheMutation } from '@/features/api/apiSlice'
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
  const { data: currentUser, refetch, isLoading: isRTKLoading, error: rtkError } = useGetCurrentUserQuery()
  const [updateProfile] = useUpdateUserProfileMutation()
  const [updateProfileImageCache] = useUpdateProfileImageCacheMutation()
  
  // Use currentUser from RTK Query as the source of truth, fallback to user prop
  const userData = currentUser || user
  
  // Initialize state with user prop data
  const [bio, setBio] = useState(user?.bio || '')
  const [interests, setInterests] = useState<string[]>(user?.interests || [])
  const [customInterest, setCustomInterest] = useState('')
  const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>(
    // Initialize with the user's profile image from props
    user?.profileImage || undefined
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  
  // Force refetch on mount to ensure we have the latest data
  useEffect(() => {
    refetch()
  }, [refetch])
  
  // Sync with current user data from RTK Query or props
  useEffect(() => {
    const sourceData = currentUser || user
    if (sourceData && !isUploadingImage) {
      // Only update if values have changed to avoid infinite loops
      if (sourceData.bio !== undefined && sourceData.bio !== bio) {
        setBio(sourceData.bio || '')
      }
      if (sourceData.interests && JSON.stringify(sourceData.interests) !== JSON.stringify(interests)) {
        setInterests(sourceData.interests || [])
      }
      // Only sync profile image on initial load or if server has a different image
      if (!profileImageUrl && sourceData.profileImage) {
        // Initial load - set the profile image from server
        setProfileImageUrl(sourceData.profileImage)
      } else if (profileImageUrl && sourceData.profileImage) {
        // Compare the filenames to see if they're different
        const localFilename = profileImageUrl.split('/').pop()
        const serverFilename = sourceData.profileImage.split('/').pop()
        if (localFilename !== serverFilename) {
          // Server has a different image, sync it
          setProfileImageUrl(sourceData.profileImage)
        }
      }
    }
  }, [currentUser, user, isUploadingImage, bio, interests, profileImageUrl]) // Don't sync while uploading
  
  // Use profile image from RTK Query data or local state
  const currentProfileImage = profileImageUrl || currentUser?.profileImage || user?.profileImage
  const displayImage = getAbsoluteImageUrl(currentProfileImage)
  

  const handleImageUpdate = async (imageUrl: string) => {
    setIsUploadingImage(true)
    
    try {
      // First, immediately update the RTK Query cache with the new image URL
      await updateProfileImageCache(imageUrl)
      
      // Set the local state with the absolute URL
      const absoluteUrl = getAbsoluteImageUrl(imageUrl)
      setProfileImageUrl(absoluteUrl || imageUrl)
      
      // The backend upload handler already updates the user profile with the image
      // Wait a bit for the backend to fully process the update
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Force refetch to get the latest user data from the server
      const { data: refreshedUser } = await refetch()
      
      // Update local state with the image URL from the server (should be transformed to absolute URL)
      if (refreshedUser?.profileImage) {
        setProfileImageUrl(refreshedUser.profileImage)
      }
    } catch (err) {
      console.error('Failed to update image:', err)
      // Still set the image URL even if cache update fails
      const absoluteUrl = getAbsoluteImageUrl(imageUrl)
      setProfileImageUrl(absoluteUrl || imageUrl)
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
      // Use RTK Query mutation to update profile
      // Use the local profileImageUrl if available (which might be a newly uploaded image)
      // Convert to relative URL for saving to backend
      const relativeImageUrl = profileImageUrl ? getRelativeImageUrl(profileImageUrl) : undefined
      
      await updateProfile({
        bio: bio.trim(),
        interests: interests,
        ...(relativeImageUrl && { profileImage: relativeImageUrl }),
      }).unwrap()

      // Update onboarding step using Redux
      await dispatch(updateOnboardingStep(5))
      
      // Force a final refetch before navigating away
      await refetch()
      
      onNext()
    } catch (err) {
      setError('Failed to save profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const canContinue = bio.trim() && interests.length > 0

  return (
    <Box>
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
          backgroundColor: theme => theme.palette.mode === 'dark'
            ? 'rgba(102, 126, 234, 0.1)'
            : 'rgba(102, 126, 234, 0.05)',
          border: theme => theme.palette.mode === 'dark'
            ? '1px solid rgba(102, 126, 234, 0.2)'
            : '1px solid rgba(102, 126, 234, 0.1)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar 
            src={displayImage}
            sx={{ 
              width: 56, 
              height: 56, 
              mr: 2,
              backgroundColor: theme => theme.palette.primary.main,
              fontSize: '1.5rem',
              fontWeight: 600,
            }}
          >
            {userData.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {userData.name}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
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
          backgroundColor: theme => theme.palette.mode === 'dark'
            ? 'rgba(139, 69, 19, 0.1)'
            : 'rgba(139, 69, 19, 0.05)',
          border: theme => theme.palette.mode === 'dark'
            ? '1px solid rgba(139, 69, 19, 0.2)'
            : '1px solid rgba(139, 69, 19, 0.1)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CameraIcon sx={{ color: theme => theme.palette.mode === 'dark' ? '#d97706' : '#8b4513', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Profile Photo (Optional)
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Add a profile photo to help language partners recognize you. You can skip this and add one later.
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <ImageUpload 
            key={displayImage || 'no-image'} // Force re-render when image changes
            currentImage={displayImage} 
            userName={userData.name || 'User'} 
            size={120}
            onImageUpdate={handleImageUpdate}
          />
        </Box>
        
        <Typography variant="body2" sx={{ color: 'text.disabled', textAlign: 'center', mt: 2, fontSize: '0.8rem' }}>
          Don't worry - you can always update your photo later in your profile settings
        </Typography>
      </Paper>

      {/* Bio Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          backgroundColor: theme => theme.palette.mode === 'dark' 
            ? 'rgba(30, 41, 59, 0.8)' 
            : 'rgba(248, 250, 252, 0.8)',
          border: theme => theme.palette.mode === 'dark'
            ? '1px solid rgba(71, 85, 105, 0.8)'
            : '1px solid rgba(226, 232, 240, 0.8)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PersonIcon sx={{ color: theme => theme.palette.primary.main, mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
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
              backgroundColor: theme => theme.palette.mode === 'dark' 
                ? theme.palette.background.paper 
                : 'white',
            },
          }}
        />
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'text.secondary', 
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
          backgroundColor: theme => theme.palette.mode === 'dark' 
            ? 'rgba(30, 41, 59, 0.8)' 
            : 'rgba(248, 250, 252, 0.8)',
          border: theme => theme.palette.mode === 'dark'
            ? '1px solid rgba(71, 85, 105, 0.8)'
            : '1px solid rgba(226, 232, 240, 0.8)'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Your Interests
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Select interests to help find compatible language partners with similar hobbies.
        </Typography>
        
        {/* Selected Interests */}
        {interests.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ color: theme => theme.palette.primary.main, fontWeight: 500, mb: 1 }}>
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
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
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
                      ? theme => theme.palette.primary.dark 
                      : theme => theme.palette.mode === 'dark' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(102, 126, 234, 0.1)',
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
                backgroundColor: theme => theme.palette.mode === 'dark' 
                  ? theme.palette.background.paper 
                  : 'white',
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
              borderColor: theme => theme.palette.primary.main,
              color: theme => theme.palette.primary.main,
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
              borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(107, 114, 128, 0.5)' : '#d1d5db',
              color: theme => theme.palette.text.secondary,
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
              backgroundColor: theme => theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme => theme.palette.primary.dark,
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