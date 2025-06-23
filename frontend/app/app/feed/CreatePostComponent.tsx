'use client'

import { useState } from 'react'
import { Box, Card, CardContent, Avatar, Button, Divider, TextField } from '@mui/material'
import { 
  PhotoCamera as PhotoIcon,
  Videocam as VideoIcon,
  EmojiEmotions as EmojiIcon,
  Public as PublicIcon,
  Event as EventIcon
} from '@mui/icons-material'
import { useAppSelector } from '@/lib/hooks'

export default function CreatePostComponent() {
  const [postContent, setPostContent] = useState('')
  const [feeling, setFeeling] = useState('Feeling motivated 😊')
  const [privacy, setPrivacy] = useState('Public')
  
  const user = useAppSelector(state => state.auth.user)

  const handlePost = () => {
    if (postContent.trim()) {
      // Handle post submission here
      console.log('Posting:', { content: postContent, feeling, privacy })
      setPostContent('')
    }
  }

  return (
    <Card
      sx={{
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(10px)',
        border: '1px solid #374151',
        borderRadius: 2,
        color: 'white',
        mb: 3,
        '&:hover': {
          borderColor: '#6366f1',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
        },
        transition: 'all 0.3s ease'
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Top Section with Avatar and Input */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
          <Avatar 
            src={(user as any)?.avatar}
            sx={{ width: 48, height: 48, flexShrink: 0 }}
          >
            {user?.name?.charAt(0) || 'U'}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              placeholder="What's on your mind? Share your language learning journey..."
              variant="outlined"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 2,
                  color: 'white',
                  fontSize: '1rem',
                  '& fieldset': {
                    borderColor: 'transparent',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(99, 102, 241, 0.3)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#6366f1',
                    borderWidth: 1,
                  },
                },
                '& .MuiInputBase-input': {
                  '&::placeholder': {
                    color: '#9ca3af',
                    opacity: 1,
                  },
                },
              }}
            />
          </Box>
        </Box>

        {/* Feeling/Status Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, ml: 7 }}>
          <Button
            startIcon={<EmojiIcon />}
            size="small"
            onClick={() => {
              const feelings = [
                'Feeling motivated 😊',
                'Feeling excited 🎉',
                'Feeling confident 💪',
                'Feeling grateful 🙏',
                'Feeling proud 😎',
                'Feeling curious 🤔',
                'Feeling inspired ✨'
              ]
              const randomFeeling = feelings[Math.floor(Math.random() * feelings.length)]
              setFeeling(randomFeeling)
            }}
            sx={{
              color: '#9ca3af',
              textTransform: 'none',
              borderRadius: 2,
              px: 2,
              py: 0.5,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              '&:hover': {
                backgroundColor: 'rgba(251, 191, 36, 0.1)',
                color: '#fbbf24',
              }
            }}
          >
            {feeling}
          </Button>
          <Button
            startIcon={<PublicIcon />}
            size="small"
            onClick={() => setPrivacy(privacy === 'Public' ? 'Friends' : 'Public')}
            sx={{
              color: '#9ca3af',
              textTransform: 'none',
              borderRadius: 2,
              px: 2,
              py: 0.5,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              '&:hover': {
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                color: '#6366f1',
              }
            }}
          >
            {privacy}
          </Button>
        </Box>

        <Divider sx={{ borderColor: '#374151', mb: 3 }} />

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              startIcon={<PhotoIcon />}
              sx={{
                color: '#22c55e',
                textTransform: 'none',
                borderRadius: 2,
                px: 2,
                py: 1,
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(34, 197, 94, 0.2)',
                }
              }}
            >
              Photo
            </Button>
            <Button
              startIcon={<VideoIcon />}
              sx={{
                color: '#3b82f6',
                textTransform: 'none',
                borderRadius: 2,
                px: 2,
                py: 1,
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                }
              }}
            >
              Video
            </Button>
            <Button
              startIcon={<EventIcon />}
              sx={{
                color: '#f59e0b',
                textTransform: 'none',
                borderRadius: 2,
                px: 2,
                py: 1,
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(245, 158, 11, 0.2)',
                }
              }}
            >
              Event
            </Button>
          </Box>
          <Button
            variant="contained"
            disabled={!postContent.trim()}
            onClick={handlePost}
            sx={{
              backgroundColor: '#6366f1',
              color: 'white',
              textTransform: 'none',
              borderRadius: 2,
              px: 4,
              py: 1,
              fontWeight: 500,
              '&:hover': {
                backgroundColor: '#5855eb',
              },
              '&:disabled': {
                backgroundColor: 'rgba(99, 102, 241, 0.3)',
                color: 'rgba(255, 255, 255, 0.5)',
              }
            }}
          >
            Post
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}