'use client'

import { useState, useRef } from 'react'
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
import { CameraAlt, Close, Upload } from '@mui/icons-material'

interface ImageUploadProps {
  currentImage?: string
  userName: string
  size?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number }
  isProfilePicture?: boolean
}

export default function ImageUpload({ 
  currentImage, 
  userName, 
  size = 168,
  isProfilePicture = true 
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const selectedFileRef = useRef<File | null>(null)

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
      
      // This would be your actual API call
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
        credentials: 'include', // Include cookies for auth
      })
      
      if (!response.ok) {
        throw new Error('Failed to upload image')
      }
      
      const result = await response.json()
      console.log('Upload successful:', result)
      
      setSuccess(true)
      setOpen(false)
      setPreview(null)
      selectedFileRef.current = null
      
      // Reload the page to show the new image
      setTimeout(() => {
        window.location.reload()
      }, 1000)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image')
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

  const ProfileImageComponent = () => (
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
        sx={{
          width: typeof size === 'number' ? size : size,
          height: typeof size === 'number' ? size : size,
          borderRadius: '50%',
          border: { xs: '4px solid', sm: '6px solid' },
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
          backgroundImage: currentImage ? `url(${currentImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.02)',
          },
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        {!currentImage && getInitials(userName)}
      </Box>
    </Badge>
  )

  const CoverImageComponent = () => (
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
          <Typography variant="h6">
            {isProfilePicture ? 'Update Profile Picture' : 'Update Cover Photo'}
          </Typography>
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