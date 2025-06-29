'use client';

import React, { useState, useEffect, useRef, Suspense, use, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Divider
} from '@mui/material';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { UnsendSnackbar } from './UnsendSnackbar';
import { MessagingService } from '../messagingService';
import { useWebSocket } from '../hooks/useWebSocket';
import { useMessageUnsend } from '../hooks/useMessageUnsend';
import { useMessageStatus } from '../hooks/useMessageStatus';
import { useTypingIndicator } from '../hooks/useTypingIndicator';
import { TypingIndicator } from './TypingIndicator';
import { Message, Conversation, MessageStatus } from '../types';
import { useAppSelector } from '@/lib/hooks';
import UserAvatar from '@/components/ui/UserAvatar';

interface ChatInterfaceProps {
  conversationId: string;
}

// Component that uses React 19's `use` API for reading promises
function MessagesContent({ 
  messagesPromise, 
  currentUserId,
  conversationId,
  onMessageUnsent,
  unsendHook,
  statusHook,
  typingHook
}: { 
  messagesPromise: Promise<Message[]>, 
  currentUserId: string,
  conversationId: string,
  onMessageUnsent: (messageId: string) => void,
  unsendHook: ReturnType<typeof useMessageUnsend>,
  statusHook: ReturnType<typeof useMessageStatus>,
  typingHook: ReturnType<typeof useTypingIndicator>
}) {
  // Using React 19's `use` API - this will suspend until promise resolves
  const messages = use(messagesPromise);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100%"
        sx={{ py: 8 }}
      >
        <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
          No messages yet
        </Typography>
        <Typography variant="body2" sx={{ color: '#9ca3af' }}>
          Start the conversation by sending a message!
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 3, 
      height: '100%', 
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column',
      '&::-webkit-scrollbar': {
        width: '8px',
      },
      '&::-webkit-scrollbar-track': {
        background: 'rgba(255, 255, 255, 0.05)',
      },
      '&::-webkit-scrollbar-thumb': {
        background: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '4px',
      },
      '&::-webkit-scrollbar-thumb:hover': {
        background: 'rgba(255, 255, 255, 0.3)',
      }
    }}>
      {messages.map((message, index) => {
        const isOwnMessage = message.sender_id === currentUserId;
        const showAvatar = !isOwnMessage; // Always show avatar for received messages

        const isUnsendable = isOwnMessage && unsendHook.isMessageUnsendable(message.id);

        return (
          <Box
            key={message.id}
            sx={{
              width: '100%',
              animationDelay: `${index * 0.05}s`,
              animation: 'fadeInUp 0.3s ease-out forwards',
              opacity: 0,
              '@keyframes fadeInUp': {
                from: {
                  opacity: 0,
                  transform: 'translateY(20px)',
                },
                to: {
                  opacity: 1,
                  transform: 'translateY(0)',
                },
              },
            }}
          >
            <MessageBubble
              message={message}
              isOwnMessage={isOwnMessage}
              showAvatar={showAvatar}
              isUnsendable={isUnsendable}
              isPendingUnsend={unsendHook.isPending}
              onRegisterElement={statusHook.registerMessageElement}
            />
          </Box>
        );
      })}
      
      {/* Typing indicator */}
      <TypingIndicator
        isVisible={typingHook.hasTypingUsers}
        typingText={typingHook.getTypingText()}
        showDots={true}
        showAvatar={false}
        compact={false}
      />
      
      <div ref={messagesEndRef} />
    </Box>
  );
}

