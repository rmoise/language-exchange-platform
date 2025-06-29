'use client';

import React from 'react';
import {
  Box,
  Tooltip,
  Fade
} from '@mui/material';
import {
  Schedule as PendingIcon,
  Done as SentIcon,
  DoneAll as ReadIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { MessageStatus } from '../types';
import { format } from 'date-fns';

interface MessageStatusIndicatorProps {
  status: MessageStatus;
  timestamp: string;
  isOwnMessage: boolean;
  size?: 'small' | 'medium';
  showTooltip?: boolean;
}

export const MessageStatusIndicator: React.FC<MessageStatusIndicatorProps> = ({
  status,
  timestamp,
  isOwnMessage,
  size = 'small',
  showTooltip = true
}) => {
  // Only show status indicators for own messages
  if (!isOwnMessage) return null;

  const getStatusIcon = () => {
    const iconSize = size === 'small' ? 14 : 16;
    
    switch (status) {
      case MessageStatus.SENT:
        return (
          <SentIcon 
            sx={{ 
              fontSize: iconSize, 
              color: 'text.secondary',
              transition: 'color 0.2s ease'
            }} 
          />
        );
      case MessageStatus.DELIVERED:
        return (
          <ReadIcon 
            sx={{ 
              fontSize: iconSize, 
              color: 'text.secondary',
              transition: 'color 0.2s ease'
            }} 
          />
        );
      case MessageStatus.READ:
        return (
          <ReadIcon 
            sx={{ 
              fontSize: iconSize, 
              color: '#4fc3f7', // Light blue color for read status
              transition: 'color 0.2s ease'
            }} 
          />
        );
      default:
        return (
          <PendingIcon 
            sx={{ 
              fontSize: iconSize, 
              color: 'warning.main',
              transition: 'color 0.2s ease'
            }} 
          />
        );
    }
  };

  const getStatusText = () => {
    const time = format(new Date(timestamp), 'HH:mm');
    
    switch (status) {
      case MessageStatus.SENT:
        return `Sent at ${time}`;
      case MessageStatus.DELIVERED:
        return `Delivered at ${time}`;
      case MessageStatus.READ:
        return `Read at ${time}`;
      default:
        return `Sending... ${time}`;
    }
  };

  const StatusIcon = (
    <Fade in={true} timeout={300}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          opacity: 0.8,
          '&:hover': {
            opacity: 1
          }
        }}
      >
        {getStatusIcon()}
      </Box>
    </Fade>
  );

  if (!showTooltip) {
    return StatusIcon;
  }

  return (
    <Tooltip
      title={getStatusText()}
      placement="top"
      arrow
      enterDelay={500}
      leaveDelay={200}
    >
      {StatusIcon}
    </Tooltip>
  );
};