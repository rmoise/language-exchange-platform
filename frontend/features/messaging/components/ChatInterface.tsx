'use client';

import React, { useState, useEffect, useRef, Suspense, use, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Avatar,
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
        color="text.secondary"
      >
        <Typography variant="h6" gutterBottom>
          No messages yet
        </Typography>
        <Typography variant="body2">
          Start the conversation by sending a message!
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      {messages.map((message, index) => {
        const isOwnMessage = message.sender_id === currentUserId;
        const showAvatar = !isOwnMessage && (
          index === 0 || 
          messages[index - 1]?.sender_id !== message.sender_id
        );

        const isUnsendable = isOwnMessage && unsendHook.isMessageUnsendable(message.id);

        return (
          <MessageBubble
            key={message.id}
            message={message}
            isOwnMessage={isOwnMessage}
            showAvatar={showAvatar}
            isUnsendable={isUnsendable}
            isPendingUnsend={unsendHook.isPending}
            onRegisterElement={statusHook.registerMessageElement}
          />
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
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        bgcolor: 'background.default'
      }}
    >
      <Avatar
        src={conversation.other_user?.profilePicture}
        alt={conversation.other_user?.name}
        sx={{ width: 40, height: 40 }}
      >
        {conversation.other_user?.name?.charAt(0).toUpperCase()}
      </Avatar>
      
      <Box>
        <Typography variant="h6" fontWeight="medium">
          {conversation.other_user?.name || 'Unknown User'}
        </Typography>
        {conversation.other_user?.isOnline && (
          <Typography variant="caption" color="success.main">
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
  const [currentUserId, setCurrentUserId] = useState<string>(''); // This should come from auth context
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
    const msgPromise = MessagingService.getMessages(conversationId)
      .then(response => {
        setLocalMessages(response.messages);
        return response.messages;
      });
    setMessagesPromise(msgPromise);
  }, [conversationId]);
  
  // Initialize promises
  useEffect(() => {
    const loadData = () => {
      // Create promises for React 19's use API
      refreshMessages();
      const convPromise = MessagingService.getConversation(conversationId);
      setConversationPromise(convPromise);
    };

    loadData();
    
    // TODO: Get current user ID from auth context
    // For now, using a placeholder
    setCurrentUserId('current-user-id');
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
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        height: 'calc(100vh - 200px)', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Header with conversation info */}
      <Suspense fallback={
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={20} />
          <Typography>Loading conversation...</Typography>
        </Box>
      }>
        <ConversationHeader conversationPromise={conversationPromise} />
      </Suspense>
      
      <Divider />
      
      {/* Messages area */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <Suspense fallback={
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
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
    </Paper>
  );
};