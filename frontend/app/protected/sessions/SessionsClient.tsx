'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Alert,
  Fab,
  Card,
  CardContent,
  Skeleton,
  Grid
} from '@mui/material'
import {
  Add as AddIcon,
  VideoCall as VideoIcon,
  People as PeopleIcon,
  History as HistoryIcon
} from '@mui/icons-material'
import { LanguageSession, SessionService } from '@/services/sessionService'
import CreateSessionDialog from '@/components/sessions/CreateSessionDialog'
import SessionCard from '@/components/sessions/SessionCard'

interface SessionsClientProps {
  currentUser: any
}

export default function SessionsClient({ currentUser }: SessionsClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(0)
  const [sessions, setSessions] = useState<LanguageSession[]>([])
  const [mySessions, setMySessions] = useState<LanguageSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  useEffect(() => {
    loadSessions()
  }, [activeTab])

  const loadSessions = async () => {
    setLoading(true)
    setError(null)
    
    try {
      if (activeTab === 0) {
        // Load active sessions
        const activeSessions = await SessionService.getActiveSessions(20)
        setSessions(activeSessions)
      } else {
        // Load user's sessions and filter out ended ones
        const userSessions = await SessionService.getUserSessions()
        // Filter to only show active sessions to prevent 410 errors
        const activeUserSessions = userSessions.filter(session => session.status === 'active')
        setMySessions(activeUserSessions)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const handleSessionCreated = (sessionId: string) => {
    // Navigate to the new session
    router.push(`/protected/sessions/${sessionId}`)
  }

  const handleJoinSession = (sessionId: string) => {
    router.push(`/protected/sessions/${sessionId}`)
  }

  const SessionSkeleton = () => (
    <Card sx={{ 
      backgroundColor: 'rgba(20, 20, 20, 0.6)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      borderRadius: 2
    }}>
      <CardContent sx={{ p: 3 }}>
        <Skeleton variant="text" width="80%" height={32} sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
        <Box sx={{ display: 'flex', gap: 1, my: 2 }}>
          <Skeleton variant="rounded" width={80} height={24} sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
          <Skeleton variant="rounded" width={100} height={24} sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
        </Box>
        <Skeleton variant="text" width="100%" height={20} sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
        <Skeleton variant="text" width="70%" height={20} sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
        <Skeleton variant="rounded" width="100%" height={40} sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', mt: 2 }} />
      </CardContent>
    </Card>
  )

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 300, mb: 2, color: "white" }}
        >
          Language Sessions
        </Typography>
        <Typography variant="body1" sx={{ color: "#9ca3af", mb: 3 }}>
          Join collaborative sessions with interactive whiteboards and real-time chat
        </Typography>
      </Box>
        
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Box sx={{
            backgroundColor: 'rgba(20, 20, 20, 0.6)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 1.5,
            p: 2,
            textAlign: 'center'
          }}>
            <VideoIcon sx={{ fontSize: 32, color: '#6366f1', mb: 1 }} />
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
              Interactive
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Whiteboard & Chat
            </Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Box sx={{
            backgroundColor: 'rgba(20, 20, 20, 0.6)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 1.5,
            p: 2,
            textAlign: 'center'
          }}>
            <PeopleIcon sx={{ fontSize: 32, color: '#22c55e', mb: 1 }} />
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
              Collaborative
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Real-time Learning
            </Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Box sx={{
            backgroundColor: 'rgba(20, 20, 20, 0.6)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 1.5,
            p: 2,
            textAlign: 'center'
          }}>
            <HistoryIcon sx={{ fontSize: 32, color: '#f59e0b', mb: 1 }} />
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
              Persistent
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Saved Sessions
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#6366f1',
            },
            '& .MuiTab-root': {
              color: '#9ca3af',
              '&.Mui-selected': {
                color: '#6366f1',
              },
            },
          }}
        >
          <Tab label="Browse Sessions" />
          <Tab label="My Sessions" />
        </Tabs>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            color: 'white',
            '& .MuiAlert-icon': { color: '#ef4444' }
          }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={loadSessions}
              sx={{ color: 'white' }}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Sessions Content */}
      {activeTab === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 500 }}>
              Active Sessions
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{
                backgroundColor: '#6366f1',
                '&:hover': { backgroundColor: '#5855eb' }
              }}
            >
              Create Session
            </Button>
          </Box>

          {loading ? (
            <Grid container spacing={3} columns={12}>
              {[...Array(6)].map((_, index) => (
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={index}>
                  <SessionSkeleton />
                </Grid>
              ))}
            </Grid>
          ) : sessions.length > 0 ? (
            <Grid container spacing={3} columns={12}>
              {sessions.map((session) => (
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={session.id}>
                  <SessionCard
                    session={session}
                    onJoinSession={handleJoinSession}
                    currentUserId={currentUser?.id}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography sx={{ fontSize: '3rem', mb: 2 }}>🎯</Typography>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 500, color: 'white', mb: 1 }}>
                No active sessions
              </Typography>
              <Typography sx={{ color: '#9ca3af', mb: 3 }}>
                Be the first to create a language learning session
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
                sx={{
                  backgroundColor: '#6366f1',
                  '&:hover': { backgroundColor: '#5855eb' }
                }}
              >
                Create First Session
              </Button>
            </Box>
          )}
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 500, mb: 3 }}>
            My Sessions
          </Typography>

          {loading ? (
            <Grid container spacing={3} columns={12}>
              {[...Array(4)].map((_, index) => (
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={index}>
                  <SessionSkeleton />
                </Grid>
              ))}
            </Grid>
          ) : mySessions.length > 0 ? (
            <Grid container spacing={3} columns={12}>
              {mySessions.map((session) => (
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={session.id}>
                  <SessionCard
                    session={session}
                    onJoinSession={handleJoinSession}
                    currentUserId={currentUser?.id}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography sx={{ fontSize: '3rem', mb: 2 }}>📚</Typography>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 500, color: 'white', mb: 1 }}>
                No sessions yet
              </Typography>
              <Typography sx={{ color: '#9ca3af', mb: 3 }}>
                Create your first session or join an existing one
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
                sx={{
                  backgroundColor: '#6366f1',
                  '&:hover': { backgroundColor: '#5855eb' }
                }}
              >
                Create Session
              </Button>
            </Box>
          )}
        </Box>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="create session"
        onClick={() => setCreateDialogOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: '#6366f1',
          '&:hover': { backgroundColor: '#5855eb' }
        }}
      >
        <AddIcon />
      </Fab>

      {/* Create Session Dialog */}
      <CreateSessionDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSessionCreated={handleSessionCreated}
      />
    </Box>
  )
}