'use client';

import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  IconButton,
  Grid
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { ChatInterface } from '@/features/messaging/components/ChatInterface';
import { ConversationList } from '@/features/messaging/components/ConversationList';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { MessagingService } from '@/features/messaging/messagingService';
import { Conversation } from '@/features/messaging/types';

interface ChatClientProps {
  conversationId: string;
}

export const ChatClient: React.FC<ChatClientProps> = ({ conversationId }) => {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Validate conversation ID
  useEffect(() => {
    if (!conversationId || conversationId === 'undefined') {
      router.push('/app/conversations');
    }
  }, [conversationId, router]);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const response = await MessagingService.getConversations();
      setConversations(response.conversations || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    router.push('/app/conversations');
  };

  const handleConversationSelect = (conversation: Conversation) => {
    router.push(`/app/conversations/${conversation.id}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton 
          onClick={handleBackClick}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Messages
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {/* Conversation List - Hidden on mobile when viewing a chat */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <ConversationList
              conversations={conversations}
              onConversationSelect={handleConversationSelect}
              selectedConversationId={conversationId}
            />
          </Box>
        </Grid>
        
        {/* Chat Interface */}
        <Grid size={{ xs: 12, md: 8 }}>
          <ChatInterface conversationId={conversationId} />
        </Grid>
      </Grid>
    </Container>
  );
};