// Component that uses React 19's `use` API for conversation data
function ConversationHeader({ conversationPromise }: { 
  conversationPromise: Promise<Conversation> 
}) {
  const conversation = use(conversationPromise);
  
  return (
    <Box
      sx={{
        p: 3,
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        background: 'rgba(255, 255, 255, 0.05)'
      }}
    >
      <UserAvatar
        user={conversation.other_user}
        size={40}
        showOnlineStatus={false}
      />
      
      <Box>
        <Typography variant="h6" fontWeight="medium" sx={{ color: 'white', fontSize: '1rem' }}>
          {conversation.other_user?.name || 'Unknown User'}
        </Typography>
        {conversation.other_user?.isOnline && (
          <Typography variant="caption" sx={{ color: '#4ade80' }}>
            Online
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversationId
}) => {
  const [messagesPromise, setMessagesPromise] = useState<Promise<Message[]>>();
  const [conversationPromise, setConversationPromise] = useState<Promise<Conversation>>();
  const currentUser = useAppSelector(state => state.auth.user);
  const currentUserId = currentUser?.id || '';
  const [lastUnsent, setLastUnsent] = useState<string | null>(null);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);

  // Initialize unsend functionality
  const unsendHook = useMessageUnsend({
    unsendTimeoutMs: 5000,
    onMessageUnsent: (messageId) => {
      setLastUnsent(messageId);
      // Refresh messages to remove the unsent message
      refreshMessages();
    },
    onUnsendExpired: (messageId) => {
      // Message can no longer be unsent
      console.log('Unsend expired for message:', messageId);
    }
  });

  // Initialize WebSocket connection
  const { isConnected, sendTypingIndicator } = useWebSocket({
    onNewMessage: (newMessage) => {
      // Add new message to the current promise
      if (newMessage.conversation_id === conversationId) {
        setLocalMessages(prev => [...prev, newMessage]);
        refreshMessages();
      }
    },
    onMessageRead: (data) => {
      // Handle message read status updates
      if (data.conversation_id === conversationId) {
        refreshMessages();
      }
    },
    onTyping: (indicator) => {
      // Handle typing indicators
      typingHook.handleTypingIndicator(indicator);
    },
    onUserOnline: (status) => {
      // Handle user online status
      console.log('User online status:', status);
    }
  });

  // Initialize message status tracking
  const statusHook = useMessageStatus({
    messages: localMessages,
    currentUserId,
    conversationId,
    onStatusUpdate: (messageId, status) => {
      // Update local message status
      setLocalMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, status } : msg
        )
      );
    }
  });

  // Initialize typing indicators
  const typingHook = useTypingIndicator({
    conversationId,
    currentUserId,
    sendTypingIndicator,
    typingTimeoutMs: 3000
  });

  const refreshMessages = useCallback(() => {
    // Validate conversation ID
    if (!conversationId || conversationId === 'undefined') {
      console.error('Cannot refresh messages - invalid conversation ID:', conversationId);
      setMessagesPromise(Promise.resolve([]));
      return;
    }
    
    const msgPromise = MessagingService.getMessages(conversationId)
      .then(response => {
        setLocalMessages(response.messages || []);
        return response.messages || [];
      })
      .catch(error => {
        console.error('Failed to load messages:', error);
        return [];
      });
    setMessagesPromise(msgPromise);
  }, [conversationId]);
  
  // Initialize promises
  useEffect(() => {
    const loadData = async () => {
      // Validate conversation ID first
      if (!conversationId || conversationId === 'undefined') {
        console.error('Invalid conversation ID:', conversationId);
        return;
      }
      
      // Mark messages as read when conversation is opened
      try {
        await MessagingService.markAsRead(conversationId);
      } catch (error) {
        console.error('Failed to mark messages as read:', error);
      }
      
      // Create promises for React 19's use API
      refreshMessages();
      const convPromise = MessagingService.getConversation(conversationId)
        .catch(error => {
          console.error('Failed to load conversation:', error);
          console.error('Conversation ID:', conversationId);
          
          // If it's a 400 error, it might be because the conversation doesn't exist yet
          // This can happen during the brief moment between creating a conversation and loading it
          if (error?.response?.status === 400) {
            console.log('Conversation might not exist yet, retrying in 1 second...');
            // Retry once after a delay
            return new Promise((resolve) => {
              setTimeout(() => {
                MessagingService.getConversation(conversationId)
                  .then(resolve)
                  .catch(() => {
                    // If still failing, return a default conversation object
                    resolve({
                      id: conversationId,
                      other_user: null,
                      last_message: null,
                      last_message_at: new Date().toISOString(),
                      unread_count: 0
                    } as Conversation);
                  });
              }, 1000);
            });
          }
          
          // Return a default conversation object for other errors
          return {
            id: conversationId,
            other_user: null,
            last_message: null,
            last_message_at: new Date().toISOString(),
            unread_count: 0
          } as Conversation;
        });
      setConversationPromise(convPromise);
    };

    loadData();
  }, [conversationId, refreshMessages]);

  const handleMessageSent = useCallback((newMessage: Message) => {
    // Add the message to unsendable list
    unsendHook.addUnsendableMessage(newMessage);
    
    // Refresh messages when a new message is sent
    refreshMessages();
  }, [unsendHook, refreshMessages]);

  const handleUnsendMessage = useCallback(async () => {
    const unsendableIds = unsendHook.getUnsendableMessageIds();
    if (unsendableIds.length > 0) {
      const success = await unsendHook.unsendMessage(unsendableIds[0]);
      if (success) {
        setLastUnsent(unsendableIds[0]);
      }
    }
  }, [unsendHook]);

  const handleUnsendClose = useCallback(() => {
    setLastUnsent(null);
  }, []);

  if (!messagesPromise || !conversationPromise) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress sx={{ color: '#6366f1' }} />
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'transparent',
        borderRadius: 1.5
      }}
    >
      {/* Header with conversation info */}
      <Suspense fallback={
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={20} sx={{ color: '#6366f1' }} />
          <Typography sx={{ color: 'white' }}>Loading conversation...</Typography>
        </Box>
      }>
        <ConversationHeader conversationPromise={conversationPromise} />
      </Suspense>
      
      {/* Removed divider for cleaner look */}
      
      {/* Messages area */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'hidden',
        background: 'rgba(0, 0, 0, 0.2)'
      }}>
        <Suspense fallback={
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress sx={{ color: '#6366f1' }} />
          </Box>
        }>
          <MessagesContent 
            messagesPromise={messagesPromise} 
            currentUserId={currentUserId}
            conversationId={conversationId}
            onMessageUnsent={handleUnsendMessage}
            unsendHook={unsendHook}
            statusHook={statusHook}
            typingHook={typingHook}
          />
        </Suspense>
      </Box>
      
      {/* Message input */}
      <MessageInput 
        conversationId={conversationId}
        onMessageSent={handleMessageSent}
        onTypingStart={typingHook.startTyping}
        onTypingStop={typingHook.stopTyping}
      />

      {/* Unsend snackbar */}
      <UnsendSnackbar
        messageId={unsendHook.getUnsendableMessageIds()[0] || null}
        isVisible={unsendHook.unsendableCount > 0}
        timeRemainingMs={
          unsendHook.getUnsendableMessageIds().length > 0 
            ? unsendHook.getUnsendTimeRemaining(unsendHook.getUnsendableMessageIds()[0])
            : 0
        }
        totalTimeMs={5000}
        onUnsend={handleUnsendMessage}
        onClose={handleUnsendClose}
        isPending={unsendHook.isPending}
      />
    </Box>
  );
};