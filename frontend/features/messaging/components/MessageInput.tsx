'use client';

import React, { useActionState, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  CircularProgress
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { MessagingService } from '../messagingService';
import { Message, MessageType } from '../types';

interface MessageInputProps {
  conversationId: string;
  onMessageSent?: (message: Message) => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  conversationId,
  onMessageSent,
  onTypingStart,
  onTypingStop
}) => {
  const formRef = useRef<HTMLFormElement>(null);
  
  // Using React 19's useActionState for form handling
  const [error, submitAction, isPending] = useActionState(
    async (previousState: string | null, formData: FormData) => {
      try {
        const content = formData.get('message') as string;
        
        if (!content.trim()) {
          return 'Message cannot be empty';
        }

        const sentMessage = await MessagingService.sendMessage(conversationId, {
          content: content.trim(),
          message_type: MessageType.TEXT
        });

        // Reset form on success
        formRef.current?.reset();
        onMessageSent?.(sentMessage);
        
        // Stop typing indicator when message is sent
        onTypingStop?.();
        
        return null; // No error
      } catch (err) {
        console.error('Failed to send message:', err);
        return 'Failed to send message. Please try again.';
      }
    },
    null // Initial state
  );

  return (
    <Box 
      sx={{ 
        p: 3, 
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(255, 255, 255, 0.05)'
      }}
    >
      {/* Using React 19's form Actions */}
      <form ref={formRef} action={submitAction}>
        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            name="message"
            placeholder="Type a message..."
            variant="outlined"
            size="small"
            fullWidth
            multiline
            maxRows={4}
            disabled={isPending}
            onChange={(e) => {
              // Trigger typing indicator when user starts typing
              if (e.target.value.length > 0) {
                onTypingStart?.();
              } else {
                onTypingStop?.();
              }
            }}
            onKeyDown={(e) => {
              // Stop typing when user presses Enter (form will submit)
              if (e.key === 'Enter' && !e.shiftKey) {
                onTypingStop?.();
              }
            }}
            onBlur={() => {
              // Stop typing when input loses focus
              onTypingStop?.();
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 1,
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
          
          <IconButton 
            type="submit"
            disabled={isPending}
            sx={{ 
              background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
              color: 'white',
              width: 40,
              height: 40,
              borderRadius: 1,
              '&:hover': {
                background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
              },
              '&:disabled': {
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.3)',
              }
            }}
          >
            {isPending ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SendIcon sx={{ fontSize: 20 }} />
            )}
          </IconButton>
        </Box>
        
        {error && (
          <Box mt={1}>
            <Box
              component="span"
              sx={{
                color: '#ef4444',
                fontSize: '0.75rem',
                display: 'block'
              }}
            >
              {error}
            </Box>
          </Box>
        )}
      </form>
    </Box>
  );
};