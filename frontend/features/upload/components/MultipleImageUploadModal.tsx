'use client'

import { useState, useRef, useCallback } from 'react'
import { 
  Button,
  Typography,
  Box,
  IconButton,
  CircularProgress,
  Alert,
  Grid,
  Checkbox,
  FormControlLabel,
  Collapse,
  Stack,
  Divider,
} from '@mui/material'
import { 
  PhotoCamera, 
  Upload, 
  Delete, 
  CheckBox,
  CheckBoxOutlineBlank,
  Close as CloseIcon,
} from '@mui/icons-material'
import { api } from '@/utils/api'
import SharedModal from '@/components/ui/SharedModal'

interface MultipleImageUploadModalProps {
  open: boolean
  onClose: () => void
  onImagesUpdate: (imageUrls: string[]) => void
  maxFiles?: number
  title?: string
  existingPhotos?: string[]
  onDeletePhoto?: (photoUrl: string) => void
}

interface FilePreview {
  file: File
  preview: string
  id: string
}

export default function MultipleImageUploadModal({ 
  open, 
  onClose, 
  onImagesUpdate,
  maxFiles = 6,
  title = 'Upload Photos',
  existingPhotos = [],
  onDeletePhoto
}: MultipleImageUploadModalProps) {
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())
  const [selectedNewPhotos, setSelectedNewPhotos] = useState<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    if (selectedFiles.length === 0) return

    const remainingSlots = maxFiles - existingPhotos.length - filePreviews.length
    if (selectedFiles.length > remainingSlots) {
      setError(`You can only add ${remainingSlots} more photo${remainingSlots !== 1 ? 's' : ''}`)
      return
    }

    const newPreviews: FilePreview[] = []
    
    selectedFiles.forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select only image files')
        return
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('Each image must be less than 5MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const preview: FilePreview = {
          file,
          preview: e.target?.result as string,
          id: `${file.name}-${Date.now()}-${Math.random()}`
        }
        newPreviews.push(preview)
        
        if (newPreviews.length === selectedFiles.length) {
          setFilePreviews(prev => [...prev, ...newPreviews])
          // Automatically select newly uploaded photos
          setSelectedNewPhotos(prev => {
            const newSet = new Set(prev)
            newPreviews.forEach(preview => newSet.add(preview.id))
            return newSet
          })
          setError(null)
        }
      }
      reader.readAsDataURL(file)
    })

    // Clear the input
    if (event.target) {
      event.target.value = ''
    }
  }

  const handleRemoveFile = (id: string) => {
    setFilePreviews(prev => prev.filter(fp => fp.id !== id))
    setSelectedNewPhotos(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }
  
  const handleTogglePhotoSelection = (photo: string) => {
    setSelectedPhotos(prev => {
      const newSet = new Set(prev)
      if (newSet.has(photo)) {
        newSet.delete(photo)
      } else {
        newSet.add(photo)
      }
      return newSet
    })
  }
  
  const handleToggleNewPhotoSelection = (id: string) => {
    setSelectedNewPhotos(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }
  
  const handleSelectAll = () => {
    if (selectedPhotos.size === existingPhotos.length && selectedNewPhotos.size === filePreviews.length) {
      setSelectedPhotos(new Set())
      setSelectedNewPhotos(new Set())
    } else {
      setSelectedPhotos(new Set(existingPhotos))
      setSelectedNewPhotos(new Set(filePreviews.map(fp => fp.id)))
    }
  }
  
  const handleDeleteSelected = () => {
    // Delete new photos immediately without confirmation
    if (selectedNewPhotos.size > 0) {
      setFilePreviews(prev => prev.filter(fp => !selectedNewPhotos.has(fp.id)))
      setSelectedNewPhotos(new Set())
    }
    
    // Show confirmation only for existing photos
    if (selectedPhotos.size > 0) {
      setDeleteConfirmationOpen(true)
    }
  }

  const handleUpload = async () => {
    if (selectedNewPhotos.size === 0) return

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      // Only upload selected photos
      filePreviews
        .filter(fp => selectedNewPhotos.has(fp.id))
        .forEach(fp => {
          formData.append('images', fp.file)
        })
      formData.append('type', 'gallery')

      const response = await api.post('/upload/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data?.urls) {
        onImagesUpdate(response.data.urls)
        handleClose()
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.response?.data?.error || 'Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    setFilePreviews([])
    setError(null)
    setSelectedPhotos(new Set())
    setSelectedNewPhotos(new Set())
    setDeleteConfirmationOpen(false)
    onClose()
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const droppedFiles = Array.from(e.dataTransfer.files)
    if (droppedFiles.length === 0) return

    // Create a synthetic event to reuse handleFileSelect logic
    const syntheticEvent = {
      target: {
        files: droppedFiles
      }
    } as React.ChangeEvent<HTMLInputElement>
    
    handleFileSelect(syntheticEvent)
  }, [filePreviews.length, maxFiles])

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDeleteConfirm = () => {
    // Delete selected existing photos
    if (onDeletePhoto) {
      selectedPhotos.forEach(photo => {
        onDeletePhoto(photo)
      })
    }
    
    // Clear selections and close confirmation
    setSelectedPhotos(new Set())
    setDeleteConfirmationOpen(false)
  }

  const handleDeleteCancel = () => {
    setDeleteConfirmationOpen(false)
  }

  const totalSelected = selectedPhotos.size + selectedNewPhotos.size
  const totalPhotos = existingPhotos.length + filePreviews.length

  const actions = (
    <>
      <Button 
        onClick={handleClose} 
        disabled={uploading}
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
        onClick={handleUpload} 
        variant="contained"
        disabled={uploading || selectedNewPhotos.size === 0}
        startIcon={uploading && <CircularProgress size={20} />}
        sx={{
          backgroundColor: '#6366f1',
          '&:hover': {
            backgroundColor: '#5558e3',
          },
          '&:disabled': {
            backgroundColor: 'rgba(99, 102, 241, 0.3)',
          }
        }}
      >
        {uploading ? 'Uploading...' : `Upload ${selectedNewPhotos.size > 0 ? selectedNewPhotos.size : ''} Photo${selectedNewPhotos.size === 1 ? '' : 's'}`}
      </Button>
    </>
  )

  return (
    <SharedModal
      open={open}
      onClose={handleClose}
      title={title}
      maxWidth="sm"
      actions={actions}
      contentSx={{
        maxHeight: '70vh',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {filePreviews.length < maxFiles - existingPhotos.length && !deleteConfirmationOpen && (
        <Box
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          sx={{
            border: '2px dashed rgba(255, 255, 255, 0.3)',
            borderRadius: 2,
            p: 2,
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: '#6366f1',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
            },
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload sx={{ fontSize: 32, color: 'rgba(255, 255, 255, 0.5)', mb: 0.5 }} />
          <Typography variant="body2" sx={{ color: 'white', mb: 0.5 }}>
            Click to select or drag and drop images
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            {maxFiles - existingPhotos.length - filePreviews.length} slots remaining • Max 5MB per image
          </Typography>
        </Box>
      )}

      {filePreviews.length > 0 && (
        <Box sx={{ mt: existingPhotos.length > 0 ? 2 : 1.5 }}>
          {/* Fixed Header for New Photos */}
          <Box
            sx={{
              position: 'sticky',
              top: -16,
              zIndex: 10,
              mx: -2.5,
              mb: 1.5,
            }}
          >
            <Box
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(10px)',
                px: 2.5,
                pt: 1,
                pb: 1.5,
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Typography variant="body2" sx={{ color: 'white', fontWeight: 500, mb: 1 }}>
                New Photos ({filePreviews.length}) - Not Saved Yet
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedNewPhotos.size === filePreviews.length && filePreviews.length > 0}
                      indeterminate={selectedNewPhotos.size > 0 && selectedNewPhotos.size < filePreviews.length}
                      onChange={() => {
                        if (selectedNewPhotos.size === filePreviews.length) {
                          setSelectedNewPhotos(new Set())
                        } else {
                          setSelectedNewPhotos(new Set(filePreviews.map(fp => fp.id)))
                        }
                      }}
                      size="small"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        padding: '4px',
                        '&.Mui-checked': {
                          color: '#6366f1',
                        },
                        '&.MuiCheckbox-indeterminate': {
                          color: '#6366f1',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.75rem' }}>
                      Select all ({selectedNewPhotos.size}/{filePreviews.length})
                    </Typography>
                  }
                  sx={{ ml: 0 }}
                />
              </Box>
            </Box>
          </Box>
          <Grid container spacing={1}>
            {filePreviews.map((fp) => (
              <Grid item xs={4} key={fp.id}>
                <Box
                  onClick={() => handleToggleNewPhotoSelection(fp.id)}
                  sx={{
                    position: 'relative',
                    aspectRatio: '1',
                    borderRadius: 1,
                    overflow: 'hidden',
                    border: '3px solid',
                    borderColor: selectedNewPhotos.has(fp.id) ? '#818cf8' : 'transparent',
                    boxShadow: selectedNewPhotos.has(fp.id) ? '0 0 0 2px rgba(129, 140, 248, 0.3)' : 'none',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: selectedNewPhotos.has(fp.id) ? '#818cf8' : 'rgba(99, 102, 241, 0.3)',
                    }
                  }}
                >
                  <Box
                    component="img"
                    src={fp.preview}
                    alt={fp.file.name}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      opacity: selectedNewPhotos.has(fp.id) ? 0.7 : 1,
                      transition: 'opacity 0.2s',
                    }}
                  />
                  <Checkbox
                    checked={selectedNewPhotos.has(fp.id)}
                    icon={<CheckBoxOutlineBlank />}
                    checkedIcon={<CheckBox />}
                    sx={{
                      position: 'absolute',
                      top: 2,
                      left: 2,
                      padding: 0.5,
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      },
                      '&.Mui-checked': {
                        color: 'white',
                      },
                      '& .MuiSvgIcon-root': {
                        fontSize: 20,
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleNewPhotoSelection(fp.id)
                    }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Existing Photos */}
      {existingPhotos.length > 0 && (
        <Box sx={{ mt: filePreviews.length > 0 ? 2 : 1.5 }}>
          {/* Fixed Header with Select All and Delete Confirmation */}
          <Box
            sx={{
              position: 'sticky',
              top: -16, // Offset for dialog content padding
              zIndex: 10,
              mx: -2.5, // Extend to edges of modal content
              mb: 1.5,
            }}
          >
            {/* Header Section */}
            <Box
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(10px)',
                px: 2.5,
                pt: 1,
                pb: 1.5,
                borderBottom: deleteConfirmationOpen ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Typography variant="body2" sx={{ color: 'white', fontWeight: 500, mb: 1 }}>
                Current Photos ({existingPhotos.length})
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedPhotos.size === existingPhotos.length && existingPhotos.length > 0}
                      indeterminate={selectedPhotos.size > 0 && selectedPhotos.size < existingPhotos.length}
                      onChange={() => {
                        if (selectedPhotos.size === existingPhotos.length) {
                          setSelectedPhotos(new Set())
                        } else {
                          setSelectedPhotos(new Set(existingPhotos))
                        }
                      }}
                      size="small"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        padding: '4px',
                        '&.Mui-checked': {
                          color: '#6366f1',
                        },
                        '&.MuiCheckbox-indeterminate': {
                          color: '#6366f1',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.75rem' }}>
                      Select all ({selectedPhotos.size}/{existingPhotos.length})
                    </Typography>
                  }
                  sx={{ ml: 0 }}
                />
                {selectedPhotos.size > 0 && (
                  <Button
                    onClick={handleDeleteSelected}
                    variant="contained"
                    size="small"
                    sx={{
                      backgroundColor: '#ef4444',
                      '&:hover': {
                        backgroundColor: '#dc2626',
                      },
                      fontSize: '0.75rem',
                      textTransform: 'none',
                      fontWeight: 500,
                      px: 1.5,
                      py: 0.5,
                      minHeight: 'auto',
                    }}
                  >
                    Delete {selectedPhotos.size} photo{selectedPhotos.size === 1 ? '' : 's'}
                  </Button>
                )}
              </Box>
            </Box>
            
            {/* Delete Confirmation Expandable - Attached to Header */}
            <Collapse in={deleteConfirmationOpen}>
              <Box
                sx={{
                  px: 2.5,
                  py: 1.5,
                  backgroundColor: '#991b1b', // Solid dark red background
                  borderBottom: '1px solid #dc2626',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                }}
              >
              <Stack spacing={1.5}>
                {/* Header with close button */}
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography
                    sx={{
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                    }}
                  >
                    Delete {selectedPhotos.size} photo{selectedPhotos.size === 1 ? '' : 's'}?
                  </Typography>
                  <IconButton
                    onClick={handleDeleteCancel}
                    size="small"
                    sx={{
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      },
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Stack>

                {/* Confirmation message */}
                <Typography
                  sx={{
                    color: 'white',
                    fontSize: '0.8rem',
                    lineHeight: 1.4,
                  }}
                >
                  Are you sure you want to delete {selectedPhotos.size} photo{selectedPhotos.size === 1 ? '' : 's'}? This action cannot be undone.
                </Typography>

                {/* Action buttons */}
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    onClick={handleDeleteCancel}
                    size="small"
                    sx={{
                      color: 'white',
                      minWidth: 70,
                      height: 28,
                      fontSize: '0.8rem',
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                    }}
                    variant="outlined"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteConfirm}
                    variant="contained"
                    size="small"
                    sx={{
                      backgroundColor: '#dc2626',
                      minWidth: 70,
                      height: 28,
                      fontSize: '0.8rem',
                      '&:hover': {
                        backgroundColor: '#b91c1c',
                      },
                    }}
                  >
                    Delete
                  </Button>
                </Stack>
              </Stack>
              </Box>
            </Collapse>
          </Box>
          
          <Grid container spacing={1}>
            {existingPhotos.map((photo, index) => (
              <Grid item xs={4} key={`existing-${index}`}>
                <Box
                  onClick={() => handleTogglePhotoSelection(photo)}
                  sx={{
                    position: 'relative',
                    aspectRatio: '1',
                    borderRadius: 1,
                    overflow: 'hidden',
                    border: '3px solid',
                    borderColor: selectedPhotos.has(photo) ? '#818cf8' : 'transparent',
                    boxShadow: selectedPhotos.has(photo) ? '0 0 0 2px rgba(129, 140, 248, 0.3)' : 'none',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: selectedPhotos.has(photo) ? '#818cf8' : 'rgba(99, 102, 241, 0.3)',
                    }
                  }}
                >
                  <Box
                    component="img"
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      opacity: selectedPhotos.has(photo) ? 0.7 : 1,
                      transition: 'opacity 0.2s',
                    }}
                  />
                  <Checkbox
                    checked={selectedPhotos.has(photo)}
                    icon={<CheckBoxOutlineBlank />}
                    checkedIcon={<CheckBox />}
                    sx={{
                      position: 'absolute',
                      top: 2,
                      left: 2,
                      padding: 0.5,
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      },
                      '&.Mui-checked': {
                        color: 'white',
                      },
                      '& .MuiSvgIcon-root': {
                        fontSize: 20,
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleTogglePhotoSelection(photo)
                    }}
                  />
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation()
                      // Select only this photo and open delete confirmation
                      setSelectedPhotos(new Set([photo]))
                      setSelectedNewPhotos(new Set()) // Clear new photo selections
                      setDeleteConfirmationOpen(true)
                    }}
                    sx={{
                      position: 'absolute',
                      top: 38, // 2px (top position of checkbox) + 20px (checkbox size) + 8px (checkbox padding) + 8px (gap)
                      left: 2,
                      padding: 0.5,
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      }
                    }}
                    size="small"
                  >
                    <Delete sx={{ fontSize: 20 }} />
                  </IconButton>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        multiple
      />
    </SharedModal>
  )
}