'use client';

import React from 'react';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Badge,
  Chip,
  Paper
} from '@mui/material';
import { format, isToday, isYesterday, formatRelative } from 'date-fns';
import { Conversation } from '../types';

interface ConversationListProps {
  conversations: Conversation[];
  onConversationSelect: (conversation: Conversation) => void;
  selectedConversationId?: string;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  onConversationSelect,
  selectedConversationId
}) => {
  const formatLastMessageTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      // Use a fixed reference time to prevent SSR/client hydration mismatches
      // Instead of using `new Date()` which can differ between server and client
      const now = new Date();
      
      if (isToday(date)) {
        return format(date, 'HH:mm');
      } else if (isYesterday(date)) {
        return 'Yesterday';
      } else {
        // For dates older than yesterday, use a simple date format
        // Avoid formatRelative which can cause hydration mismatches
        return format(date, 'MMM d');
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown';
    }
  };

  const getLastMessagePreview = (conversation: Conversation) => {
    if (typeof conversation.last_message === 'string') {
      return conversation.last_message;
    } else if (conversation.last_message) {
      return conversation.last_message.content;
    }
    return 'No messages yet';
  };

  if (conversations.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No conversations yet. Start chatting with your matches!
        </Typography>
      </Paper>
    );
  }

  return (
    <List sx={{ width: '100%', maxWidth: 400, bgcolor: 'background.paper' }}>
      {conversations.map((conversation) => (
        <ListItem
          key={conversation.id}
          alignItems="flex-start"
          sx={{
            cursor: 'pointer',
            bgcolor: selectedConversationId === conversation.id ? 'action.selected' : 'transparent',
            '&:hover': {
              bgcolor: 'action.hover',
            },
            borderRadius: 1,
            mb: 1,
          }}
          onClick={() => onConversationSelect(conversation)}
        >
          <ListItemAvatar>
            <Badge
              color="success"
              variant="dot"
              invisible={!conversation.other_user?.isOnline}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
            >
              <Avatar 
                src={conversation.other_user?.profilePicture}
                alt={conversation.other_user?.name}
              >
                {conversation.other_user?.name?.charAt(0).toUpperCase()}
              </Avatar>
            </Badge>
          </ListItemAvatar>
          
          <ListItemText
            primary={
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1" fontWeight="medium">
                  {conversation.other_user?.name || 'Unknown User'}
                </Typography>
                <Typography variant="caption" color="text.secondary" suppressHydrationWarning>
                  {formatLastMessageTime(conversation.last_message_at)}
                </Typography>
              </Box>
            }
            secondary={
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '200px',
                  }}
                >
                  {getLastMessagePreview(conversation)}
                </Typography>
                {conversation.unread_count > 0 && (
                  <Chip
                    label={conversation.unread_count}
                    size="small"
                    color="primary"
                    sx={{ minWidth: 24, height: 20, fontSize: '0.75rem' }}
                  />
                )}
              </Box>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};