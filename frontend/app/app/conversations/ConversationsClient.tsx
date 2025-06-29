'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  Chat as MessageIcon
} from '@mui/icons-material';
import { ChatInterface } from '@/features/messaging/components/ChatInterface';
import { MessagingService } from '@/features/messaging/messagingService';
import { Conversation } from '@/features/messaging/types';
import { useRouter, useSearchParams } from 'next/navigation';
import UserAvatar from '@/components/ui/UserAvatar';

export const ConversationsClient = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Define loadConversations first
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await MessagingService.getConversations();
      setConversations(response.conversations || []);
    } catch (err: any) {
      console.error('Failed to load conversations:', err);
      setError('Failed to load conversations. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Get conversation ID from URL
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setSelectedConversationId(id);
      
      // If conversation not in list, reload conversations
      // This handles the case where we navigate from matches with a new conversation
      const conversationExists = conversations.some(c => c.id === id);
      if (!conversationExists && conversations.length > 0 && !loading) {
        console.log('Conversation not found in list, reloading...');
        loadConversations();
      }
    }
  }, [searchParams, conversations.length, loading, conversations, loadConversations]);

  // Helper function to format time ago
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    
    return date.toLocaleDateString();
  };

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conversation =>
    conversation.other_user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (typeof conversation.last_message === 'object' && 
     conversation.last_message?.content?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleConversationSelect = (conversation: Conversation) => {
    if (!conversation.id) {
      console.error('Conversation has no ID:', conversation);
      return;
    }
    setSelectedConversationId(conversation.id);
    // Update URL without full page navigation
    router.push(`/app/conversations?id=${conversation.id}`, { scroll: false });
  };

  const handleBackClick = () => {
    setSelectedConversationId(null);
    router.push('/app/conversations', { scroll: false });
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '600px',
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(10px)',
        border: '1px solid #374151',
        borderRadius: 1,
        m: 3
      }}>
        <CircularProgress sx={{ color: '#6366f1' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ m: 3 }}>
        <Alert 
          severity="error" 
          sx={{ 
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: 'white',
            borderRadius: 1,
          }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  // Mobile view - show either list or chat
  if (isMobile && selectedConversationId) {
    return (
      <Box sx={{ 
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(10px)',
      }}>
        <Box sx={{ 
          p: 2, 
          borderBottom: '1px solid #374151',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <IconButton 
            onClick={handleBackClick}
            sx={{ color: 'white' }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography sx={{ color: 'white', fontSize: '1.125rem', fontWeight: 300 }}>
            {conversations.find(c => c.id === selectedConversationId)?.other_user?.name || 'Chat'}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <ChatInterface conversationId={selectedConversationId} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: 'calc(100vh - 100px)',
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(10px)',
      border: '1px solid #374151',
      borderRadius: 1,
      m: 3,
      overflow: 'hidden'
    }}>
      {/* Page Title inside messenger */}
      <Box sx={{ p: 3, textAlign: "center", borderBottom: '1px solid #374151' }}>
        <Typography
          variant="h1"
          sx={{ 
            fontWeight: 300, 
            letterSpacing: '-0.02em',
            mb: 1, 
            color: "white"
          }}
        >
          Messenger
        </Typography>
        <Typography variant="body2" sx={{ color: "#9ca3af" }}>
          Connect with your language partners through real-time conversations
        </Typography>
      </Box>

      <Box sx={{ 
        flex: 1,
        display: 'flex',
        overflow: 'hidden'
      }}>
      {/* Left sidebar - Conversation list */}
      <Box sx={{ 
        width: { xs: '100%', md: '350px' },
        borderRight: '1px solid #374151',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(0, 0, 0, 0.2)'
      }}>
        {/* Search header */}
        <Box sx={{ p: 2, borderBottom: '1px solid #374151' }}>
          <TextField
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 20, color: '#9ca3af' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '0.875rem',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                },
                '&.Mui-focused': {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '& fieldset': {
                  border: 'none',
                },
              },
              '& .MuiOutlinedInput-input': {
                padding: '10px 12px',
                '&::placeholder': {
                  color: '#9ca3af',
                  opacity: 1,
                },
              },
            }}
          />
        </Box>

        {/* Conversation list */}
        <List sx={{ 
          flex: 1, 
          overflow: 'auto',
          p: 0,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.05)',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '3px',
          },
        }}>
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => {
              const lastMessage = typeof conversation.last_message === 'object' 
                ? conversation.last_message?.content 
                : conversation.last_message || 'No messages yet';
              const timeAgo = conversation.last_message_at 
                ? formatTimeAgo(conversation.last_message_at) 
                : '';

              return (
                <React.Fragment key={conversation.id}>
                  <ListItemButton
                    selected={selectedConversationId === conversation.id}
                    onClick={() => handleConversationSelect(conversation)}
                    sx={{
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(99, 102, 241, 0.2)',
                        '&:hover': {
                          backgroundColor: 'rgba(99, 102, 241, 0.25)',
                        }
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <UserAvatar
                        user={conversation.other_user}
                        size={40}
                        showOnlineStatus={true}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography sx={{ color: 'white', fontSize: '0.875rem', fontWeight: 500 }}>
                            {conversation.other_user?.name || 'Unknown User'}
                          </Typography>
                          <Typography sx={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                            {timeAgo}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box 
                          component="span" 
                          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                          <Typography 
                            component="span"
                            sx={{ 
                              color: '#d1d5db', 
                              fontSize: '0.8125rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              pr: 1,
                              display: 'inline-block'
                            }}
                          >
                            {lastMessage}
                          </Typography>
                          {conversation.unread_count > 0 && (
                            <Chip 
                              label={conversation.unread_count}
                              size="small"
                              sx={{ 
                                fontSize: '0.625rem', 
                                height: 20,
                                backgroundColor: 'rgba(99, 102, 241, 0.8)',
                                color: 'white'
                              }} 
                            />
                          )}
                        </Box>
                      }
                      secondaryTypographyProps={{
                        component: 'div',
                        sx: { m: 0 }
                      }}
                    />
                  </ListItemButton>
                  <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)' }} />
                </React.Fragment>
              );
            })
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <MessageIcon sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
              <Typography sx={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                {searchTerm ? 'No conversations found' : 'No conversations yet'}
              </Typography>
            </Box>
          )}
        </List>
      </Box>

      {/* Right side - Chat interface or empty state */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedConversationId ? (
          <ChatInterface conversationId={selectedConversationId} />
        ) : (
          <Box sx={{ 
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 2
          }}>
            <MessageIcon sx={{ fontSize: 64, color: 'rgba(255, 255, 255, 0.3)' }} />
            <Typography sx={{ fontSize: '1.125rem', color: 'white' }}>
              Select a conversation
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', color: '#9ca3af' }}>
              Choose a conversation from the list to start messaging
            </Typography>
          </Box>
        )}
      </Box>
      </Box>
    </Box>
  );
};