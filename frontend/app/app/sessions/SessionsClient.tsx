'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Tabs,
  Tab
} from '@mui/material'
import {
  Add as AddIcon,
  VideoCall as VideoIcon,
  People as PeopleIcon,
  CalendarToday,
  ScreenShare,
  Settings,
  Home,
  Chat,
  Contacts,
  History as HistoryIcon,
  MoreHoriz,
  AccessTime,
  Notifications,
  Search,
  AccountCircle,
  Language,
  Schedule,
  Group,
  TrendingUp,
  PlayArrow,
  Refresh,
  Upcoming,
  History
} from '@mui/icons-material'
import { LanguageSession, SessionService } from '@/services/sessionService'
import { CreateSessionModal } from './CreateSessionModal'
import { useColorScheme } from '@mui/material/styles'

interface SessionsClientProps {
  currentUser: any
}

export default function SessionsClient({ currentUser }: SessionsClientProps) {
  const router = useRouter()
  const { mode } = useColorScheme()
  const darkMode = mode === 'dark'
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState('')
  const [recentSessions, setRecentSessions] = useState<LanguageSession[]>([])
  const [activeSessionTab, setActiveSessionTab] = useState(0)

  useEffect(() => {
    loadRecentSessions()
  }, [])

  const loadRecentSessions = async () => {
    try {
      const userSessions = await SessionService.getUserSessions()
      setRecentSessions(userSessions.slice(0, 5)) // Show last 5 sessions
    } catch (err) {
      console.error('Failed to load recent sessions:', err)
    }
  }

  const handleSessionCreated = async (session: any) => {
    await new Promise(resolve => setTimeout(resolve, 1500))
    router.push(`/app/sessions/${session.id || 'new'}`)
  }


  const getCurrentTime = () => {
    const now = new Date()
    return now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const getCurrentDate = () => {
    const now = new Date()
    return now.toLocaleDateString('en-US', { 
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: 'transparent',
      color: 'white',
      p: 4
    }}>
      {/* Hero Section */}
      <Box sx={{ 
        textAlign: 'center',
        mb: 6,
        py: 4
      }}>
        <Typography variant="h1" sx={{ 
          fontSize: '4rem',
          fontWeight: 200,
          color: 'white',
          mb: 2,
          letterSpacing: '-0.02em'
        }}>
          {getCurrentTime()}
        </Typography>
        <Typography variant="h5" sx={{ 
          color: '#94a3b8',
          fontWeight: 300,
          mb: 4
        }}>
          {getCurrentDate()}
        </Typography>
        
        {/* Main CTA */}
        <Card sx={{ 
          maxWidth: 600,
          mx: 'auto',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
          border: 'none',
          borderRadius: '24px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 32px 64px rgba(99, 102, 241, 0.4)'
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
            pointerEvents: 'none'
          }
        }} onClick={() => setCreateDialogOpen(true)}>
          <CardContent sx={{ 
            p: 6,
            textAlign: 'center'
          }}>
            <Box sx={{ 
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              backdropFilter: 'blur(10px)'
            }}>
              <AddIcon sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography variant="h3" sx={{ 
              fontWeight: 600, 
              color: 'white',
              mb: 2
            }}>
              Start New Session
            </Typography>
            <Typography variant="h6" sx={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 300,
              lineHeight: 1.6
            }}>
              Create an interactive language learning session with real-time collaboration
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Content Grid */}
      <Box sx={{
        maxWidth: 1200,
        mx: 'auto'
      }}>
        <Box>
          {/* Session Tabs */}
          <Box sx={{ mb: 6 }}>
            <Tabs
              value={activeSessionTab}
              onChange={(e, newValue) => setActiveSessionTab(newValue)}
              sx={{
                mb: 4,
                '& .MuiTabs-indicator': {
                  backgroundColor: '#6366f1',
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
                '& .MuiTab-root': {
                  color: '#94a3b8',
                  fontSize: '1.1rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  minWidth: 'auto',
                  px: 0,
                  mr: 4,
                  '&.Mui-selected': {
                    color: '#6366f1',
                    fontWeight: 600,
                  },
                },
              }}
            >
              <Tab label="Upcoming Sessions" />
              <Tab label="Recent Sessions" />
            </Tabs>
            
            {/* Tab Content */}
            {activeSessionTab === 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[
                  { 
                    title: 'Spanish Conversation Practice', 
                    time: 'Tomorrow, 2:00 PM', 
                    duration: '1 hour',
                    language: 'ES',
                    participants: 3,
                    type: 'Group Session'
                  },
                  { 
                    title: 'French Grammar Workshop', 
                    time: 'Dec 30, 10:00 AM', 
                    duration: '45 minutes',
                    language: 'FR',
                    participants: 2,
                    type: '1-on-1 Session'
                  },
                  { 
                    title: 'German Pronunciation Class', 
                    time: 'Jan 2, 3:30 PM', 
                    duration: '30 minutes',
                    language: 'DE',
                    participants: 5,
                    type: 'Group Session'
                  }
                ].map((session, index) => (
                  <Card key={index} sx={{ 
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    p: 1.5,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.08)',
                      borderColor: 'rgba(99, 102, 241, 0.3)',
                      transform: 'translateY(-2px)'
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ 
                        width: 32,
                        height: 32,
                        backgroundColor: '#6366f1',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.9rem'
                      }}>
                        {session.language}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" sx={{ 
                          fontWeight: 600, 
                          color: 'white',
                          mb: 0.25,
                          fontSize: '0.95rem'
                        }}>
                          {session.title}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: '#94a3b8',
                          mb: 0.5,
                          fontSize: '0.8rem'
                        }}>
                          {session.time} • {session.duration}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            size="small"
                            label={session.type}
                            sx={{ 
                              backgroundColor: 'rgba(99, 102, 241, 0.2)',
                              color: '#a5b4fc',
                              fontSize: '0.65rem',
                              height: 20
                            }}
                          />
                          <Typography variant="caption" sx={{ 
                            color: '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.25,
                            fontSize: '0.7rem'
                          }}>
                            <PeopleIcon sx={{ fontSize: 12 }} />
                            {session.participants}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ 
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: '#f59e0b'
                      }} />
                    </Box>
                  </Card>
                ))}
                
                {/* No upcoming sessions state */}
                <Card sx={{ 
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(10px)',
                  border: '2px dashed rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  p: 3,
                  textAlign: 'center'
                }}>
                  <Typography sx={{ fontSize: '2rem', mb: 1.5 }}>📅</Typography>
                  <Typography variant="body1" sx={{ 
                    fontWeight: 600, 
                    color: 'white',
                    mb: 0.75,
                    fontSize: '1rem'
                  }}>
                    All caught up!
                  </Typography>
                  <Typography sx={{ 
                    color: '#94a3b8',
                    mb: 2,
                    fontSize: '0.85rem'
                  }}>
                    No more upcoming sessions scheduled
                  </Typography>
                  <Button sx={{ 
                    color: '#6366f1',
                    fontWeight: 500,
                    textTransform: 'none',
                    fontSize: '0.85rem'
                  }}>
                    Schedule New Session
                  </Button>
                </Card>
              </Box>
            )}

            {activeSessionTab === 1 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[
                  { title: 'English Practice', time: '2:30 PM', status: 'completed', language: 'EN', date: 'Today' },
                  { title: 'Spanish Grammar', time: '4:00 PM', status: 'completed', language: 'ES', date: 'Yesterday' },
                  { title: 'French Conversation', time: '10:00 AM', status: 'completed', language: 'FR', date: '2 days ago' },
                  { title: 'German Pronunciation', time: '3:30 PM', status: 'completed', language: 'DE', date: '3 days ago' }
                ].map((session, index) => (
                  <Card key={index} sx={{ 
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    p: 1.5,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.06)',
                      borderColor: 'rgba(99, 102, 241, 0.3)',
                      transform: 'translateX(4px)'
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ 
                        width: 28,
                        height: 28,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        color: '#94a3b8',
                        fontWeight: 600,
                        fontSize: '0.8rem'
                      }}>
                        {session.language}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" sx={{ 
                          fontWeight: 600, 
                          color: 'white',
                          mb: 0.25,
                          fontSize: '0.9rem'
                        }}>
                          {session.title}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: '#94a3b8',
                          fontSize: '0.8rem'
                        }}>
                          {session.date} at {session.time}
                        </Typography>
                      </Box>
                      <Chip 
                        size="small"
                        label="Completed"
                        sx={{ 
                          backgroundColor: 'rgba(34, 197, 94, 0.2)',
                          color: '#86efac',
                          fontSize: '0.65rem',
                          height: 20
                        }}
                      />
                    </Box>
                  </Card>
                ))}
                
                <Button sx={{ 
                  color: '#6366f1',
                  fontWeight: 500,
                  textTransform: 'none',
                  fontSize: '1rem',
                  py: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(99, 102, 241, 0.1)'
                  }
                }}>
                  View All Sessions
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Create Session Modal */}
      <CreateSessionModal
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        onCreateSession={handleSessionCreated}
        darkMode={true}
      />
    </Box>
  )
}