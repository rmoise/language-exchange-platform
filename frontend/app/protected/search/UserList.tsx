'use client'

import { useState } from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Box,
  Avatar,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material'
import { PersonAdd, Person, Language, School } from '@mui/icons-material'
import { api } from '@/utils/api'

interface User {
  id: string
  name: string
  email: string
  nativeLanguages: string[]
  targetLanguages: string[]
  createdAt: string
}

interface UserListProps {
  users: User[]
}

export default function UserList({ users }: UserListProps) {
  const [loadingRequests, setLoadingRequests] = useState<Set<string>>(new Set())
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  const handleSendRequest = async (userId: string) => {
    setLoadingRequests(prev => new Set(prev).add(userId))
    setError(null)

    try {
      await api.post('/matches/requests', { recipientId: userId })
      setSentRequests(prev => new Set(prev).add(userId))
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send match request')
    } finally {
      setLoadingRequests(prev => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getComplementaryLanguages = (user: User) => {
    // Find languages where there's a potential match
    // User's native languages that match this person's target languages
    // This person's native languages that match user's target languages
    return {
      canTeach: user.nativeLanguages,
      wantsToLearn: user.targetLanguages,
    }
  }

  if (users.length === 0) {
    return (
      <Box sx={{ 
        textAlign: 'center', 
        py: 8,
        px: 4,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper'
      }}>
        <Person sx={{ 
          fontSize: 48, 
          color: 'text.secondary', 
          mb: 3,
          opacity: 0.6 
        }} />
        <Typography variant="h5" color="text.primary" sx={{ mb: 1, fontWeight: 600 }}>
          No language partners found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
          Try adjusting your search filters or check back later for new language exchange partners.
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ px: { xs: 1, sm: 0 } }}>
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'error.light',
            '& .MuiAlert-icon': {
              color: 'error.main'
            }
          }}
        >
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Typography 
          variant="h4"
          sx={{ 
            mb: 1, 
            fontWeight: 700,
            fontSize: { xs: '1.5rem', sm: '2rem' }
          }}
        >
          Language Partners
        </Typography>
        <Typography 
          variant="body1"
          color="text.secondary"
          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          Found {users.length} language partner{users.length !== 1 ? 's' : ''} ready to connect
        </Typography>
      </Box>
      
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {users.map((user) => {
          const { canTeach, wantsToLearn } = getComplementaryLanguages(user)
          const isLoading = loadingRequests.has(user.id)
          const requestSent = sentRequests.has(user.id)
          
          return (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }} key={user.id}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}>
                <CardContent sx={{ flexGrow: 1, p: { xs: 3, sm: 4 } }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    mb: { xs: 3, sm: 4 },
                    flexDirection: { xs: 'column', sm: 'row' },
                    textAlign: { xs: 'center', sm: 'left' }
                  }}>
                    <Avatar sx={{ 
                      mr: { xs: 0, sm: 3 },
                      mb: { xs: 2, sm: 0 },
                      mx: { xs: 'auto', sm: 0 },
                      width: { xs: 56, sm: 48 },
                      height: { xs: 56, sm: 48 },
                      backgroundColor: 'primary.main',
                      fontSize: { xs: '1.25rem', sm: '1.1rem' },
                      fontWeight: 600,
                      color: 'primary.contrastText',
                    }}>
                      {getInitials(user.name)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography 
                        variant="h6"
                        sx={{ 
                          fontWeight: 600, 
                          mb: 0.5,
                          fontSize: { xs: '1.1rem', sm: '1.25rem' }
                        }}
                      >
                        {user.name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                      >
                        Member since {new Date(user.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Language sx={{ mr: 1.5, fontSize: 20, color: 'primary.main' }} />
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: 600, 
                            color: 'text.primary'
                          }}
                        >
                          Can teach
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {canTeach.length > 0 ? (
                          canTeach.map((lang, index) => (
                            <Chip 
                              key={index} 
                              label={lang} 
                              size="small" 
                              sx={{
                                backgroundColor: 'primary.main',
                                color: 'primary.contrastText',
                                fontWeight: 500,
                                borderRadius: 1.5,
                                '&:hover': {
                                  backgroundColor: 'primary.dark',
                                }
                              }}
                            />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            No languages listed
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <School sx={{ mr: 1.5, fontSize: 20, color: 'secondary.main' }} />
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: 600, 
                            color: 'text.primary'
                          }}
                        >
                          Wants to learn
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {wantsToLearn.length > 0 ? (
                          wantsToLearn.map((lang, index) => (
                            <Chip 
                              key={index} 
                              label={lang} 
                              size="small" 
                              variant="outlined"
                              sx={{
                                borderColor: 'secondary.main',
                                color: 'secondary.main',
                                fontWeight: 500,
                                borderRadius: 1.5,
                                '&:hover': {
                                  backgroundColor: 'secondary.main',
                                  color: 'secondary.contrastText',
                                }
                              }}
                            />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            No languages listed
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
                
                <Divider />
                
                <Box sx={{ p: { xs: 3, sm: 4 }, pt: { xs: 2, sm: 3 } }}>
                  <Button
                    fullWidth
                    variant={requestSent ? "outlined" : "contained"}
                    startIcon={
                      isLoading ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <PersonAdd />
                      )
                    }
                    onClick={() => handleSendRequest(user.id)}
                    disabled={isLoading || requestSent}
                    sx={{
                      py: { xs: 1.25, sm: 1.5 },
                      px: 3,
                      borderRadius: 1.5,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      backgroundColor: requestSent ? 'transparent' : 'primary.main',
                      color: requestSent ? 'primary.main' : 'primary.contrastText',
                      border: requestSent ? '1px solid' : 'none',
                      borderColor: requestSent ? 'primary.main' : 'transparent',
                      '&:hover': {
                        backgroundColor: requestSent 
                          ? 'primary.main' 
                          : 'primary.dark',
                        color: requestSent 
                          ? 'primary.contrastText'
                          : 'primary.contrastText',
                        borderColor: requestSent ? 'primary.main' : 'transparent',
                      },
                      '&:disabled': {
                        backgroundColor: 'action.disabledBackground',
                        color: 'action.disabled',
                        borderColor: 'action.disabled',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    {requestSent ? 'Request Sent' : 'Send Request'}
                  </Button>
                </Box>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}