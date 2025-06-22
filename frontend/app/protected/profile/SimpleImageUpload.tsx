'use client'

import { useState, useRef } from 'react'
import { 
  Box, 
  IconButton, 
  Badge, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Snackbar,
  Alert
} from '@mui/material'
import { CameraAlt, Close, Upload, Delete } from '@mui/icons-material'
import { api } from '@/utils/api'
import ImageWithDelete from '@/components/ui/ImageWithDelete'
import UserAvatar from '@/components/ui/UserAvatar'

interface SimpleImageUploadProps {
  currentImage?: string
  userName: string
  size?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number }
  isProfilePicture?: boolean
  onImageUpdate?: (imageUrl: string) => void
  onImageClick?: () => void
  isOwnProfile?: boolean
}

export default function SimpleImageUpload({ 
  currentImage, 
  userName, 
  size = 168,
  isProfilePicture = true,
  onImageUpdate,
  onImageClick,
  isOwnProfile = false
}: SimpleImageUploadProps) {
  
  const [preview, setPreview] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const selectedFileRef = useRef<File | null>(null)


  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    selectedFileRef.current = file
    
    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result as string)
      setOpen(true)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFileRef.current) return

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('image', selectedFileRef.current)
      formData.append('type', isProfilePicture ? 'profile' : 'cover')
      
      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      const uploadedImageUrl = response.data?.url
      
      if (!uploadedImageUrl) {
        throw new Error('No image URL returned from server')
      }
      
      setSuccess(true)
      setOpen(false)
      setPreview(null)
      selectedFileRef.current = null
      
      if (onImageUpdate) {
        onImageUpdate(uploadedImageUrl)
      }
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to upload image'
      setError(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const handleCancel = () => {
    setOpen(false)
    setPreview(null)
    selectedFileRef.current = null
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDelete = () => {
    if (onImageUpdate) {
      onImageUpdate('')
    }
  }

  const ProfileImageComponent = () => (
    <ImageWithDelete 
      imageUrl={currentImage} 
      onDelete={undefined} // Don't show delete button on profile avatar - only in carousel
      isProfile={true}
    >
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeContent={
          <IconButton
            component="label"
            sx={{
              width: 40,
              height: 40,
              backgroundColor: 'background.paper',
              border: '2px solid',
              borderColor: 'background.paper',
              '&:hover': {
                backgroundColor: (theme) => theme.palette.mode === 'light' ? '#f5f5f5' : '#424242',
              },
            }}
          >
            <input
              ref={fileInputRef}
              hidden
              accept="image/*"
              type="file"
              onChange={handleFileSelect}
            />
            <CameraAlt sx={{ fontSize: 20 }} />
          </IconButton>
        }
      >
        <UserAvatar
          user={{ name: userName, profileImage: currentImage }}
          size={size}
          showOnlineStatus={false}
          onClick={() => {
            if (currentImage && onImageClick) {
              onImageClick()
            } else {
              fileInputRef.current?.click()
            }
          }}
        />
      </Badge>
    </ImageWithDelete>
  )

  const CoverImageComponent = () => (
    <ImageWithDelete 
      imageUrl={currentImage} 
      onDelete={undefined} // Don't show delete button on cover photo - only in carousel
      isProfile={false}
    >
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        <IconButton
          component="label"
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
            },
          }}
        >
          <input
            ref={fileInputRef}
            hidden
            accept="image/*"
            type="file"
            onChange={handleFileSelect}
          />
          <CameraAlt />
        </IconButton>
      </Box>
    </ImageWithDelete>
  )

  return (
    <>
      {isProfilePicture ? <ProfileImageComponent /> : <CoverImageComponent />}

      {/* Upload Preview Dialog */}
      <Dialog 
        open={open} 
        onClose={handleCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {isProfilePicture ? 'Update Profile Picture' : 'Update Cover Photo'}
          <IconButton onClick={handleCancel}>
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          {preview && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Box
                component="img"
                src={preview}
                alt="Preview"
                sx={{
                  width: isProfilePicture ? 200 : 'auto',
                  height: isProfilePicture ? 200 : 'auto',
                  maxWidth: '100%',
                  maxHeight: 300,
                  borderRadius: isProfilePicture ? '50%' : 2,
                  objectFit: 'cover',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Preview of your new {isProfilePicture ? 'profile picture' : 'cover photo'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={handleCancel}
            variant="outlined"
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpload}
            variant="contained"
            disabled={uploading}
            startIcon={uploading ? undefined : <Upload />}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbars */}
      <Snackbar 
        open={success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(false)}
      >
        <Alert onClose={() => setSuccess(false)} severity="success">
          {isProfilePicture ? 'Profile picture' : 'Cover photo'} updated successfully!
        </Alert>
      </Snackbar>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </>
  )
}