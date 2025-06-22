'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Avatar,
  AvatarGroup,
  Tooltip
} from '@mui/material'
import {
  People as PeopleIcon,
  AccessTime as TimeIcon,
  Language as LanguageIcon,
  PlayArrow as JoinIcon,
  Share as ShareIcon
} from '@mui/icons-material'
import { LanguageSession, SessionService } from '@/services/sessionService'

interface SessionCardProps {
  session: LanguageSession
  onJoinSession: (sessionId: string) => void
  currentUserId?: string
}

export default function SessionCard({ session, onJoinSession, currentUserId }: SessionCardProps) {
  const [joining, setJoining] = useState(false)
  const [shareSuccess, setShareSuccess] = useState(false)

  const handleJoin = async () => {
    setJoining(true)
    try {
      await SessionService.joinSession(session.id)
      onJoinSession(session.id)
    } catch (error) {
      console.error('Failed to join session:', error)
    } finally {
      setJoining(false)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`

    return date.toLocaleDateString()
  }

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'practice': return '#22c55e'
      case 'lesson': return '#f59e0b'
      case 'conversation': return '#6366f1'
      default: return '#6b7280'
    }
  }

  const getSessionTypeLabel = (type: string) => {
    switch (type) {
      case 'practice': return 'Practice'
      case 'lesson': return 'Lesson'
      case 'conversation': return 'Conversation'
      default: return type
    }
  }

  const isCreator = currentUserId === session.created_by
  const isFull = session.participant_count >= session.max_participants

  const handleShare = async () => {
    const sessionUrl = `${window.location.origin}/protected/sessions/${session.id}`
    
    try {
      await navigator.clipboard.writeText(sessionUrl)
      setShareSuccess(true)
      setTimeout(() => setShareSuccess(false), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      // Fallback: show the URL in alert
      alert(`Share this session link:\n${sessionUrl}`)
    }
  }

  return (
    <Card
      sx={{
        backgroundColor: 'rgba(20, 20, 20, 0.6)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: 'rgba(99, 102, 241, 0.5)',
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 32px rgba(99, 102, 241, 0.2)'
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
              {session.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip
                label={getSessionTypeLabel(session.session_type)}
                size="small"
                sx={{
                  backgroundColor: `${getSessionTypeColor(session.session_type)}20`,
                  color: getSessionTypeColor(session.session_type),
                  border: `1px solid ${getSessionTypeColor(session.session_type)}40`,
                  fontSize: '0.75rem'
                }}
              />
              {session.target_language && (
                <Chip
                  icon={<LanguageIcon sx={{ fontSize: 16 }} />}
                  label={session.target_language}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '0.75rem'
                  }}
                />
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title={`${session.participant_count} / ${session.max_participants} participants`}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PeopleIcon sx={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }} />
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {session.participant_count}/{session.max_participants}
                </Typography>
              </Box>
            </Tooltip>
          </Box>
        </Box>

        {/* Description */}
        {session.description && (
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2, lineHeight: 1.5 }}>
            {session.description}
          </Typography>
        )}

        {/* Creator and Time */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Created by
            </Typography>
            <Typography variant="caption" sx={{ color: 'white', fontWeight: 500 }}>
              {session.creator?.name || 'Unknown'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TimeIcon sx={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.6)' }} />
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              {formatTimeAgo(session.created_at)}
            </Typography>
          </Box>
        </Box>

        {/* Participants Preview */}
        {session.participants && session.participants.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Participants:
            </Typography>
            <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.75rem' } }}>
              {session.participants.map((participant) => (
                <Avatar
                  key={participant.id}
                  sx={{
                    backgroundColor: '#6366f1',
                    width: 24,
                    height: 24,
                    fontSize: '0.75rem'
                  }}
                >
                  {participant.user?.name?.charAt(0) || 'U'}
                </Avatar>
              ))}
            </AvatarGroup>
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* Main Action Button */}
          {isCreator ? (
            <Button
              variant="contained"
              fullWidth
              startIcon={<JoinIcon />}
              onClick={() => onJoinSession(session.id)}
              sx={{
                backgroundColor: '#22c55e',
                '&:hover': { backgroundColor: '#16a34a' }
              }}
            >
              Enter Session
            </Button>
          ) : (
            <Button
              variant={isFull ? "outlined" : "contained"}
              fullWidth
              startIcon={<JoinIcon />}
              onClick={handleJoin}
              disabled={joining || isFull}
              sx={{
                backgroundColor: isFull ? 'transparent' : '#6366f1',
                borderColor: isFull ? 'rgba(255, 255, 255, 0.3)' : '#6366f1',
                color: isFull ? 'rgba(255, 255, 255, 0.5)' : 'white',
                '&:hover': {
                  backgroundColor: isFull ? 'rgba(255, 255, 255, 0.1)' : '#5855eb'
                },
                '&:disabled': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.3)'
                }
              }}
            >
              {joining ? 'Joining...' : isFull ? 'Session Full' : 'Join Session'}
            </Button>
          )}
          
          {/* Share Button */}
          <Tooltip title={shareSuccess ? "Link copied!" : "Share session"}>
            <Button
              variant="outlined"
              onClick={handleShare}
              sx={{
                minWidth: 'auto',
                width: 48,
                height: 48,
                borderColor: shareSuccess ? '#22c55e' : 'rgba(255, 255, 255, 0.3)',
                color: shareSuccess ? '#22c55e' : 'rgba(255, 255, 255, 0.7)',
                '&:hover': {
                  borderColor: shareSuccess ? '#16a34a' : 'rgba(255, 255, 255, 0.5)',
                  backgroundColor: shareSuccess ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              <ShareIcon fontSize="small" />
            </Button>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  )
}