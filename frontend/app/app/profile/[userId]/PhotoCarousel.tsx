'use client'

import { useState, useEffect } from 'react'
import { Box, Modal, IconButton, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material'
import { 
  Close as CloseIcon,
  ArrowBackIos as ArrowBackIosIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
  Delete as DeleteIcon
} from '@mui/icons-material'

interface PhotoCarouselProps {
  photos: string[]
  onPhotoClick: (index: number) => void
}

export function PhotoGrid({ photos, onPhotoClick }: PhotoCarouselProps) {
  return (
    <Box sx={{ 
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 1,
      width: '100%'
    }}>
      {photos.map((photo, index) => (
        <Box 
          key={index} 
          onClick={() => onPhotoClick(index)}
          sx={{
            aspectRatio: '1/1',
            width: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            borderRadius: 1,
            overflow: 'hidden',
            position: 'relative',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'scale(1.02)',
              borderColor: 'rgba(255, 255, 255, 0.4)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            }
          }}
        >
          <Box
            component="img"
            src={photo}
            alt=""
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'center'
            }}
          />
        </Box>
      ))}
    </Box>
  )
}

interface PhotoCarouselModalProps {
  photos: string[]
  currentIndex: number
  open: boolean
  onClose: () => void
  onDelete?: (photoUrl: string) => void
  canDelete?: boolean
  buttonPosition?: {
    top?: number | string
    right?: number | string
    left?: number | string
  }
}

export function PhotoCarouselModal({ 
  photos, 
  currentIndex, 
  open, 
  onClose, 
  onDelete, 
  canDelete = false,
  buttonPosition = { top: 8, left: 'calc(100% - 8px)' }
}: PhotoCarouselModalProps) {
  const [activeIndex, setActiveIndex] = useState(currentIndex)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Sync activeIndex with currentIndex prop when it changes
  useEffect(() => {
    setActiveIndex(currentIndex)
  }, [currentIndex])

  const goToPrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setActiveIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
  }

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (onDelete && photos[activeIndex]) {
      const photoToDelete = photos[activeIndex]
      
      // If this is the last photo, close the modal
      if (photos.length === 1) {
        onClose()
      } else {
        // Move to previous photo if possible, otherwise stay at same index
        if (activeIndex > 0) {
          setActiveIndex(activeIndex - 1)
        }
      }
      
      onDelete(photoToDelete)
      setDeleteDialogOpen(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      goToPrevious()
    } else if (event.key === 'ArrowRight') {
      goToNext()
    } else if (event.key === 'Escape') {
      onClose()
    }
  }

  return (
    <>
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
      onKeyDown={handleKeyDown}
    >
      <Box sx={{
        position: 'relative',
        maxWidth: '90vw',
        maxHeight: '90vh',
        outline: 'none'
      }}>
        {/* Close and Delete Buttons */}
        <Box sx={{
          position: 'absolute',
          top: buttonPosition.top,
          left: buttonPosition.left,
          right: buttonPosition.right,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          zIndex: 2,
        }}>
          <IconButton
            onClick={onClose}
            sx={{
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.8)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
          
          {/* Delete Button - positioned below X */}
          {canDelete && onDelete && (
            <IconButton
              onClick={handleDeleteClick}
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(220, 38, 38, 0.8)',
                }
              }}
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>

        {/* Image Counter - only show for multiple photos */}
        {photos.length > 1 && (
          <Box sx={{
            position: 'absolute',
            top: -50,
            left: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            px: 2,
            py: 1,
            borderRadius: 1,
            zIndex: 2
          }}>
            <Typography variant="body2">
              {activeIndex + 1} of {photos.length}
            </Typography>
          </Box>
        )}

        {/* Main Image */}
        <Box sx={{
          position: 'relative',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          width: '80vw',
          height: '80vh',
          maxWidth: '800px',
          maxHeight: '600px'
        }}>
          <Box
            component="img"
            src={photos[activeIndex]}
            alt=""
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block'
            }}
          />


          {/* Previous Button */}
          {photos.length > 1 && (
            <IconButton
              onClick={goToPrevious}
              sx={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)'
                }
              }}
            >
              <ArrowBackIosIcon />
            </IconButton>
          )}

          {/* Next Button */}
          {photos.length > 1 && (
            <IconButton
              onClick={goToNext}
              sx={{
                position: 'absolute',
                right: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)'
                }
              }}
            >
              <ArrowForwardIosIcon />
            </IconButton>
          )}
        </Box>

        {/* Thumbnail Strip */}
        {photos.length > 1 && (
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 1,
            mt: 2,
            flexWrap: 'wrap'
          }}>
            {photos.map((photo, index) => (
              <Box
                key={index}
                onClick={() => setActiveIndex(index)}
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: 1,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: index === activeIndex ? '2px solid #6366f1' : '2px solid transparent',
                  opacity: index === activeIndex ? 1 : 0.7,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    opacity: 1,
                    transform: 'scale(1.05)'
                  }
                }}
              >
                <Box
                  component="img"
                  src={photo}
                  alt=""
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                />
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Modal>

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
        Delete Photo?
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
          Are you sure you want to delete this photo? This action cannot be undone.
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
    </>
  )
}