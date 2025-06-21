'use client'

import { useState } from 'react'
import { Box, Modal, IconButton, Typography } from '@mui/material'
import { 
  Close as CloseIcon,
  ArrowBackIos as ArrowBackIosIcon,
  ArrowForwardIos as ArrowForwardIosIcon
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
      gap: 1
    }}>
      {photos.map((photo, index) => (
        <Box 
          key={index} 
          onClick={() => onPhotoClick(index)}
          sx={{
            aspectRatio: '1',
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
              width: '100%',
              height: '100%',
              objectFit: 'cover'
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
}

export function PhotoCarouselModal({ photos, currentIndex, open, onClose }: PhotoCarouselModalProps) {
  const [activeIndex, setActiveIndex] = useState(currentIndex)

  const goToPrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setActiveIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
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
        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: -50,
            right: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            zIndex: 2,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.8)'
            }
          }}
        >
          <CloseIcon />
        </IconButton>

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
          width: photos.length === 1 ? '60vw' : '80vw',
          height: photos.length === 1 ? '60vh' : '80vh',
          maxWidth: photos.length === 1 ? '500px' : '800px',
          maxHeight: photos.length === 1 ? '500px' : '600px'
        }}>
          <Box
            component="img"
            src={photos[activeIndex]}
            alt=""
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
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
                    objectFit: 'cover'
                  }}
                />
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Modal>
  )
}