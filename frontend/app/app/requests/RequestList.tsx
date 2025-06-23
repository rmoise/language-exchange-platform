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
import { 
  CheckCircle, 
  Cancel, 
  Schedule, 
  Person,
  HourglassEmpty 
} from '@mui/icons-material'
import { api } from '@/utils/api'

interface User {
  id: string
  name: string
  email: string
  nativeLanguages: string[]
  targetLanguages: string[]
  createdAt: string
}

interface MatchRequest {
  id: string
  senderId: string
  recipientId: string
  status: 'pending' | 'accepted' | 'declined'
  sender?: User
  recipient?: User
  createdAt: string
}

interface RequestListProps {
  requests: MatchRequest[]
  type: 'incoming' | 'outgoing'
}

export default function RequestList({ requests, type }: RequestListProps) {
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set())
  const [processedRequests, setProcessedRequests] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  const handleAccept = async (requestId: string) => {
    setLoadingActions(prev => new Set(prev).add(requestId))
    setError(null)

    try {
      await api.put(`/matches/requests/${requestId}/accept`)
      setProcessedRequests(prev => new Set(prev).add(requestId))
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to accept request')
    } finally {
      setLoadingActions(prev => {
        const newSet = new Set(prev)
        newSet.delete(requestId)
        return newSet
      })
    }
  }

  const handleDecline = async (requestId: string) => {
    setLoadingActions(prev => new Set(prev).add(requestId))
    setError(null)

    try {
      await api.put(`/matches/requests/${requestId}/decline`)
      setProcessedRequests(prev => new Set(prev).add(requestId))
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to decline request')
    } finally {
      setLoadingActions(prev => {
        const newSet = new Set(prev)
        newSet.delete(requestId)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle color="success" />
      case 'declined':
        return <Cancel color="error" />
      case 'pending':
      default:
        return <HourglassEmpty color="warning" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'success'
      case 'declined':
        return 'error'
      case 'pending':
      default:
        return 'warning'
    }
  }

  if (requests.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Person sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No {type} requests
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {type === 'incoming' 
            ? "You haven't received any match requests yet"
            : "You haven't sent any match requests yet"
          }
        </Typography>
        {type === 'outgoing' && (
          <Button variant="contained" href="/app/search">
            Find Language Partners
          </Button>
        )}
      </Box>
    )
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Typography variant="h6" gutterBottom>
        {requests.length} {type} request{requests.length !== 1 ? 's' : ''}
      </Typography>
      
      <Grid container spacing={3}>
        {requests.map((request) => {
          const user = type === 'incoming' ? request.sender : request.recipient
          const isLoading = loadingActions.has(request.id)
          const isProcessed = processedRequests.has(request.id) || request.status !== 'pending'
          
          if (!user) return null
          
          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={request.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      {getInitials(user.name)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">
                        {user.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Schedule sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(request.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {getStatusIcon(request.status)}
                    <Chip 
                      label={request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      color={getStatusColor(request.status) as any}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Can teach:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                      {user.nativeLanguages?.length > 0 ? (
                        user.nativeLanguages.map((lang, index) => (
                          <Chip 
                            key={index} 
                            label={lang} 
                            size="small" 
                            color="primary"
                            variant="outlined"
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No languages listed
                        </Typography>
                      )}
                    </Box>
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Wants to learn:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {user.targetLanguages?.length > 0 ? (
                        user.targetLanguages.map((lang, index) => (
                          <Chip 
                            key={index} 
                            label={lang} 
                            size="small" 
                            color="secondary"
                            variant="outlined"
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No languages listed
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
                
                {type === 'incoming' && request.status === 'pending' && !isProcessed && (
                  <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={
                        isLoading ? (
                          <CircularProgress size={16} />
                        ) : (
                          <CheckCircle />
                        )
                      }
                      onClick={() => handleAccept(request.id)}
                      disabled={isLoading}
                      sx={{ flex: 1 }}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Cancel />}
                      onClick={() => handleDecline(request.id)}
                      disabled={isLoading}
                      sx={{ flex: 1 }}
                    >
                      Decline
                    </Button>
                  </Box>
                )}
                
                {(type === 'outgoing' || isProcessed) && (
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Typography variant="body2" color="text.secondary" align="center">
                      {request.status === 'accepted' && 'Request accepted! Check your matches.'}
                      {request.status === 'declined' && 'Request was declined.'}
                      {request.status === 'pending' && type === 'outgoing' && 'Waiting for response...'}
                      {isProcessed && request.status === 'pending' && 'Request processed.'}
                    </Typography>
                  </Box>
                )}
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}