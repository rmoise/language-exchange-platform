'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Divider,
  Chip,
  Paper,
  Badge,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material'
import {
  Send as SendIcon,
  MoreVert as MoreIcon,
  Person as PersonIcon,
  Circle as OnlineIcon
} from '@mui/icons-material'
import { SessionParticipant, SessionService } from '@/services/sessionService'
import { SwipeTranslateSessionMessage } from './SwipeTranslateSessionMessage'

interface Message {
  id: string
  session_id: string
  user_id: string
  content: string
  message_type: 'text' | 'system'
  created_at: string
  user?: {
    id: string
    name: string
    email: string
  }
}

interface SessionChatProps {
  sessionId: string
  currentUser: any
  participants: SessionParticipant[]
  messages: Message[]
  onSendMessage?: (content: string) => void
}

export default function SessionChat({ 
  sessionId, 
  currentUser, 
  participants, 
  messages,
  onSendMessage 
}: SessionChatProps) {
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [participantsMenuAnchor, setParticipantsMenuAnchor] = useState<null | HTMLElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    scrollToBottom()
  }, [messages])

  // Scroll to bottom on component mount
  useEffect(() => {
    scrollToBottom()
  }, [])

  const scrollToBottom = () => {
    // Use a small delay to ensure DOM has updated
    setTimeout(() => {
      // Only scroll the messages container, not the entire page
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
      }
    }, 100)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || loading) return

    const messageContent = newMessage.trim()
    setNewMessage('')
    setLoading(true)

    try {
      if (onSendMessage) {
        // Send via WebSocket
        onSendMessage(messageContent)
      } else {
        // Fallback to API
        await SessionService.sendMessage(sessionId, {
          message_text: messageContent,
          message_type: 'text'
        })
      }
    } catch (err: any) {
      console.error('Failed to send message:', err)
      setNewMessage(messageContent) // Restore message on error
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendAndScroll(e)
    }
  }

  // Scroll to bottom after sending a message
  const handleSendAndScroll = async (e: React.FormEvent) => {
    await handleSendMessage(e)
    // Force scroll after message is sent
    setTimeout(() => scrollToBottom(), 200)
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {}
    
    messages.forEach(message => {
      const dateKey = formatDate(message.created_at)
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(message)
    })
    
    return groups
  }

  const messageGroups = groupMessagesByDate(messages)
  const onlineParticipants = participants?.filter(p => p.is_active) || []

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      borderLeft: '1px solid rgba(255, 255, 255, 0.15)'
    }}>
      {/* Chat Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
        backgroundColor: 'rgba(20, 20, 20, 0.5)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 500 }}>
            Session Chat
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Badge 
              badgeContent={onlineParticipants.length} 
              color="success"
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: '#22c55e',
                  color: 'white'
                }
              }}
            >
              <IconButton
                size="small"
                onClick={(e) => setParticipantsMenuAnchor(e.currentTarget)}
                sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
              >
                <PersonIcon />
              </IconButton>
            </Badge>
          </Box>
        </Box>
      </Box>

      {/* Messages Area */}
      <Box 
        ref={messagesContainerRef}
        sx={{ 
          flex: 1, 
          overflowY: 'auto',
          p: 1,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '3px',
          },
        }}
      >
        {Object.entries(messageGroups).map(([date, dateMessages]) => (
          <Box key={date}>
            {/* Date Separator */}
            <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
              <Divider sx={{ flex: 1, borderColor: 'rgba(255, 255, 255, 0.2)' }} />
              <Chip
                label={date}
                size="small"
                sx={{
                  mx: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.75rem'
                }}
              />
              <Divider sx={{ flex: 1, borderColor: 'rgba(255, 255, 255, 0.2)' }} />
            </Box>

            {/* Messages for this date */}
            {dateMessages.map((message, index) => {
              const isCurrentUser = message.user_id === currentUser?.id
              const prevMessage = index > 0 ? dateMessages[index - 1] : null
              const showAvatar = !prevMessage || prevMessage.user_id !== message.user_id || message.message_type === 'system'

              return (
                <SwipeTranslateSessionMessage
                  key={message.id}
                  message={message}
                  isCurrentUser={isCurrentUser}
                  showAvatar={showAvatar}
                  formatTime={formatTime}
                  enableTranslation={true}
                />
              )
            })}
          </Box>
        ))}
        
        {messages.length === 0 && (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.5)'
          }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              💬 No messages yet
            </Typography>
            <Typography variant="caption">
              Start the conversation!
            </Typography>
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      <Box sx={{ 
        p: 2, 
        borderTop: '1px solid rgba(255, 255, 255, 0.15)',
        backgroundColor: 'rgba(20, 20, 20, 0.5)'
      }}>
        <Box
          component="form"
          onSubmit={handleSendAndScroll}
          sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}
        >
          <TextField
            fullWidth
            multiline
            maxRows={3}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={loading}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                borderRadius: 2,
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#6366f1',
                },
              },
              '& .MuiOutlinedInput-input': {
                color: 'white',
                '&::placeholder': {
                  color: 'rgba(255, 255, 255, 0.5)',
                  opacity: 1,
                },
              },
            }}
          />
          <IconButton
            type="submit"
            disabled={!newMessage.trim() || loading}
            sx={{
              backgroundColor: '#6366f1',
              color: 'white',
              '&:hover': {
                backgroundColor: '#5855eb',
              },
              '&:disabled': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Participants Menu */}
      <Menu
        anchorEl={participantsMenuAnchor}
        open={Boolean(participantsMenuAnchor)}
        onClose={() => setParticipantsMenuAnchor(null)}
        sx={{
          '& .MuiPaper-root': {
            backgroundColor: 'rgba(30, 30, 30, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 2,
            minWidth: 200
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.15)' }}>
          <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
            Participants ({participants?.length || 0})
          </Typography>
        </Box>
        {participants?.map((participant) => (
          <MenuItem
            key={participant.id}
            sx={{
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Avatar
                sx={{
                  width: 24,
                  height: 24,
                  mr: 2,
                  backgroundColor: participant.role === 'creator' ? '#22c55e' : '#6366f1',
                  fontSize: '0.75rem'
                }}
              >
                {participant.user?.name?.charAt(0) || 'U'}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2">
                  {participant.user?.name || 'Unknown'}
                  {participant.user_id === currentUser?.id && ' (You)'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  {participant.role}
                </Typography>
              </Box>
              {participant.is_active && (
                <Tooltip title="Online">
                  <OnlineIcon 
                    sx={{ 
                      fontSize: 8, 
                      color: '#22c55e',
                      ml: 1
                    }} 
                  />
                </Tooltip>
              )}
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )
}