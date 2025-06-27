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
  Tooltip,
  Stack
} from '@mui/material'
import {
  People as PeopleIcon,
  AccessTime as TimeIcon,
  Language as LanguageIcon,
  PlayArrow as JoinIcon,
  Share as ShareIcon,
  School,
  Chat,
  Forum
} from '@mui/icons-material'
import { LanguageSession, SessionService } from '@/services/sessionService'
import { useTheme as useCustomTheme } from '@/contexts/ThemeContext'

interface SessionCardProps {
  session: LanguageSession
  onJoinSession: (sessionId: string) => void
  currentUserId?: string
}

export default function SessionCard({ session, onJoinSession, currentUserId }: SessionCardProps) {
  const { mode } = useCustomTheme()
  const darkMode = mode === 'dark'
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

  const getSessionTypeConfig = (type: string) => {
    switch (type) {
      case 'practice': 
        return { 
          color: '#6366f1', 
          label: 'Practice', 
          icon: <Chat sx={{ fontSize: 16 }} /> 
        }
      case 'lesson': 
        return { 
          color: '#22c55e', 
          label: 'Lesson', 
          icon: <School sx={{ fontSize: 16 }} /> 
        }
      case 'conversation': 
        return { 
          color: '#f59e0b', 
          label: 'Conversation', 
          icon: <Forum sx={{ fontSize: 16 }} /> 
        }
      default: 
        return { 
          color: '#6b7280', 
          label: type, 
          icon: <Chat sx={{ fontSize: 16 }} /> 
        }
    }
  }

  const isCreator = currentUserId === session.created_by
  const isFull = session.participant_count >= session.max_participants

  const handleShare = async () => {
    const sessionUrl = `${window.location.origin}/app/sessions/${session.id}`
    
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

  const typeConfig = getSessionTypeConfig(session.session_type)

  return (
    <Card
      sx={{
        backgroundColor: darkMode ? 'rgba(30, 30, 30, 0.5)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid',
        borderColor: darkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        boxShadow: darkMode
          ? '0 20px 40px -12px rgba(0, 0, 0, 0.3)'
          : '0 20px 40px -12px rgba(0, 0, 0, 0.08)',
        '&:hover': {
          borderColor: darkMode ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)',
          transform: 'translateY(-4px)',
          boxShadow: darkMode 
            ? '0 12px 32px rgba(99, 102, 241, 0.25)'
            : '0 12px 32px rgba(99, 102, 241, 0.15)'
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ 
              color: darkMode ? 'white' : '#1a1a1a', 
              fontWeight: 600, 
              mb: 1,
              fontSize: '1.1rem'
            }}>
              {session.name}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                icon={typeConfig.icon}
                label={typeConfig.label}
                size="small"
                sx={{
                  backgroundColor: `${typeConfig.color}15`,
                  color: typeConfig.color,
                  border: `1px solid ${typeConfig.color}30`,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  '& .MuiChip-icon': {
                    color: typeConfig.color
                  }
                }}
              />
              {session.target_language && (
                <Chip
                  icon={<LanguageIcon sx={{ fontSize: 16 }} />}
                  label={session.target_language}
                  size="small"
                  sx={{
                    backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    color: darkMode ? 'white' : '#1a1a1a',
                    fontSize: '0.75rem'
                  }}
                />
              )}
            </Stack>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title={`${session.participant_count} / ${session.max_participants} participants`}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5,
                px: 1.5,
                py: 0.5,
                borderRadius: '20px',
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
              }}>
                <PeopleIcon sx={{ fontSize: 16, color: darkMode ? 'rgba(255, 255, 255, 0.7)' : '#6b7280' }} />
                <Typography variant="caption" sx={{ 
                  color: darkMode ? 'rgba(255, 255, 255, 0.7)' : '#6b7280',
                  fontWeight: 600 
                }}>
                  {session.participant_count}/{session.max_participants}
                </Typography>
              </Box>
            </Tooltip>
          </Box>
        </Box>

        {/* Description */}
        {session.description && (
          <Typography variant="body2" sx={{ 
            color: darkMode ? 'rgba(255, 255, 255, 0.8)' : '#4b5563', 
            mb: 2, 
            lineHeight: 1.6 
          }}>
            {session.description}
          </Typography>
        )}

        {/* Creator and Time */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ 
              width: 24, 
              height: 24, 
              fontSize: '0.75rem',
              backgroundColor: '#6366f1' 
            }}>
              {session.creator?.name?.charAt(0) || 'U'}
            </Avatar>
            <Typography variant="caption" sx={{ 
              color: darkMode ? 'rgba(255, 255, 255, 0.7)' : '#6b7280', 
              fontWeight: 500 
            }}>
              {session.creator?.name || 'Unknown'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TimeIcon sx={{ fontSize: 14, color: darkMode ? 'rgba(255, 255, 255, 0.6)' : '#9ca3af' }} />
            <Typography variant="caption" sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.6)' : '#9ca3af' }}>
              {formatTimeAgo(session.created_at)}
            </Typography>
          </Box>
        </Box>

        {/* Participants Preview */}
        {session.participants && session.participants.length > 0 && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5, 
            mb: 3,
            p: 1.5,
            borderRadius: '12px',
            backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
          }}>
            <Typography variant="caption" sx={{ 
              color: darkMode ? 'rgba(255, 255, 255, 0.6)' : '#6b7280',
              fontWeight: 500 
            }}>
              Active now:
            </Typography>
            <AvatarGroup max={4} sx={{ 
              '& .MuiAvatar-root': { 
                width: 28, 
                height: 28, 
                fontSize: '0.8rem',
                border: `2px solid ${darkMode ? '#0f0f0f' : '#fff'}` 
              } 
            }}>
              {session.participants.map((participant) => (
                <Avatar
                  key={participant.id}
                  sx={{
                    backgroundColor: '#6366f1',
                    width: 28,
                    height: 28,
                    fontSize: '0.8rem'
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
                borderRadius: '8px',
                py: 1.2,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' 
                }
              }}
            >
              Enter Your Session
            </Button>
          ) : (
            <Button
              variant={isFull ? "outlined" : "contained"}
              fullWidth
              startIcon={<JoinIcon />}
              onClick={handleJoin}
              disabled={joining || isFull}
              sx={{
                borderRadius: '8px',
                py: 1.2,
                fontWeight: 600,
                ...(isFull ? {
                  backgroundColor: 'transparent',
                  borderColor: darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
                  color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                  '&:hover': {
                    backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
                  }
                } : {
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5558d9 0%, #7c4ed8 100%)'
                  }
                }),
                '&:disabled': {
                  backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  color: darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
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
                borderRadius: '8px',
                borderColor: shareSuccess ? '#22c55e' : (darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)'),
                color: shareSuccess ? '#22c55e' : (darkMode ? 'rgba(255, 255, 255, 0.7)' : '#6b7280'),
                '&:hover': {
                  borderColor: shareSuccess ? '#16a34a' : (darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.3)'),
                  backgroundColor: shareSuccess 
                    ? 'rgba(34, 197, 94, 0.1)' 
                    : (darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)')
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