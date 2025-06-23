'use client'

import { useState, useRef } from 'react'
import { Box, Typography, Chip, Avatar, IconButton } from '@mui/material'
import {
  LocationOn as LocationIcon,
  Star as StarIcon,
  Language as LanguageIcon,
  Info as InfoIcon
} from '@mui/icons-material'

interface User {
  id: string
  name: string
  age?: number
  location: string
  profileImage?: string
  nativeLanguages: string[]
  targetLanguages: string[]
  bio: string
  interests: string[]
  rating?: number
  matchPercentage: number
  distance?: number
}

interface SwipeCardProps {
  users: User[]
}

export default function SwipeCard({ users }: SwipeCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const currentUser = users[currentIndex]

  if (!currentUser) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        textAlign: 'center'
      }}>
        <Typography sx={{ fontSize: '3rem', mb: 2 }}>🎉</Typography>
        <Typography sx={{ fontSize: '1.25rem', fontWeight: 600, color: 'white', mb: 1 }}>
          No more partners to show
        </Typography>
        <Typography sx={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
          Check back later or adjust your filters
        </Typography>
      </Box>
    )
  }

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true)
    const startX = clientX
    const startY = clientY

    const handleMove = (currentX: number, currentY: number) => {
      if (!isDragging) return
      let deltaX = currentX - startX
      const deltaY = currentY - startY

      // Limit horizontal movement to prevent going beyond sidebar
      const constraints = getSwipeConstraints()
      deltaX = Math.max(constraints.maxLeft, Math.min(constraints.maxRight, deltaX))

      setDragOffset({ x: deltaX, y: deltaY })
    }

    const handleEnd = () => {
      setIsDragging(false)

      // Check if swiped far enough
      if (Math.abs(dragOffset.x) > 100) {
        nextCard()
      }

      setDragOffset({ x: 0, y: 0 })
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY)
    const handleMouseUp = () => handleEnd()
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      handleMove(e.touches[0].clientX, e.touches[0].clientY)
    }
    const handleTouchEnd = () => handleEnd()

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    handleStart(e.clientX, e.clientY)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    handleStart(e.touches[0].clientX, e.touches[0].clientY)
  }

  const nextCard = () => {
    if (currentIndex < users.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
    setShowInfo(false)
  }

  const getRotation = () => {
    return dragOffset.x * 0.1 // Slight rotation based on horizontal drag
  }

  const getSwipeDirection = () => {
    if (dragOffset.x > 50) return 'right'
    if (dragOffset.x < -50) return 'left'
    return null
  }

  const getSwipeConstraints = () => {
    const container = cardRef.current?.parentElement
    if (!container) return { maxRight: 300, maxLeft: -300 }

    const containerRect = container.getBoundingClientRect()
    const maxRight = containerRect.width * 0.7 // Stop at 70% of container width
    const maxLeft = -containerRect.width * 0.7

    return { maxRight, maxLeft }
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', minHeight: 400 }}>
      {/* Main Card */}
      <Box
        ref={cardRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: 2,
          overflow: 'hidden',
          cursor: isDragging ? 'grabbing' : 'grab',
          transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${getRotation()}deg)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease',
          backgroundImage: `url(${currentUser.profileImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          minHeight: 400,
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%)',
          }
        }}
      >
        {/* Swipe Indicators */}
        {getSwipeDirection() === 'right' && (
          <Box sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            backgroundColor: 'rgba(34, 197, 94, 0.9)',
            color: 'white',
            px: 2,
            py: 1,
            borderRadius: 1,
            fontWeight: 600,
            fontSize: '0.875rem',
            transform: `rotate(-${getRotation()}deg)`,
          }}>
            LIKE
          </Box>
        )}

        {getSwipeDirection() === 'left' && (
          <Box sx={{
            position: 'absolute',
            top: 20,
            left: 20,
            backgroundColor: 'rgba(239, 68, 68, 0.9)',
            color: 'white',
            px: 2,
            py: 1,
            borderRadius: 1,
            fontWeight: 600,
            fontSize: '0.875rem',
            transform: `rotate(${getRotation()}deg)`,
          }}>
            PASS
          </Box>
        )}

        {/* Match Percentage */}
        <Box sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          backgroundColor: 'rgba(59, 130, 246, 0.9)',
          color: 'white',
          px: 1.5,
          py: 0.5,
          borderRadius: 1,
          fontSize: '0.75rem',
          fontWeight: 600,
          zIndex: 2
        }}>
          {currentUser.matchPercentage}% Match
        </Box>

        {/* Info Button */}
        <IconButton
          onClick={() => setShowInfo(!showInfo)}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            color: 'white',
            width: 36,
            height: 36,
            zIndex: 2,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
            }
          }}
        >
          <InfoIcon sx={{ fontSize: 18 }} />
        </IconButton>

        {/* Card Content */}
        <Box sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          p: 3,
          color: 'white',
          zIndex: 1
        }}>
          <Typography sx={{ fontSize: '1.75rem', fontWeight: 600, mb: 0.5 }}>
            {currentUser.name}{currentUser.age ? `, ${currentUser.age}` : ''}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
            <LocationIcon sx={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.8)' }} />
            <Typography sx={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.8)' }}>
              {currentUser.location}
              {currentUser.distance !== undefined && (
                <span style={{ color: '#06b6d4', fontWeight: 500 }}>
                  {' '}• {currentUser.distance}km away
                </span>
              )}
            </Typography>
          </Box>

          {currentUser.rating && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
              <StarIcon sx={{ fontSize: 16, color: '#fbbf24' }} />
              <Typography sx={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                {currentUser.rating}
              </Typography>
            </Box>
          )}

          {!showInfo ? (
            <>
              <Typography sx={{ fontSize: '0.875rem', mb: 2, lineHeight: 1.4 }}>
                {currentUser.bio}
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {currentUser.interests.slice(0, 3).map((interest) => (
                  <Chip
                    key={interest}
                    label={interest}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      fontSize: '0.75rem'
                    }}
                  />
                ))}
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, mb: 1 }}>
                  Native Languages
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {currentUser.nativeLanguages.map((lang) => (
                    <Chip
                      key={lang}
                      label={lang}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(34, 197, 94, 0.2)',
                        color: '#4ade80',
                        fontSize: '0.75rem'
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Box>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, mb: 1 }}>
                  Learning Languages
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {currentUser.targetLanguages.map((lang) => (
                    <Chip
                      key={lang}
                      label={lang}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        color: '#60a5fa',
                        fontSize: '0.75rem'
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Next Card Preview */}
      {currentIndex < users.length - 1 && (
        <Box sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: 2,
          transform: 'scale(0.95) translateY(10px)',
          opacity: 0.7,
          zIndex: -1,
          backgroundImage: `url(${users[currentIndex + 1].profileImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: 400,
          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%)',
          }
        }} />
      )}
    </Box>
  )
}