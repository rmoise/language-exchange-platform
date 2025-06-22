'use client'

import { useState, useRef, useCallback } from 'react'
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material'
import { Close, PhotoCamera, Upload } from '@mui/icons-material'
import { api } from '@/utils/api'

interface ImageUploadModalProps {
  open: boolean
  onClose: () => void
  onImageUpdate: (imageUrl: string) => void
  imageType?: 'profile' | 'cover' | 'gallery'
  title?: string
}

export default function ImageUploadModal({ 
  open, 
  onClose, 
  onImageUpdate,
  imageType = 'gallery',
  title = 'Upload Photo'
}: ImageUploadModalProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    setError(null)
    setFile(selectedFile)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('type', imageType)

      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data?.data?.url) {
        onImageUpdate(response.data.data.url)
        handleClose()
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.response?.data?.error || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    setPreview(null)
    setFile(null)
    setError(null)
    onClose()
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      const changeEvent = {
        target: {
          files: [droppedFile]
        }
      } as unknown as React.ChangeEvent<HTMLInputElement>
      handleFileSelect(changeEvent)
    }
  }, [])

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: theme => theme.palette.mode === 'dark' ? '#1a1a1a' : '#fff',
          backgroundImage: theme => theme.palette.mode === 'dark' ? 'none' : 'none',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        {title}
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!preview ? (
          <Box
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            sx={{
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover'
              }
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <PhotoCamera sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Click to upload or drag and drop
            </Typography>
            <Typography variant="body2" color="text.secondary">
              JPG, PNG, GIF up to 5MB
            </Typography>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            <Box
              component="img"
              src={preview}
              alt="Preview"
              sx={{
                maxWidth: '100%',
                maxHeight: 400,
                borderRadius: 2,
                objectFit: 'contain',
                width: '100%',
                mx: 'auto',
                display: 'block',
                mb: 2
              }}
            />
            <Button
              variant="outlined"
              onClick={() => {
                setPreview(null)
                setFile(null)
                fileInputRef.current?.click()
              }}
              disabled={uploading}
            >
              Choose Different Image
            </Button>
          </Box>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={uploading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!file || uploading}
          startIcon={uploading ? <CircularProgress size={20} /> : <Upload />}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}