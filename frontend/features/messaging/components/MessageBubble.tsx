'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Popover,
  Button,
} from '@mui/material';
import { AutoFixHigh as ImproveIcon } from '@mui/icons-material';
import { format, formatRelative } from 'date-fns';
import { Message, MessageStatus } from '../types';
import { MessageStatusIndicator } from './MessageStatusIndicator';
import { SwipeTranslateMessageBubble } from './SwipeTranslateMessageBubble';
import { aiImprovementService } from '@/services/aiImprovementService';
import { UpgradeToProModal } from '@/components/ui/UpgradeToProModal';
import UserAvatar from '@/components/ui/UserAvatar';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showAvatar?: boolean;
  isUnsendable?: boolean;
  isPendingUnsend?: boolean;
  onRegisterElement?: (messageId: string, element: HTMLElement | null) => void;
  // Translation props
  enableTranslation?: boolean;
  useSwipeTranslation?: boolean;
  sourceLang?: string;
  targetLang?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  showAvatar = true,
  isUnsendable = false,
  isPendingUnsend = false,
  onRegisterElement,
  enableTranslation = true,
  useSwipeTranslation = true,
  sourceLang,
  targetLang
}) => {
  const [isImproving, setIsImproving] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeModalData, setUpgradeModalData] = useState<{
    preview?: string;
    originalText?: string;
    usageInfo?: { used: number; limit: number };
  }>({});
  // Use SwipeTranslateMessageBubble if translation is enabled
  if (enableTranslation && useSwipeTranslation) {
    return (
      <SwipeTranslateMessageBubble
        message={message}
        isOwnMessage={isOwnMessage}
        showAvatar={showAvatar}
        isUnsendable={isUnsendable}
        isPendingUnsend={isPendingUnsend}
        onRegisterElement={onRegisterElement}
        enableTranslation={enableTranslation}
        sourceLang={sourceLang}
        targetLang={targetLang}
      />
    );
  }
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

  const handleImprove = async () => {
    if (isImproving) return;
    
    setIsImproving(true);
    try {
      const response = await aiImprovementService.improveMessage(message.content);
      
      if (response.needs_upgrade) {
        // Show upgrade modal
        setUpgradeModalData({
          preview: response.preview,
          originalText: message.content,
          usageInfo: response.used && response.limit ? {
            used: response.used,
            limit: response.limit
          } : undefined
        });
        setShowUpgradeModal(true);
      } else if (response.improved) {
        // TODO: Show improved message or update the message
        console.log('Improved message:', response.improved);
        // For now, just show an alert - in production, you'd update the message
        alert(`Improved: ${response.improved}`);
      }
    } catch (error) {
      console.error('Failed to improve message:', error);
    } finally {
      setIsImproving(false);
    }
  };


  return (
    <>
      <Box
        ref={messageRef}
        data-message-id={message.id}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
          gap: 1,
          mb: 2,
          px: 2,
          width: '100%'
        }}
      >
      {showAvatar && !isOwnMessage && (
        <UserAvatar
          user={message.sender}
          size={32}
          showOnlineStatus={false}
        />
      )}

      <Box
        sx={{
          maxWidth: '70%',
          minWidth: '100px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isOwnMessage ? 'flex-end' : 'flex-start'
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            backgroundColor: isPendingUnsend 
              ? 'rgba(251, 191, 36, 0.2)' 
              : isUnsendable 
                ? (isOwnMessage ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.1)')
                : (isOwnMessage ? 'rgba(139, 92, 246, 0.8)' : '#f3f4f6'),
            color: isOwnMessage ? 'white' : '#111827',
            borderRadius: '16px',
            borderTopLeftRadius: isOwnMessage ? '16px' : '4px',
            borderTopRightRadius: isOwnMessage ? '4px' : '16px',
            border: '1px solid',
            borderColor: isPendingUnsend
              ? 'rgba(251, 191, 36, 0.3)'
              : isOwnMessage 
                ? 'rgba(139, 92, 246, 0.2)' 
                : '#e5e7eb',
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
              justifyContent: isOwnMessage ? 'space-between' : 'flex-end',
              gap: 0.5,
              mt: 0.5
            }}
          >
            {/* Improve button for own messages */}
            {isOwnMessage && (
              <Tooltip title="Improve with AI">
                <IconButton
                  size="small"
                  onClick={handleImprove}
                  disabled={isImproving || isPendingUnsend}
                  sx={{
                    p: 0.5,
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&:hover': {
                      color: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  {isImproving ? (
                    <CircularProgress size={16} sx={{ color: 'inherit' }} />
                  ) : (
                    <ImproveIcon sx={{ fontSize: 16 }} />
                  )}
                </IconButton>
              </Tooltip>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255, 255, 255, 0.6)',
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
          </Box>
        </Box>
      </Box>
      </Box>
      
      {/* Upgrade Modal */}
      <UpgradeToProModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        preview={upgradeModalData.preview}
        originalText={upgradeModalData.originalText}
        usageInfo={upgradeModalData.usageInfo}
      />
    </>
  );
};