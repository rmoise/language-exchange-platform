'use client';

import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Fade,
  Chip
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

const bounce = keyframes`
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
`;

const TypingDot = styled('span')(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: theme.palette.text.secondary,
  display: 'inline-block',
  margin: '0 1px',
  animation: `${bounce} 1.4s infinite ease-in-out both`,
  
  '&:nth-of-type(1)': {
    animationDelay: '-0.32s',
  },
  '&:nth-of-type(2)': {
    animationDelay: '-0.16s',
  },
  '&:nth-of-type(3)': {
    animationDelay: '0s',
  },
}));

interface TypingIndicatorProps {
  isVisible: boolean;
  typingText: string;
  showDots?: boolean;
  showAvatar?: boolean;
  avatarSrc?: string;
  compact?: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  isVisible,
  typingText,
  showDots = true,
  showAvatar = false,
  avatarSrc,
  compact = false
}) => {
  if (!isVisible) return null;

  if (compact) {
    return (
      <Fade in={isVisible}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 0.5,
            px: 1
          }}
        >
          <Chip
            size="small"
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="caption" color="text.secondary">
                  {typingText}
                </Typography>
                {showDots && (
                  <Box display="flex" alignItems="center" gap={0.25}>
                    <TypingDot />
                    <TypingDot />
                    <TypingDot />
                  </Box>
                )}
              </Box>
            }
            variant="outlined"
            sx={{
              bgcolor: 'background.paper',
              borderColor: 'divider',
              '& .MuiChip-label': {
                px: 1,
                py: 0.5
              }
            }}
          />
        </Box>
      </Fade>
    );
  }

  return (
    <Fade in={isVisible}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1,
          mb: 1,
          mx: 1
        }}
      >
        {showAvatar && (
          <Avatar
            src={avatarSrc}
            sx={{ width: 32, height: 32 }}
          >
            {typingText.charAt(0).toUpperCase()}
          </Avatar>
        )}
        
        <Box
          sx={{
            bgcolor: 'grey.100',
            borderRadius: 2,
            borderTopLeftRadius: showAvatar ? 0.5 : 2,
            px: 2,
            py: 1.5,
            maxWidth: '70%',
            minWidth: '60px'
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">
              {typingText}
            </Typography>
            
            {showDots && (
              <Box display="flex" alignItems="center" gap={0.25} ml={0.5}>
                <TypingDot />
                <TypingDot />
                <TypingDot />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Fade>
  );
};