'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { TypingIndicator } from '../types';

interface UseTypingIndicatorOptions {
  conversationId: string;
  currentUserId: string;
  sendTypingIndicator: (conversationId: string, isTyping: boolean) => void;
  typingTimeoutMs?: number;
}

export const useTypingIndicator = ({
  conversationId,
  currentUserId,
  sendTypingIndicator,
  typingTimeoutMs = 3000 // 3 seconds
}: UseTypingIndicatorOptions) => {
  const [isTyping, setIsTyping] = useState(false);
  const [otherUsersTyping, setOtherUsersTyping] = useState<Map<string, TypingIndicator>>(new Map());
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const lastTypingTimeRef = useRef<number>(0);

  // Start typing indicator
  const startTyping = useCallback(() => {
    const now = Date.now();
    
    // Only send if we haven't sent a typing indicator recently (throttle)
    if (now - lastTypingTimeRef.current > 1000) { // 1 second throttle
      sendTypingIndicator(conversationId, true);
      lastTypingTimeRef.current = now;
      setIsTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, typingTimeoutMs);
  }, [conversationId, sendTypingIndicator, typingTimeoutMs]);

  // Stop typing indicator
  const stopTyping = useCallback(() => {
    if (isTyping) {
      sendTypingIndicator(conversationId, false);
      setIsTyping(false);
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [conversationId, sendTypingIndicator, isTyping]);

  // Handle typing indicator from other users
  const handleTypingIndicator = useCallback((indicator: TypingIndicator) => {
    // Ignore our own typing indicators
    if (indicator.user_id === currentUserId) {
      return;
    }

    // Only handle indicators for this conversation
    if (indicator.conversation_id !== conversationId) {
      return;
    }

    setOtherUsersTyping(prev => {
      const newMap = new Map(prev);
      
      if (indicator.is_typing) {
        // Add or update typing indicator
        newMap.set(indicator.user_id, {
          ...indicator,
          timestamp: Date.now() // Add timestamp for cleanup
        } as TypingIndicator & { timestamp: number });
      } else {
        // Remove typing indicator
        newMap.delete(indicator.user_id);
      }
      
      return newMap;
    });
  }, [currentUserId, conversationId]);

  // Clean up stale typing indicators
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const staleThreshold = 5000; // 5 seconds

      setOtherUsersTyping(prev => {
        const newMap = new Map(prev);
        let hasChanges = false;

        for (const [userId, indicator] of newMap.entries()) {
          const typingIndicator = indicator as TypingIndicator & { timestamp: number };
          if (now - typingIndicator.timestamp > staleThreshold) {
            newMap.delete(userId);
            hasChanges = true;
          }
        }

        return hasChanges ? newMap : prev;
      });
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Send stop typing when component unmounts
      if (isTyping) {
        sendTypingIndicator(conversationId, false);
      }
    };
  }, [conversationId, sendTypingIndicator, isTyping]);

  // Get list of users currently typing (excluding current user)
  const getTypingUsers = useCallback((): TypingIndicator[] => {
    return Array.from(otherUsersTyping.values())
      .filter(indicator => indicator.user_id !== currentUserId);
  }, [otherUsersTyping, currentUserId]);

  // Get typing users display text
  const getTypingText = useCallback((): string => {
    const typingUsers = getTypingUsers();
    
    if (typingUsers.length === 0) {
      return '';
    } else if (typingUsers.length === 1) {
      return `${typingUsers[0].user_id} is typing...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].user_id} and ${typingUsers[1].user_id} are typing...`;
    } else {
      return `${typingUsers.length} people are typing...`;
    }
  }, [getTypingUsers]);

  return {
    isTyping,
    startTyping,
    stopTyping,
    handleTypingIndicator,
    getTypingUsers,
    getTypingText,
    hasTypingUsers: otherUsersTyping.size > 0
  };
};