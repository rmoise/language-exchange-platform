'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Avatar,
  AvatarGroup,
  Chip,
  Tooltip,
  Alert
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  ExitToApp as LeaveIcon,
  People as PeopleIcon,
  Share as ShareIcon
} from '@mui/icons-material'
import { LanguageSession, SessionParticipant, SessionService } from '@/services/sessionService'
import { useSessionWebSocket } from '@/hooks/useSessionWebSocket'
import ExcalidrawWhiteboard from './components/ExcalidrawWhiteboard'
import SessionChat from './components/SessionChat'

interface SessionRoomProps {
  sessionId: string
  initialSession: LanguageSession
  currentUser: any
}

export default function SessionRoom({ sessionId, initialSession, currentUser }: SessionRoomProps) {
  const router = useRouter()
  const [session, setSession] = useState<LanguageSession>(initialSession)
  const [participants, setParticipants] = useState<SessionParticipant[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  
  // WebSocket handlers
  const handleCanvasOperation = useCallback((operation: any) => {
    // This will be passed to the whiteboard component
    // Canvas operations are handled silently for now
  }, [])

  const handleSessionMessage = useCallback((message: any) => {
    // WebSocket messages are handled silently for now
    
    // Create a properly formatted message
    const formattedMessage = {
      id: message.id || `msg_${Date.now()}_${Math.random()}`,
      session_id: message.session_id || sessionId,
      user_id: message.user_id,
      content: message.content,
      message_type: message.message_type || 'text',
      created_at: message.created_at || new Date().toISOString(),
      user: message.user
    }
    
    // Update local state
    setMessages(prev => [...prev, formattedMessage])
  }, [sessionId])

  const handleUserJoined = useCallback((user: { id: string; name: string }) => {
    console.log('User joined:', user)
    // Optionally reload participants or show notification
    loadParticipants()
  }, [])

  const handleUserLeft = useCallback((user: { id: string; name: string }) => {
    console.log('User left:', user)
    // Optionally reload participants or show notification
    loadParticipants()
  }, [])

  // Initialize WebSocket connection
  const {
    isConnected,
    sendCanvasOperation,
    sendSessionMessage,
    connectionError: wsError,
    reconnect
  } = useSessionWebSocket({
    sessionId,
    currentUser,
    onCanvasOperation: handleCanvasOperation,
    onSessionMessage: handleSessionMessage,
    onUserJoined: handleUserJoined,
    onUserLeft: handleUserLeft
  })

  useEffect(() => {
    const initializeSession = async () => {
      // First load participants to check current status
      const freshParticipants = await loadParticipants()
      
      // Check if user is already a participant using fresh data
      const isParticipant = freshParticipants?.some(p => p.user_id === currentUser?.id) || 
                           session.participants?.some(p => p.user_id === currentUser?.id)
      
      if (!isParticipant) {
        // User needs to join first
        await joinSession()
      } else {
        // User is already a participant, load messages directly
        loadMessages()
      }
    }
    
    initializeSession()
  }, [sessionId])

  const loadParticipants = async () => {
    try {
      const participantData = await SessionService.getSessionParticipants(sessionId)
      setParticipants(participantData)
      return participantData
    } catch (err: any) {
      console.error('Failed to load participants:', err)
      return null
    }
  }

  const loadMessages = async () => {
    try {
      const sessionMessages = await SessionService.getSessionMessages(sessionId)
      setMessages(sessionMessages || [])
    } catch (err: any) {
      console.error('Failed to load messages:', err)
      // For 403, silently continue with empty messages - user will get new messages via WebSocket
      if (err.response?.status === 403) {
        console.log('No access to historical messages, starting with empty chat')
        setMessages([])
      } else {
        setError(err.response?.data?.message || 'Failed to load messages')
      }
    }
  }

  const joinSession = async () => {
    try {
      await SessionService.joinSession(sessionId)
      await loadParticipants()
      // Try to load messages after joining
      loadMessages()
    } catch (err: any) {
      console.error('Failed to join session:', err)
      
      if (err.response?.status === 410) {
        setError('This session has ended or is no longer available')
        // Redirect to sessions list after a short delay
        setTimeout(() => {
          router.push('/protected/sessions')
        }, 3000)
      } else if (err.response?.status === 403) {
        setError('You do not have permission to join this session')
      } else if (err.response?.status === 404) {
        setError('Session not found')
        // Redirect to sessions list after a short delay
        setTimeout(() => {
          router.push('/protected/sessions')
        }, 3000)
      } else {
        setError(err.response?.data?.message || 'Failed to join session')
      }
    }
  }

  const handleLeaveSession = async () => {
    setLoading(true)
    try {
      await SessionService.leaveSession(sessionId)
      router.push('/protected/sessions')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to leave session')
      setLoading(false)
    }
  }

  const handleEndSession = async () => {
    if (!confirm('Are you sure you want to end this session? This cannot be undone.')) {
      return
    }
    
    setLoading(true)
    try {
      await SessionService.endSession(sessionId)
      router.push('/protected/sessions')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to end session')
      setLoading(false)
    }
  }

  const isCreator = currentUser?.id === session.created_by

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      bgcolor: '#0f0f0f',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000
    }}>
      {/* Header */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          backgroundColor: 'rgba(20, 20, 20, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
        }}
      >
        <Toolbar>
          <IconButton 
            edge="start" 
            onClick={() => router.push('/protected/sessions')}
            sx={{ mr: 2, color: 'white' }}
          >
            <BackIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
              {session.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Chip
                label={session.session_type}
                size="small"
                sx={{
                  backgroundColor: 'rgba(99, 102, 241, 0.2)',
                  color: '#a5b4fc',
                  fontSize: '0.75rem'
                }}
              />
              {session.target_language && (
                <Chip
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

          {/* Participants */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
            <Tooltip title="Participants">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PeopleIcon sx={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.7)' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {participants?.length || 0}
                </Typography>
              </Box>
            </Tooltip>
            
            <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 32, height: 32, fontSize: '0.875rem' } }}>
              {participants?.map((participant) => (
                <Tooltip key={participant.id} title={participant.user?.name || 'Unknown'}>
                  <Avatar
                    sx={{ 
                      backgroundColor: participant.role === 'creator' ? '#22c55e' : '#6366f1',
                      width: 32,
                      height: 32,
                      fontSize: '0.875rem',
                      border: participant.user_id === currentUser?.id ? '2px solid #f59e0b' : 'none'
                    }}
                  >
                    {participant.user?.name?.charAt(0) || 'U'}
                  </Avatar>
                </Tooltip>
              )) || []}
            </AvatarGroup>
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Share session link">
              <IconButton 
                sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                onClick={async () => {
                  const sessionUrl = `${window.location.origin}/protected/sessions/${sessionId}`
                  
                  try {
                    await navigator.clipboard.writeText(sessionUrl)
                    // You could add a toast notification here if you have one
                    console.log('Session link copied to clipboard')
                  } catch (error) {
                    console.error('Failed to copy to clipboard:', error)
                    // Fallback: show the URL in a temporary alert
                    const message = `Share this link:\n${sessionUrl}`
                    alert(message)
                  }
                }}
              >
                <ShareIcon />
              </IconButton>
            </Tooltip>
            
            {isCreator ? (
              <Button
                variant="outlined"
                size="small"
                onClick={handleEndSession}
                disabled={loading}
                sx={{
                  color: '#ef4444',
                  borderColor: '#ef4444',
                  '&:hover': {
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderColor: '#ef4444'
                  }
                }}
              >
                End Session
              </Button>
            ) : (
              <Button
                variant="outlined"
                size="small"
                startIcon={<LeaveIcon />}
                onClick={handleLeaveSession}
                disabled={loading}
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.5)'
                  }
                }}
              >
                Leave
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Error Alert */}
      {(error || wsError) && (
        <Alert 
          severity="error" 
          onClose={() => {
            setError(null)
            if (wsError) reconnect()
          }}
          sx={{ 
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            color: 'white',
            '& .MuiAlert-icon': { color: '#ef4444' }
          }}
          action={
            wsError && (
              <Button 
                color="inherit" 
                size="small" 
                onClick={reconnect}
                sx={{ color: 'white' }}
              >
                Reconnect
              </Button>
            )
          }
        >
          {error || wsError}
        </Alert>
      )}

      {/* Connection Status */}
      {!isConnected && !wsError && (
        <Alert 
          severity="info"
          sx={{ 
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            color: 'white',
            '& .MuiAlert-icon': { color: '#2196f3' }
          }}
        >
          Connecting to session...
        </Alert>
      )}

      {/* Main Content Area */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        overflow: 'hidden',
        height: 'calc(100vh - 80px)' // Account for header height
      }}>
        {/* Whiteboard Area */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          borderRight: '1px solid rgba(255, 255, 255, 0.15)',
          overflow: 'hidden'
        }}>
          <Box sx={{ 
            p: 2, 
            borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
            backgroundColor: 'rgba(20, 20, 20, 0.5)',
            flexShrink: 0
          }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 500 }}>
              Interactive Whiteboard
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Use the toolbar to draw, write text, and collaborate in real-time
            </Typography>
          </Box>
          
          <Box sx={{ 
            flex: 1, 
            position: 'relative',
            overflow: 'hidden',
            minHeight: 0
          }}>
            <ExcalidrawWhiteboard 
              sessionId={sessionId}
              currentUser={currentUser}
              onCanvasOperation={handleCanvasOperation}
              onSendCanvasOperation={sendCanvasOperation}
            />
          </Box>
        </Box>

        {/* Chat Sidebar */}
        <Box sx={{ 
          width: 350, 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: 'rgba(10, 10, 10, 0.8)'
        }}>
          <SessionChat 
            sessionId={sessionId}
            currentUser={currentUser}
            participants={participants}
            messages={messages}
            onSendMessage={sendSessionMessage}
          />
        </Box>
      </Box>
    </Box>
  )
}