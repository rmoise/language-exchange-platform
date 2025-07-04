'use client'

import React, { useState, useEffect } from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Box,
  Avatar,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material'
import { Chat, Person, Schedule, ChatBubble } from '@mui/icons-material'
import { useStartConversation } from '../../../features/matches/hooks/useStartConversation'
import { useMatchConversations } from '../../../features/matches/hooks/useMatchConversations'
import { useAppSelector } from '@/lib/hooks'

interface User {
  id: string
  name: string
  email: string
  nativeLanguages: string[]
  targetLanguages: string[]
  createdAt: string
}

interface Match {
  id: string
  user1: User
  user2: User
  createdAt: string
}

interface MatchListProps {
  matches: Match[]
}

export default function MatchList({ matches }: MatchListProps) {
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const currentUser = useAppSelector(state => state.auth.user);
  
  const { findConversationWithUser, conversations, loading: conversationsLoading, refetch } = useMatchConversations();
  
  // Log conversations to debug
  useEffect(() => {
    console.log('Current user:', currentUser);
    console.log('All conversations:', conversations);
    console.log('Conversations loading:', conversationsLoading);
  }, [conversations, conversationsLoading, currentUser]);
  
  const { startConversation, isPending } = useStartConversation({
    onError: (errorMessage) => {
      setError(errorMessage);
    },
    onSuccess: (conversationId) => {
      setSuccess('Conversation started successfully!');
      // Refetch conversations to update the UI
      refetch();
    },
  });

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

  const getLanguageExchange = (partner: User) => {
    return {
      canTeach: partner.nativeLanguages,
      wantsToLearn: partner.targetLanguages,
    }
  }

  if (matches.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Person sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No matches yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Send match requests to other users to start building your language exchange network
        </Typography>
        <Button variant="contained" href="/app/search">
          Find Language Partners
        </Button>
      </Box>
    )
  }

  return (
    <Grid container spacing={3}>
      {matches.map((match) => {
        // Determine which user is the partner (not the current user)
        const partner = currentUser?.id === match.user1.id ? match.user2 : match.user1;
        const { canTeach, wantsToLearn } = getLanguageExchange(partner)
        
        console.log('Processing match:', {
          matchId: match.id,
          currentUserId: currentUser?.id,
          user1: match.user1,
          user2: match.user2,
          partner: partner
        });
        
        return (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={match.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    {getInitials(partner.name)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">
                      {partner.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Schedule sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        Matched on {formatDate(match.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Can teach you:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                    {canTeach.length > 0 ? (
                      canTeach.map((lang, index) => (
                        <Chip 
                          key={index} 
                          label={lang} 
                          size="small" 
                          color="primary"
                          variant="filled"
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
                    {wantsToLearn.length > 0 ? (
                      wantsToLearn.map((lang, index) => (
                        <Chip 
                          key={index} 
                          label={lang} 
                          size="small" 
                          color="secondary"
                          variant="filled"
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
              
              <Box sx={{ p: 2, pt: 0 }}>
                {(() => {
                  const existingConversation = findConversationWithUser(partner.id);
                  console.log('Looking for conversation with partner:', partner.id, partner.name);
                  console.log('Found conversation:', existingConversation);
                  
                  if (existingConversation) {
                    console.log('Navigating to existing conversation:', existingConversation.id);
                    return (
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<ChatBubble />}
                        onClick={() => {
                          console.log('Continue Chat clicked, navigating to:', existingConversation.id);
                          window.location.href = `/app/conversations?id=${existingConversation.id}`;
                        }}
                        color="success"
                      >
                        Continue Chat
                      </Button>
                    );
                  }
                  
                  return (
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={isPending ? <CircularProgress size={20} color="inherit" /> : <Chat />}
                      onClick={() => {
                        console.log('Button clicked for match:', match.id);
                        console.log('Match data:', match);
                        startConversation(match.id);
                      }}
                      disabled={isPending}
                    >
                      {isPending ? 'Starting...' : 'Start Conversation'}
                    </Button>
                  );
                })()}
              </Box>
            </Card>
          </Grid>
        )
      })}
      
      {/* Error Snackbar */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      {/* Success Snackbar */}
      <Snackbar 
        open={!!success} 
        autoHideDuration={3000} 
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Grid>
  )
}