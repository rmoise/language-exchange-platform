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
    <Paper 
      elevation={1} 
      sx={{ 
        p: 2, 
        borderTop: '1px solid',
        borderColor: 'divider'
      }}
    >
      {/* Using React 19's form Actions */}
      <form ref={formRef} action={submitAction}>
        <Box display="flex" alignItems="center" gap={1}>
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
                borderRadius: 2,
              },
            }}
          />
          
          <IconButton 
            type="submit"
            color="primary"
            disabled={isPending}
            sx={{ 
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              '&:disabled': {
                bgcolor: 'grey.300',
              }
            }}
          >
            {isPending ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SendIcon />
            )}
          </IconButton>
        </Box>
        
        {error && (
          <Box mt={1}>
            <Box
              component="span"
              sx={{
                color: 'error.main',
                fontSize: '0.875rem',
                display: 'block'
              }}
            >
              {error}
            </Box>
          </Box>
        )}
      </form>
    </Paper>
  );
};