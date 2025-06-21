'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  Avatar,
  Chip,
  Badge
} from '@mui/material';
import {
  Search as SearchIcon,
  Send as SendIcon,
  Schedule as ClockIcon,
  Chat as MessageIcon
} from '@mui/icons-material';
import { ConversationList } from '@/features/messaging/components/ConversationList';
import { MessagingService } from '@/features/messaging/messagingService';
import { Conversation } from '@/features/messaging/types';
import { useRouter } from 'next/navigation';

export const ConversationsClient = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string>();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  // Helper function to get user initials
  const getUserInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper function to format time ago
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  // Helper function to get language tag based on user's languages
  const getLanguageTag = (otherUser: any) => {
    if (otherUser?.nativeLanguages?.length > 0) {
      return {
        text: otherUser.nativeLanguages[0],
        color: 'emerald'
      };
    }
    if (otherUser?.targetLanguages?.length > 0) {
      return {
        text: otherUser.targetLanguages[0],
        color: 'blue'
      };
    }
    return {
      text: 'Partner',
      color: 'blue'
    };
  };

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conversation =>
    conversation.other_user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (typeof conversation.last_message === 'object' && 
     conversation.last_message?.content?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await MessagingService.getConversations();
      setConversations(response.conversations || []);
    } catch (err: any) {
      console.error('Failed to load conversations:', err);
      
      // Handle specific error cases
      if (err?.response?.status === 404) {
        setError('Messaging service not available. Please check if the backend server is running.');
      } else if (err?.response?.status === 401) {
        setError('You are not authorized. Please log in again.');
      } else if (err?.code === 'NETWORK_ERROR' || err?.message?.includes('Network Error')) {
        setError('Unable to connect to the server. Please check your connection.');
      } else {
        setError('Failed to load conversations. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversationId(conversation.id);
    router.push(`/protected/conversations/${conversation.id}`);
  };

  const handleSendReply = async (conversationId: string) => {
    const message = replyText[conversationId];
    if (!message.trim()) return;

    try {
      // TODO: Implement actual message sending via MessagingService
      // await MessagingService.sendMessage(conversationId, { content: message });
      
      // Clear the reply text for this conversation
      setReplyText(prev => ({ ...prev, [conversationId]: '' }));
      
      // Optionally refresh conversations to get the latest message
      // loadConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleReplyTextChange = (conversationId: string, text: string) => {
    setReplyText(prev => ({ ...prev, [conversationId]: text }));
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(10px)',
        border: '1px solid #374151',
        borderRadius: 1,
        mb: 3
      }}>
        <CircularProgress sx={{ color: '#6366f1' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ 
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: 'white',
          borderRadius: 1,
          mb: 3
        }}
      >
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ 
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(10px)',
        border: '1px solid #374151',
        borderRadius: 1,
        p: { xs: 3, sm: 5 },
        mb: 3,
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          borderColor: '#6366f1',
          background: 'rgba(0, 0, 0, 0.6)',
        }
      }}>
        {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Typography sx={{ fontSize: '1.125rem', fontWeight: 300, color: 'white', letterSpacing: '-0.025em' }}>
          Language Exchange Chat
        </Typography>
        <Chip 
          label={conversations.reduce((total, conv) => total + conv.unread_count, 0)} 
          size="small"
          sx={{ 
            backgroundColor: 'rgba(99, 102, 241, 0.8)',
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: 600
          }} 
        />
      </Box>
      
      {/* Search */}
      <Box sx={{ position: 'relative', mb: 4 }}>
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
                <SearchIcon sx={{ fontSize: 16, color: '#9ca3af' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 1.5,
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
      
      {/* Messages */}
      {filteredConversations.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {filteredConversations.map((conversation) => {
            const languageTag = getLanguageTag(conversation.other_user);
            const lastMessage = typeof conversation.last_message === 'object' 
              ? conversation.last_message?.content 
              : conversation.last_message || 'No messages yet';
            const timeAgo = conversation.last_message_at 
              ? formatTimeAgo(conversation.last_message_at) 
              : 'New conversation';

            return (
              <Box 
                key={conversation.id}
                sx={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 1.5,
                  p: 4,
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  transition: 'all 0.3s ease-in-out',
                  cursor: 'pointer',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
                onClick={() => handleConversationSelect(conversation)}
              >
                {/* Message Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                  <Avatar 
                    src={conversation.other_user?.profilePicture}
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      background: languageTag.color === 'emerald' 
                        ? 'linear-gradient(135deg, #10b981, #34d399)' 
                        : 'linear-gradient(135deg, #3b82f6, #60a5fa)'
                    }}
                  >
                    {conversation.other_user?.name ? getUserInitials(conversation.other_user.name) : 'U'}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'white' }}>
                        {conversation.other_user?.name || 'Unknown User'}
                      </Typography>
                      <Chip 
                        label={languageTag.text}
                        size="small"
                        sx={{ 
                          fontSize: '0.625rem', 
                          height: 16,
                          backgroundColor: languageTag.color === 'emerald' 
                            ? 'rgba(34, 197, 94, 0.2)' 
                            : 'rgba(59, 130, 246, 0.2)',
                          color: languageTag.color === 'emerald' ? '#4ade80' : '#60a5fa'
                        }} 
                      />
                      {conversation.unread_count > 0 && (
                        <Chip 
                          label={conversation.unread_count}
                          size="small"
                          sx={{ 
                            fontSize: '0.625rem', 
                            height: 16,
                            backgroundColor: 'rgba(239, 68, 68, 0.8)',
                            color: 'white'
                          }} 
                        />
                      )}
                    </Box>
                    <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                      Language Exchange Partner • {timeAgo}
                    </Typography>
                  </Box>
                </Box>
                
                {/* Message Content */}
                <Typography sx={{ 
                  fontSize: '0.75rem', 
                  color: '#d1d5db', 
                  mb: 3,
                  lineHeight: 1.6
                }}>
                  {lastMessage}
                </Typography>
                
                {/* Reply Section */}
                <Box sx={{ display: 'flex', gap: 2 }} onClick={(e) => e.stopPropagation()}>
                  <TextField
                    placeholder="Send a quick message..."
                    value={replyText[conversation.id] || ''}
                    onChange={(e) => handleReplyTextChange(conversation.id, e.target.value)}
                    fullWidth
                    variant="outlined"
                    size="small"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSendReply(conversation.id);
                      }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 1,
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        fontSize: '0.75rem',
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
                        padding: '8px 12px',
                        '&::placeholder': {
                          color: '#9ca3af',
                          opacity: 1,
                        },
                      },
                    }}
                  />
                  <IconButton 
                    onClick={() => handleSendReply(conversation.id)}
                    sx={{ 
                      background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                      color: 'white',
                      width: 36,
                      height: 36,
                      borderRadius: 1,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                      }
                    }}
                  >
                    <SendIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              </Box>
            );
          })}
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <MessageIcon sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
          <Typography sx={{ fontSize: '1rem', color: 'white', mb: 1 }}>
            {searchTerm ? 'No conversations found' : 'No conversations yet'}
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: '#9ca3af', mb: 3 }}>
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : 'Start connecting with language partners to begin chatting'
            }
          </Typography>
          {!searchTerm && (
            <IconButton 
              onClick={() => router.push('/protected/community')}
              sx={{ 
                background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                }
              }}
            >
              <SearchIcon />
            </IconButton>
          )}
        </Box>
      )}
    </Box>
  );
};