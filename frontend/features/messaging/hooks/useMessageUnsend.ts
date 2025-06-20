'use client';

import { useState, useCallback, useRef, useTransition } from 'react';
import { Message } from '../types';
import { MessagingService } from '../messagingService';

interface UnsendableMessage {
  message: Message;
  timestamp: number;
  unsendTimeout: NodeJS.Timeout;
}

interface UseMessageUnsendOptions {
  unsendTimeoutMs?: number;
  onMessageUnsent?: (messageId: string) => void;
  onUnsendExpired?: (messageId: string) => void;
}

export const useMessageUnsend = (options: UseMessageUnsendOptions = {}) => {
  const {
    unsendTimeoutMs = 5000, // 5 seconds to unsend
    onMessageUnsent,
    onUnsendExpired
  } = options;

  const [unsendableMessages, setUnsendableMessages] = useState<Map<string, UnsendableMessage>>(new Map());
  const [isPending, startTransition] = useTransition();
  const unsendableRef = useRef(unsendableMessages);

  // Keep ref in sync with state
  unsendableRef.current = unsendableMessages;

  const addUnsendableMessage = useCallback((message: Message) => {
    // Create timeout for automatic expiry
    const unsendTimeout = setTimeout(() => {
      startTransition(() => {
        setUnsendableMessages(prev => {
          const newMap = new Map(prev);
          newMap.delete(message.id);
          return newMap;
        });
        onUnsendExpired?.(message.id);
      });
    }, unsendTimeoutMs);

    const unsendableMessage: UnsendableMessage = {
      message,
      timestamp: Date.now(),
      unsendTimeout
    };

    startTransition(() => {
      setUnsendableMessages(prev => {
        const newMap = new Map(prev);
        newMap.set(message.id, unsendableMessage);
        return newMap;
      });
    });

    return message.id;
  }, [unsendTimeoutMs, onUnsendExpired]);

  const unsendMessage = useCallback(async (messageId: string): Promise<boolean> => {
    const unsendableMessage = unsendableRef.current.get(messageId);
    
    if (!unsendableMessage) {
      console.warn('Message not found in unsendable messages:', messageId);
      return false;
    }

    try {
      // Clear the timeout
      clearTimeout(unsendableMessage.unsendTimeout);

      // Remove from unsendable messages immediately for UI responsiveness
      startTransition(() => {
        setUnsendableMessages(prev => {
          const newMap = new Map(prev);
          newMap.delete(messageId);
          return newMap;
        });
      });

      // Actually delete the message from the server
      // Note: You'll need to implement a delete message API endpoint
      // For now, we'll simulate this
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      
      // Actually delete the message from the server
      await MessagingService.deleteMessage(messageId);

      onMessageUnsent?.(messageId);
      return true;
    } catch (error) {
      console.error('Failed to unsend message:', error);
      
      // If unsend fails, put the message back in unsendable state
      const newTimeout = setTimeout(() => {
        startTransition(() => {
          setUnsendableMessages(prev => {
            const newMap = new Map(prev);
            newMap.delete(messageId);
            return newMap;
          });
          onUnsendExpired?.(messageId);
        });
      }, unsendTimeoutMs);

      startTransition(() => {
        setUnsendableMessages(prev => {
          const newMap = new Map(prev);
          newMap.set(messageId, {
            ...unsendableMessage,
            unsendTimeout: newTimeout
          });
          return newMap;
        });
      });

      return false;
    }
  }, [onMessageUnsent, onUnsendExpired, unsendTimeoutMs]);

  const isMessageUnsendable = useCallback((messageId: string): boolean => {
    return unsendableRef.current.has(messageId);
  }, []);

  const getUnsendTimeRemaining = useCallback((messageId: string): number => {
    const unsendableMessage = unsendableRef.current.get(messageId);
    if (!unsendableMessage) return 0;

    const elapsed = Date.now() - unsendableMessage.timestamp;
    const remaining = Math.max(0, unsendTimeoutMs - elapsed);
    return remaining;
  }, [unsendTimeoutMs]);

  const clearAllUnsendable = useCallback(() => {
    // Clear all timeouts
    unsendableRef.current.forEach(({ unsendTimeout }) => {
      clearTimeout(unsendTimeout);
    });

    startTransition(() => {
      setUnsendableMessages(new Map());
    });
  }, []);

  const getUnsendableMessageIds = useCallback((): string[] => {
    return Array.from(unsendableRef.current.keys());
  }, []);

  return {
    addUnsendableMessage,
    unsendMessage,
    isMessageUnsendable,
    getUnsendTimeRemaining,
    clearAllUnsendable,
    getUnsendableMessageIds,
    isPending,
    unsendableCount: unsendableMessages.size
  };
};