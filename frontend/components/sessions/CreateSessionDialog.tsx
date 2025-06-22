'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Chip,
  Alert,
  Avatar,
  ListItemIcon,
  ListItemText,
  ListItemAvatar
} from '@mui/material'
import { PersonAdd as PersonAddIcon } from '@mui/icons-material'
import { CreateSessionInput, SessionService } from '@/services/sessionService'
import { MatchService, Match } from '@/features/matches/matchService'

interface CreateSessionDialogProps {
  open: boolean
  onClose: () => void
  onSessionCreated: (sessionId: string) => void
}

const SESSION_TYPES = [
  { value: 'practice', label: 'Practice Session', description: 'Casual language practice' },
  { value: 'lesson', label: 'Lesson', description: 'Structured learning session' },
  { value: 'conversation', label: 'Conversation', description: 'Free conversation practice' }
]

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 
  'Russian', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi'
]

export default function CreateSessionDialog({ open, onClose, onSessionCreated }: CreateSessionDialogProps) {
  const [formData, setFormData] = useState<CreateSessionInput>({
    name: '',
    description: '',
    max_participants: 2,
    session_type: 'practice',
    target_language: '',
    invited_user_id: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdSession, setCreatedSession] = useState<{ id: string; name: string; invited_user?: { name: string } } | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [loadingMatches, setLoadingMatches] = useState(false)

  // Load matches when dialog opens
  useEffect(() => {
    if (open) {
      loadMatches()
    }
  }, [open])

  const loadMatches = async () => {
    setLoadingMatches(true)
    try {
      const userMatches = await MatchService.getMatches()
      setMatches(Array.isArray(userMatches) ? userMatches : [])
    } catch (error) {
      console.error('Failed to load matches:', error)
      setMatches([]) // Set empty array on error
    } finally {
      setLoadingMatches(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setError('Session name is required')
      return
    }
    if (!formData.invited_user_id) {
      setError('Please select a match to invite')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const session = await SessionService.createSession({
        ...formData,
        description: formData.description || undefined,
        target_language: formData.target_language || undefined,
        invited_user_id: formData.invited_user_id
      })
      
      // Find invited user info for success message
      const matchWithUser = matches.find(match => 
        match.user1.id === formData.invited_user_id || match.user2.id === formData.invited_user_id
      )
      const invitedUser = matchWithUser?.user1.id === formData.invited_user_id 
        ? matchWithUser.user1 
        : matchWithUser?.user2
      
      // Show success screen
      setCreatedSession({ 
        id: session.id, 
        name: formData.name,
        invited_user: { name: invitedUser?.name || 'Unknown' }
      })
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create session')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
      setError(null)
      setCreatedSession(null)
      // Reset form
      setFormData({
        name: '',
        description: '',
        max_participants: 2,
        session_type: 'practice',
        target_language: '',
        invited_user_id: ''
      })
    }
  }

  const handleJoinSession = () => {
    if (!createdSession) return
    onSessionCreated(createdSession.id)
    handleClose()
  }

  const getOtherUser = (match: Match, currentUserId?: string) => {
    // For now, we'll use the first user if we don't have currentUserId
    // In a real app, you'd get this from the auth context
    if (!match || !match.user1) return null
    // If we had currentUserId, we'd return the other user
    // For now, just return user1 (assuming they're not the current user)
    return match.user1
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'rgba(20, 20, 20, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 2
        }
      }}
    >
      {!createdSession ? (
        // Session Creation Form
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ color: 'white', pb: 1 }}>
            <Box>
              <Box component="div" sx={{ fontWeight: 500, fontSize: '1.5rem', lineHeight: 1.334 }}>
                Create Language Session
              </Box>
              <Box component="div" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 1, fontSize: '0.875rem' }}>
                Start a private language learning session with one of your matches
              </Box>
            </Box>
          </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, backgroundColor: 'rgba(244, 67, 54, 0.1)' }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Session Name */}
            <TextField
              label="Session Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
              placeholder="e.g., Spanish Conversation Practice"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#6366f1' }
                },
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                '& .MuiInputBase-input': { color: 'white' }
              }}
            />

            {/* Description */}
            <TextField
              label="Description (Optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
              placeholder="What will you be practicing or learning?"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#6366f1' }
                },
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                '& .MuiInputBase-input': { color: 'white' }
              }}
            />

            {/* Session Type */}
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Session Type</InputLabel>
              <Select
                value={formData.session_type}
                onChange={(e) => setFormData({ ...formData, session_type: e.target.value as any })}
                label="Session Type"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1' },
                  '& .MuiSelect-select': { color: 'white' },
                  '& .MuiSvgIcon-root': { color: 'rgba(255, 255, 255, 0.7)' }
                }}
              >
                {SESSION_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box>
                      <Typography variant="body1">{type.label}</Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                        {type.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* Max Participants */}
              <TextField
                label="Max Participants"
                type="number"
                value={formData.max_participants}
                onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) || 2 })}
                inputProps={{ min: 2, max: 10 }}
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#6366f1' }
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                  '& .MuiInputBase-input': { color: 'white' }
                }}
              />

              {/* Target Language */}
              <FormControl sx={{ flex: 2 }}>
                <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Target Language (Optional)</InputLabel>
                <Select
                  value={formData.target_language}
                  onChange={(e) => setFormData({ ...formData, target_language: e.target.value })}
                  label="Target Language (Optional)"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1' },
                    '& .MuiSelect-select': { color: 'white' },
                    '& .MuiSvgIcon-root': { color: 'rgba(255, 255, 255, 0.7)' }
                  }}
                >
                  <MenuItem value="">
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>No specific language</Typography>
                  </MenuItem>
                  {LANGUAGES.map((language) => (
                    <MenuItem key={language} value={language}>
                      {language}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Invite Match */}
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Select a Match to Invite</InputLabel>
              <Select
                value={formData.invited_user_id}
                onChange={(e) => setFormData({ ...formData, invited_user_id: e.target.value })}
                label="Select a Match to Invite"
                disabled={loadingMatches}
                required
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1' },
                  '& .MuiSelect-select': { color: 'white' },
                  '& .MuiSvgIcon-root': { color: 'rgba(255, 255, 255, 0.7)' }
                }}
              >
                {matches && Array.isArray(matches) && matches.length > 0 ? (
                  matches.map((match) => {
                  const otherUser = getOtherUser(match)
                  if (!otherUser) return null
                  return (
                    <MenuItem key={match.id} value={otherUser.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 32, height: 32, backgroundColor: '#6366f1' }}>
                          {otherUser.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ color: 'white' }}>
                            {otherUser.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                            {otherUser.nativeLanguages?.join(', ') || 'N/A'} → {otherUser.targetLanguages?.join(', ') || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  )
                  }).filter(Boolean)
                ) : (
                  !loadingMatches && (
                    <MenuItem value="" disabled>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', fontStyle: 'italic' }}>
                        No matches available
                      </Typography>
                    </MenuItem>
                  )
                )}
              </Select>
              {(!matches || matches.length === 0) && !loadingMatches && (
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', mt: 1 }}>
                  You need at least one match to create a session. Find language partners in the search page first.
                </Typography>
              )}
              {loadingMatches && (
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', mt: 1 }}>
                  Loading your matches...
                </Typography>
              )}
            </FormControl>

            {/* Session Info */}
            <Box sx={{ 
              backgroundColor: 'rgba(99, 102, 241, 0.1)', 
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: 1, 
              p: 2 
            }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
                Session Features:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip label="🎨 Interactive Whiteboard" size="small" sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }} />
                <Chip label="💬 Real-time Chat" size="small" sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }} />
                <Chip label="✏️ Text & Drawing" size="small" sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }} />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={handleClose} 
            disabled={loading}
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !formData.name.trim() || !formData.invited_user_id || (!matches || matches.length === 0)}
            sx={{
              backgroundColor: '#6366f1',
              '&:hover': { backgroundColor: '#5855eb' },
              '&:disabled': { backgroundColor: 'rgba(99, 102, 241, 0.3)' }
            }}
          >
            {loading ? 'Creating...' : 'Create Session'}
          </Button>
        </DialogActions>
        </form>
      ) : (
        // Success Screen
        <>
          <DialogTitle sx={{ color: 'white', pb: 1 }}>
            <Box>
              <Box component="div" sx={{ fontWeight: 500, color: '#4ade80', fontSize: '1.5rem', lineHeight: 1.334 }}>
                🎉 Session Created Successfully!
              </Box>
              <Box component="div" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 1, fontSize: '0.875rem' }}>
                Your session "{createdSession.name}" is ready
              </Box>
            </Box>
          </DialogTitle>
          
          <DialogContent sx={{ pt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                {createdSession.invited_user?.name} has been invited to your session!
              </Typography>
              <Box sx={{ 
                backgroundColor: 'rgba(99, 102, 241, 0.1)', 
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: 1, 
                p: 2 
              }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Only you and {createdSession.invited_user?.name} can join this session. They'll need to navigate to the session to join.
                </Typography>
              </Box>
              
              <Button
                variant="contained"
                onClick={handleJoinSession}
                sx={{
                  backgroundColor: '#4ade80',
                  color: '#000',
                  fontWeight: 600,
                  '&:hover': { backgroundColor: '#22c55e' }
                }}
              >
                Join Session Now
              </Button>
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, pt: 2, justifyContent: 'center' }}>
            <Button 
              onClick={handleClose}
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
              }}
            >
              Close
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  )
}