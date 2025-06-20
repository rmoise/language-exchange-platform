'use client';

import { useState, useEffect } from 'react';
import { MessagingService } from '../../messaging/messagingService';

interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  other_user?: {
    id: string;
    name: string;
    email: string;
  };
  last_message?: any;
  unread_count?: number;
}

export const useMatchConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await MessagingService.getConversations();
      setConversations(response.conversations);
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const findConversationWithUser = (userId: string): Conversation | undefined => {
    return conversations.find(conv => conv.other_user?.id === userId);
  };

  return {
    conversations,
    loading,
    error,
    findConversationWithUser,
    refetch: loadConversations,
  };
};