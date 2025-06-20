'use client';

import { useEffect, useCallback, useRef } from 'react';
import { Message, MessageStatus } from '../types';
import { MessagingService } from '../messagingService';

interface UseMessageStatusOptions {
  messages: Message[];
  currentUserId: string;
  conversationId: string;
  onStatusUpdate?: (messageId: string, status: MessageStatus) => void;
}

export const useMessageStatus = ({
  messages,
  currentUserId,
  conversationId,
  onStatusUpdate
}: UseMessageStatusOptions) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const messageElementsRef = useRef<Map<string, HTMLElement>>(new Map());
  const processedMessagesRef = useRef<Set<string>>(new Set());

  // Register a message element for visibility tracking
  const registerMessageElement = useCallback((messageId: string, element: HTMLElement | null) => {
    if (element) {
      messageElementsRef.current.set(messageId, element);
    } else {
      messageElementsRef.current.delete(messageId);
    }
  }, []);

  // Mark messages as delivered when they appear in the conversation
  const markAsDelivered = useCallback(async (messageIds: string[]) => {
    for (const messageId of messageIds) {
      try {
        await MessagingService.updateMessageStatus(messageId, {
          status: MessageStatus.DELIVERED
        });
        onStatusUpdate?.(messageId, MessageStatus.DELIVERED);
      } catch (error) {
        console.error('Failed to mark message as delivered:', messageId, error);
      }
    }
  }, [onStatusUpdate]);

  // Mark messages as read when they become visible
  const markAsRead = useCallback(async (messageIds: string[]) => {
    // First mark the entire conversation as read
    try {
      await MessagingService.markAsRead(conversationId);
    } catch (error) {
      console.error('Failed to mark conversation as read:', error);
    }

    // Then update individual message statuses
    for (const messageId of messageIds) {
      if (!processedMessagesRef.current.has(messageId)) {
        try {
          await MessagingService.updateMessageStatus(messageId, {
            status: MessageStatus.READ
          });
          onStatusUpdate?.(messageId, MessageStatus.READ);
          processedMessagesRef.current.add(messageId);
        } catch (error) {
          console.error('Failed to mark message as read:', messageId, error);
        }
      }
    }
  }, [conversationId, onStatusUpdate]);

  // Set up intersection observer for read receipts
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Clean up existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visibleMessageIds: string[] = [];
        
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.getAttribute('data-message-id');
            if (messageId) {
              visibleMessageIds.push(messageId);
            }
          }
        });

        if (visibleMessageIds.length > 0) {
          // Filter messages that are from other users and not already read
          const messagesToMarkAsRead = visibleMessageIds.filter(messageId => {
            const message = messages.find(m => m.id === messageId);
            return message && 
                   message.sender_id !== currentUserId && 
                   message.status !== MessageStatus.READ &&
                   !processedMessagesRef.current.has(messageId);
          });

          if (messagesToMarkAsRead.length > 0) {
            markAsRead(messagesToMarkAsRead);
          }
        }
      },
      {
        threshold: 0.5, // Message is considered read when 50% visible
        rootMargin: '0px 0px -50px 0px' // Trigger when message is well within viewport
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [messages, currentUserId, markAsRead]);

  // Observe message elements
  useEffect(() => {
    if (!observerRef.current) return;

    // Observe all registered message elements
    messageElementsRef.current.forEach((element, messageId) => {
      if (observerRef.current && element) {
        observerRef.current.observe(element);
      }
    });

    return () => {
      if (observerRef.current) {
        messageElementsRef.current.forEach((element) => {
          if (observerRef.current && element) {
            observerRef.current.unobserve(element);
          }
        });
      }
    };
  }, [messages]);

  // Auto-mark own messages as delivered when they appear
  useEffect(() => {
    const ownUndeliveredMessages = messages
      .filter(message => 
        message.sender_id === currentUserId && 
        message.status === MessageStatus.SENT
      )
      .map(message => message.id);

    if (ownUndeliveredMessages.length > 0) {
      // Small delay to ensure message is properly displayed
      const timer = setTimeout(() => {
        markAsDelivered(ownUndeliveredMessages);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [messages, currentUserId, markAsDelivered]);

  return {
    registerMessageElement
  };
};