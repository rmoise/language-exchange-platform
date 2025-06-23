'use client'

import { useState, useRef, useCallback } from 'react'
import { 
  Box, 
  IconButton, 
  Badge, 
  Avatar, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Snackbar,
  Alert
} from '@mui/material'
import { CameraAlt, Close, Upload, Crop, Delete } from '@mui/icons-material'
import { api } from '@/utils/api'

interface ImageUploadProps {
  currentImage?: string
  userName: string
  size?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number }
  isProfilePicture?: boolean
  onImageUpdate?: (imageUrl: string) => void
  onImageDelete?: () => void
  onImageClick?: () => void
}

export default function ImageUpload({ 
  currentImage, 
  userName, 
  size = 168,
  isProfilePicture = true,
  onImageUpdate,
  onImageDelete,
  onImageClick
}: ImageUploadProps) {
  
  const getSize = (breakpoint?: string) => {
    if (typeof size === 'number') return size
    if (typeof size === 'object') {
      return size[breakpoint as keyof typeof size] || size.md || size.sm || size.xs || 168
    }
    return 168
  }
  const [preview, setPreview] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showCrop, setShowCrop] = useState(false)
  const [cropData, setCropData] = useState<{x: number, y: number, width: number, height: number} | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const selectedFileRef = useRef<File | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    selectedFileRef.current = file
    
    // Create preview
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
      // Create FormData for upload
      const formData = new FormData()
      formData.append('image', selectedFileRef.current)
      formData.append('type', isProfilePicture ? 'profile' : 'cover')
      
      // API call to backend upload endpoint using axios api instance
      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      // Get the uploaded image URL from response (backend returns {url, filename, message})
      const uploadedImageUrl = response.data?.url
      
      // Ensure we have a valid URL before updating
      if (!uploadedImageUrl) {
        throw new Error('No image URL returned from server')
      }
      
      setSuccess(true)
      setOpen(false)
      setPreview(null)
      selectedFileRef.current = null
      
      // Notify parent component of the new image URL
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

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (onImageDelete) {
      onImageDelete()
    }
    setDeleteDialogOpen(false)
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
  }

  const ProfileImageComponent = () => (
    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
      <Box sx={{ position: 'relative' }}>
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
                  backgroundColor: 'action.hover',
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
        <Box
          key={currentImage || 'no-image'} // Force re-render when image changes
          sx={{
            width: typeof size === 'number' ? size : size,
            height: typeof size === 'number' ? size : size,
            minWidth: typeof size === 'number' ? size : size,
            minHeight: typeof size === 'number' ? size : size,
            maxWidth: typeof size === 'number' ? size : size,
            maxHeight: typeof size === 'number' ? size : size,
            borderRadius: '50%',
            border: { xs: '2px solid', sm: '3px solid' },
            borderColor: 'background.paper',
            backgroundColor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: typeof size === 'number' 
              ? (size > 100 ? '3rem' : '1.5rem')
              : { xs: '1.5rem', sm: '2rem', md: '3rem' },
            fontWeight: 700,
            color: 'primary.contrastText',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            backgroundImage: currentImage ? `url('${currentImage}')` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            overflow: 'hidden',
            position: 'relative',
            aspectRatio: '1 / 1',
            '&:hover': {
              transform: 'scale(1.02)',
            },
          }}
          onClick={(e) => {
            // If there's an image and onImageClick is provided, show gallery
            if (currentImage && onImageClick) {
              onImageClick();
            } else {
              // Otherwise, open file dialog
              fileInputRef.current?.click();
            }
          }}
        >
          {!currentImage && getInitials(userName)}
        </Box>
      </Badge>
      </Box>
      
      {/* Delete button - positioned next to the avatar using flexbox */}
      {currentImage && onImageDelete && (
        <IconButton
          onClick={handleDeleteClick}
          sx={{
            width: 40,
            height: 40,
            backgroundColor: 'red', // Bright red to make it visible
            color: 'white',
            '&:hover': {
              backgroundColor: 'darkred',
            }
          }}
        >
          <Delete sx={{ fontSize: 20 }} />
        </IconButton>
      )}
    </Box>
  )

  const CoverImageComponent = () => (
    <Box sx={{ 
      position: 'absolute', 
      top: 16, 
      right: -80, // Cover photo buttons positioned differently than profile
      display: 'flex', 
      flexDirection: 'column', 
      gap: 1 
    }}>
      <IconButton
        component="label"
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
      
      {/* Delete button for cover photo */}
      {currentImage && onImageDelete && (
        <IconButton
          onClick={handleDeleteClick}
          sx={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(220, 38, 38, 0.8)',
            },
          }}
        >
          <Delete />
        </IconButton>
      )}
    </Box>
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
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Box
                  component="img"
                  src={preview}
                  alt="Preview"
                  sx={{
                    width: isProfilePicture ? 200 : 'auto',
                    height: isProfilePicture ? 200 : 'auto',
                    maxWidth: isProfilePicture ? 200 : '100%',
                    maxHeight: isProfilePicture ? 200 : 300,
                    minWidth: isProfilePicture ? 200 : 'auto',
                    minHeight: isProfilePicture ? 200 : 'auto',
                    borderRadius: isProfilePicture ? '50%' : 2,
                    objectFit: 'cover',
                    border: '1px solid',
                    borderColor: 'divider',
                    aspectRatio: isProfilePicture ? '1 / 1' : 'auto',
                  }}
                />
              </Box>
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            border: '1px solid #374151',
            borderRadius: 2,
            backdropFilter: 'blur(10px)',
          }
        }}
      >
        <DialogTitle sx={{ color: 'white' }}>
          Delete {isProfilePicture ? 'Profile Picture' : 'Cover Photo'}?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Are you sure you want to delete your {isProfilePicture ? 'profile picture' : 'cover photo'}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleDeleteCancel}
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            variant="contained"
            sx={{
              backgroundColor: '#dc2626',
              '&:hover': {
                backgroundColor: '#b91c1c',
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbars */}
      <Snackbar 
        open={success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(false)} severity="success">
          {isProfilePicture ? 'Profile picture' : 'Cover photo'} updated successfully!
        </Alert>
      </Snackbar>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </>
  )
}