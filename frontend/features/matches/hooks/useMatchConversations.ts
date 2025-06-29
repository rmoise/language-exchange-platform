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
      console.log('Raw conversations response:', response);
      
      // Handle both response structures - direct array or wrapped in conversations property
      const conversationsList = Array.isArray(response) 
        ? response 
        : (response.conversations || []);
      
      console.log('Processed conversations list:', conversationsList);
      console.log('First conversation detail:', conversationsList[0]);
      
      setConversations(conversationsList);
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setError('Failed to load conversations');
      setConversations([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const findConversationWithUser = (userId: string): Conversation | undefined => {
    if (!conversations || !Array.isArray(conversations)) {
      console.log('No conversations available');
      return undefined;
    }
    
    console.log(`Finding conversation with user ${userId} among ${conversations.length} conversations`);
    
    // Find a conversation where the other_user is the specified userId
    // This ensures we find the conversation between the current user and the target user
    const found = conversations.find(conv => {
      console.log('Checking conversation:', {
        id: conv.id,
        other_user_id: conv.other_user?.id,
        user1_id: conv.user1_id,
        user2_id: conv.user2_id,
        matches: conv.other_user?.id === userId
      });
      
      // If other_user is populated, it's already the user we're NOT (the other participant)
      if (conv.other_user?.id === userId) {
        return true;
      }
      
      // If other_user is not populated, we can't reliably determine
      // which conversation this is without knowing the current user's ID
      return false;
    });
    
    console.log('Found conversation:', found);
    return found;
  };

  return {
    conversations,
    loading,
    error,
    findConversationWithUser,
    refetch: loadConversations,
  };
};