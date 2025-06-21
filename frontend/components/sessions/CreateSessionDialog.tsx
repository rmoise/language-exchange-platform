'use client'

import { useState } from 'react'
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
  Alert
} from '@mui/material'
import { CreateSessionInput, SessionService } from '@/services/sessionService'

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
    target_language: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setError('Session name is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const session = await SessionService.createSession({
        ...formData,
        description: formData.description || undefined,
        target_language: formData.target_language || undefined
      })
      
      onSessionCreated(session.id)
      onClose()
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        max_participants: 2,
        session_type: 'practice',
        target_language: ''
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
    }
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
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ color: 'white', pb: 1 }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 500 }}>
            Create Language Session
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 1 }}>
            Start a collaborative language learning session
          </Typography>
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
            disabled={loading || !formData.name.trim()}
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
    </Dialog>
  )
}