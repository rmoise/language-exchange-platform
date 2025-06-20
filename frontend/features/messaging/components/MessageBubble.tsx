'use client';

import React, { useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Chip
} from '@mui/material';
import { format, formatRelative } from 'date-fns';
import { Message, MessageStatus } from '../types';
import { MessageStatusIndicator } from './MessageStatusIndicator';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showAvatar?: boolean;
  isUnsendable?: boolean;
  isPendingUnsend?: boolean;
  onRegisterElement?: (messageId: string, element: HTMLElement | null) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  showAvatar = true,
  isUnsendable = false,
  isPendingUnsend = false,
  onRegisterElement
}) => {
  const messageRef = useRef<HTMLDivElement>(null);

  // Register element for status tracking
  useEffect(() => {
    if (onRegisterElement && messageRef.current) {
      onRegisterElement(message.id, messageRef.current);
      
      return () => {
        onRegisterElement(message.id, null);
      };
    }
  }, [message.id, onRegisterElement]);

  const formatTime = (dateString: string) => {
    try {
      const messageDate = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(messageDate.getTime())) {
        return 'Invalid';
      }
      
      const now = new Date();
      
      // If message is from today, show only time
      if (format(messageDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')) {
        return format(messageDate, 'HH:mm');
      }
      
      // For older messages, use a simple date format to avoid hydration mismatches
      return format(messageDate, 'MMM d');
    } catch (error) {
      console.error('Error formatting message time:', error);
      return 'Unknown';
    }
  };

  return (
    <Box
      ref={messageRef}
      data-message-id={message.id}
      sx={{
        display: 'flex',
        flexDirection: isOwnMessage ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: 1,
        mb: 2,
        mx: 1
      }}
    >
      {showAvatar && !isOwnMessage && (
        <Avatar
          src={message.sender?.profilePicture}
          alt={message.sender?.name}
          sx={{ width: 32, height: 32 }}
        >
          {message.sender?.name?.charAt(0).toUpperCase()}
        </Avatar>
      )}
      
      {showAvatar && isOwnMessage && <Box sx={{ width: 32 }} />}

      <Box
        sx={{
          maxWidth: '70%',
          minWidth: '100px'
        }}
      >
        <Paper
          elevation={1}
          sx={{
            px: 2,
            py: 1.5,
            backgroundColor: isPendingUnsend 
              ? 'warning.light' 
              : isUnsendable 
                ? (isOwnMessage ? 'primary.light' : 'grey.200')
                : (isOwnMessage ? 'primary.main' : 'grey.100'),
            color: isPendingUnsend 
              ? 'warning.contrastText'
              : isOwnMessage ? 'white' : 'text.primary',
            borderRadius: 2,
            borderTopLeftRadius: isOwnMessage ? 2 : 0.5,
            borderTopRightRadius: isOwnMessage ? 0.5 : 2,
            position: 'relative',
            opacity: isPendingUnsend ? 0.7 : 1,
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
            {message.content}
          </Typography>
          
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 0.5,
              mt: 0.5
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: isOwnMessage ? 'rgba(255, 255, 255, 0.8)' : 'text.secondary',
                fontSize: '0.75rem'
              }}
              suppressHydrationWarning
            >
              {formatTime(message.created_at)}
            </Typography>
            
            {isOwnMessage && (
              <MessageStatusIndicator
                status={message.status}
                timestamp={message.created_at}
                isOwnMessage={isOwnMessage}
                size="small"
                showTooltip={true}
              />
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};