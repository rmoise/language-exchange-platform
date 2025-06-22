'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  CircularProgress,
  IconButton,
  Tooltip,
  Chip,
  Alert
} from '@mui/material';
import {
  Translate as TranslateIcon,
  Close as CloseIcon,
  SwapHoriz as SwapIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { motion, AnimatePresence, useAnimation, PanInfo } from 'framer-motion';
import { useGesture } from 'react-use-gesture';
import { format } from 'date-fns';
import { MessageStatusIndicator } from './MessageStatusIndicator';
import { useTranslation, useTranslationPreferences } from '@/hooks/useTranslation';
import { Message, MessageStatus } from '../types';

interface SwipeTranslateMessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showAvatar?: boolean;
  isUnsendable?: boolean;
  isPendingUnsend?: boolean;
  onRegisterElement?: (messageId: string, element: HTMLElement | null) => void;
  // Translation specific props
  enableTranslation?: boolean;
  sourceLang?: string;
  targetLang?: string;
}

export const SwipeTranslateMessageBubble: React.FC<SwipeTranslateMessageBubbleProps> = ({
  message,
  isOwnMessage,
  showAvatar = true,
  isUnsendable = false,
  isPendingUnsend = false,
  onRegisterElement,
  enableTranslation = true,
  sourceLang,
  targetLang
}) => {
  const messageRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  
  // Translation state
  const [showTranslation, setShowTranslation] = useState(false);
  const [hasTriggeredTranslation, setHasTriggeredTranslation] = useState(false);
  const [swipeThreshold] = useState(80); // pixels
  
  // Hooks
  const { 
    translateMessage, 
    getMessageTranslation, 
    clearMessageTranslation, 
    isTranslating 
  } = useTranslation({
    autoDetectSource: true,
    enableCaching: true
  });
  
  const { 
    sourceLanguage: defaultSourceLang, 
    targetLanguage: defaultTargetLang 
  } = useTranslationPreferences();

  // Get current translation
  const currentTranslation = getMessageTranslation(message.id);

  // Register element for status tracking
  useEffect(() => {
    if (onRegisterElement && messageRef.current) {
      onRegisterElement(message.id, messageRef.current);
      
      return () => {
        onRegisterElement(message.id, null);
      };
    }
  }, [message.id, onRegisterElement]);

  // Handle translation trigger
  const handleTranslationTrigger = useCallback(async () => {
    if (!enableTranslation || hasTriggeredTranslation || currentTranslation) {
      return;
    }

    setHasTriggeredTranslation(true);
    setShowTranslation(true);

    const finalSourceLang = sourceLang || defaultSourceLang;
    const finalTargetLang = targetLang || defaultTargetLang;

    try {
      await translateMessage(message.id, message.content, finalSourceLang, finalTargetLang);
    } catch (error) {
      console.error('Translation failed:', error);
    }
  }, [
    enableTranslation, 
    hasTriggeredTranslation, 
    currentTranslation, 
    translateMessage, 
    message.id, 
    message.content, 
    sourceLang, 
    targetLang, 
    defaultSourceLang, 
    defaultTargetLang
  ]);

  // Handle manual translation toggle
  const handleManualTranslation = useCallback(() => {
    if (currentTranslation && !currentTranslation.isLoading) {
      setShowTranslation(!showTranslation);
    } else {
      handleTranslationTrigger();
    }
  }, [currentTranslation, showTranslation, handleTranslationTrigger]);

  // Handle closing translation
  const handleCloseTranslation = useCallback(() => {
    setShowTranslation(false);
  }, []);

  // Handle clearing translation
  const handleClearTranslation = useCallback(() => {
    clearMessageTranslation(message.id);
    setShowTranslation(false);
    setHasTriggeredTranslation(false);
  }, [clearMessageTranslation, message.id]);

  // Gesture handlers for swipe detection
  const bind = useGesture({
    onDrag: ({ active, movement: [mx], direction: [xDir], velocity: [vx], cancel }: any) => {
      // Only trigger on right-to-left swipe (negative mx)
      if (!enableTranslation || isOwnMessage || mx > 0) {
        cancel?.();
        return;
      }

      const shouldTrigger = Math.abs(mx) > swipeThreshold || (Math.abs(vx) > 0.5 && xDir < 0);

      if (active) {
        // Show visual feedback during swipe
        const translateX = Math.max(mx, -100); // Limit swipe distance
        controls.set({ 
          x: translateX,
          scale: 1 - Math.abs(translateX) * 0.001,
          transition: { type: 'spring', stiffness: 300, damping: 30 }
        });
      } else {
        // Reset position
        controls.start({ 
          x: 0, 
          scale: 1,
          transition: { type: 'spring', stiffness: 300, damping: 30 }
        });

        // Trigger translation if threshold met
        if (shouldTrigger && !hasTriggeredTranslation) {
          handleTranslationTrigger();
        }
      }
    }
  }, {
    drag: {
      axis: 'x',
      bounds: { left: -120, right: 0 },
      rubberband: true,
      filterTaps: true,
    }
  });

  const formatTime = (dateString: string) => {
    try {
      const messageDate = new Date(dateString);
      
      if (isNaN(messageDate.getTime())) {
        return 'Invalid';
      }
      
      const now = new Date();
      
      if (format(messageDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')) {
        return format(messageDate, 'HH:mm');
      }
      
      return format(messageDate, 'MMM d');
    } catch (error) {
      console.error('Error formatting message time:', error);
      return 'Unknown';
    }
  };

  const shouldShowTranslationIndicator = enableTranslation && !isOwnMessage && !hasTriggeredTranslation;
  const hasTranslation = currentTranslation && !currentTranslation.isLoading && !currentTranslation.error;
  const translationError = currentTranslation?.error;

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
        mx: 1,
        position: 'relative'
      }}
    >
      {/* Avatar */}
      {showAvatar && !isOwnMessage && (
        <Avatar
          src={message.sender?.profilePicture}
          alt={message.sender?.name}
          sx={{ width: 32, height: 32, zIndex: 2 }}
        >
          {message.sender?.name?.charAt(0).toUpperCase()}
        </Avatar>
      )}
      
      {showAvatar && isOwnMessage && <Box sx={{ width: 32 }} />}

      {/* Message Container */}
      <Box
        ref={containerRef}
        sx={{
          maxWidth: '70%',
          minWidth: '100px',
          position: 'relative'
        }}
      >
        {/* Swipe Hint for non-own messages */}
        <AnimatePresence>
          {shouldShowTranslationIndicator && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 0.6, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'absolute',
                right: '100%',
                top: '50%',
                transform: 'translateY(-50%)',
                marginRight: '8px',
                zIndex: 1,
                pointerEvents: 'none'
              }}
            >
              <Chip
                icon={<TranslateIcon sx={{ fontSize: '14px' }} />}
                label="Swipe to translate"
                size="small"
                sx={{
                  backgroundColor: 'rgba(99, 102, 241, 0.2)',
                  color: '#a5b4fc',
                  fontSize: '0.7rem',
                  height: '24px',
                  '& .MuiChip-icon': {
                    fontSize: '14px'
                  }
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Message Bubble */}
        <motion.div
          {...(enableTranslation && !isOwnMessage ? bind() : {})}
          animate={controls}
          style={{
            position: 'relative',
            touchAction: 'pan-y' // Allow vertical scrolling while capturing horizontal swipes
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
              transition: 'all 0.2s ease-in-out',
              cursor: enableTranslation && !isOwnMessage ? 'grab' : 'default',
              '&:active': {
                cursor: enableTranslation && !isOwnMessage ? 'grabbing' : 'default'
              }
            }}
          >
            {/* Original Message Content */}
            <Typography 
              variant="body1" 
              sx={{ 
                wordBreak: 'break-word',
                opacity: showTranslation && hasTranslation ? 0.7 : 1,
                transition: 'opacity 0.2s ease-in-out'
              }}
            >
              {message.content}
            </Typography>

            {/* Translation Content */}
            <AnimatePresence>
              {showTranslation && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
                    {/* Loading State */}
                    {currentTranslation?.isLoading && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={16} sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                        <Typography variant="body2" sx={{ fontStyle: 'italic', opacity: 0.8 }}>
                          Translating...
                        </Typography>
                      </Box>
                    )}

                    {/* Translation Result */}
                    {hasTranslation && (
                      <Box>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            wordBreak: 'break-word',
                            fontWeight: 500
                          }}
                        >
                          {currentTranslation.translatedText}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            opacity: 0.7,
                            fontSize: '0.7rem',
                            mt: 0.5,
                            display: 'block'
                          }}
                        >
                          {currentTranslation.sourceLang.toUpperCase()} → {currentTranslation.targetLang.toUpperCase()}
                        </Typography>
                      </Box>
                    )}

                    {/* Error State */}
                    {translationError && (
                      <Alert 
                        severity="error" 
                        sx={{ 
                          mt: 1,
                          backgroundColor: 'rgba(244, 67, 54, 0.1)',
                          color: 'rgba(244, 67, 54, 0.9)',
                          '& .MuiAlert-icon': {
                            color: 'rgba(244, 67, 54, 0.9)'
                          }
                        }}
                      >
                        <Typography variant="caption">
                          {translationError}
                        </Typography>
                      </Alert>
                    )}
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Message Footer */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 0.5,
                mt: 0.5
              }}
            >
              {/* Time and Status */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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

              {/* Translation Controls */}
              {enableTranslation && !isOwnMessage && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {/* Manual Translation Button */}
                  <Tooltip title={hasTranslation ? (showTranslation ? "Hide translation" : "Show translation") : "Translate"}>
                    <IconButton
                      size="small"
                      onClick={handleManualTranslation}
                      disabled={currentTranslation?.isLoading}
                      sx={{
                        color: isOwnMessage ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                        padding: '2px',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)'
                        }
                      }}
                    >
                      <TranslateIcon sx={{ fontSize: '14px' }} />
                    </IconButton>
                  </Tooltip>

                  {/* Close Translation Button */}
                  {showTranslation && (
                    <Tooltip title="Close translation">
                      <IconButton
                        size="small"
                        onClick={handleCloseTranslation}
                        sx={{
                          color: isOwnMessage ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                          padding: '2px',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)'
                          }
                        }}
                      >
                        <CloseIcon sx={{ fontSize: '12px' }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              )}
            </Box>
          </Paper>
        </motion.div>
      </Box>
    </Box>
  );
};