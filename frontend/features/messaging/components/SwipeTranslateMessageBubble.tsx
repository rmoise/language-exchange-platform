'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
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
  Error as ErrorIcon,
  BookmarkBorder as BookmarkIcon,
  Bookmark as BookmarkedIcon
} from '@mui/icons-material';
import { motion, AnimatePresence, useAnimation, PanInfo } from 'framer-motion';
import { useGesture } from 'react-use-gesture';
import { format } from 'date-fns';
import { MessageStatusIndicator } from './MessageStatusIndicator';
import { useTranslation, useTranslationPreferences } from '@/hooks/useTranslation';
import { Message, MessageStatus } from '../types';
import UserAvatar from '@/components/ui/UserAvatar';
import { FlashcardService } from '@/features/flashcards/flashcardService';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { saveFlashcard, removeFlashcard, selectIsMessageSaved } from '@/features/flashcards/flashcardSlice';

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
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  
  // Redux state
  const isSaved = useAppSelector(state => selectIsMessageSaved(state, message.id));
  
  // Translation state
  const [showTranslation, setShowTranslation] = useState(false);
  const [hasTriggeredTranslation, setHasTriggeredTranslation] = useState(false);
  const [swipeThreshold] = useState(80); // pixels
  const [isSaving, setIsSaving] = useState(false);
  
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
    if (!enableTranslation) {
      return;
    }

    // If we already have a translation, just toggle visibility
    if (currentTranslation && !currentTranslation.isLoading) {
      setShowTranslation(!showTranslation);
      return;
    }

    // If we're already loading, don't trigger again
    if (currentTranslation?.isLoading) {
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
    currentTranslation, 
    showTranslation,
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

  // Handle saving to flashcards
  const handleSaveToFlashcards = useCallback(async () => {
    if (!user?.id || !currentTranslation || !currentTranslation.translatedText || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      if (isSaved) {
        // Remove from Redux store
        dispatch(removeFlashcard(message.id));
        // In a real app, you'd also call a delete API
        // await FlashcardService.deleteFlashcard(flashcardId);
      } else {
        const flashcard = await FlashcardService.quickSaveWord(
          user.id,
          message.content,
          currentTranslation.translatedText,
          currentTranslation.sourceLang,
          currentTranslation.targetLang,
          message.content, // Use full message as context
          window.location.href
        );
        
        // Save to Redux store
        dispatch(saveFlashcard({
          messageId: message.id,
          flashcardId: flashcard.id,
          originalText: message.content,
          translatedText: currentTranslation.translatedText,
          savedAt: new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error('Failed to save/unsave flashcard:', error);
      // Could show an error toast here
    } finally {
      setIsSaving(false);
    }
  }, [user?.id, currentTranslation, message, isSaving, isSaved, dispatch]);

  // Gesture handlers for swipe detection
  const bind = useGesture({
    onDrag: (state) => {
      if (!state) return;
      
      const { active, movement, direction, velocity, cancel } = state;
      
      // Safely extract values from arrays or provide defaults
      const mx = Array.isArray(movement) ? movement[0] : 0;
      const xDir = Array.isArray(direction) ? direction[0] : 0;
      const vx = Array.isArray(velocity) ? velocity[0] : 0;
      
      // Only trigger on right-to-left swipe (negative mx)
      if (!enableTranslation || isOwnMessage || mx > 0) {
        if (cancel) cancel();
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
        if (shouldTrigger) {
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
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
        gap: 1,
        mb: 2,
        px: 2,
        position: 'relative',
        width: '100%',
        // Debug: Add background to see container
        // backgroundColor: isOwnMessage ? 'rgba(255,0,0,0.1)' : 'rgba(0,255,0,0.1)'
      }}
    >
      {/* Avatar */}
      {showAvatar && !isOwnMessage && (
        <UserAvatar
          user={message.sender}
          size={32}
          showOnlineStatus={false}
        />
      )}
      

      {/* Message Container */}
      <Box
        ref={containerRef}
        sx={{
          maxWidth: '70%',
          minWidth: '100px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isOwnMessage ? 'flex-end' : 'flex-start'
        }}
      >
        {/* Swipe Hint for non-own messages */}
        <AnimatePresence>
          {shouldShowTranslationIndicator && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              style={{
                marginBottom: '8px',
                display: 'flex',
                justifyContent: 'flex-start',
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
                  style={{ overflow: 'visible', width: '100%' }}
                >
                  <Box sx={{ 
                    mt: 1, 
                    pt: 1, 
                    borderTop: isOwnMessage ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #e5e7eb',
                    width: '100%'
                  }}>
                    {/* Loading State */}
                    {currentTranslation?.isLoading && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={16} sx={{ color: isOwnMessage ? 'rgba(255, 255, 255, 0.7)' : '#6b7280' }} />
                        <Typography variant="body2" sx={{ fontStyle: 'italic', opacity: 0.8, color: 'inherit' }}>
                          Translating...
                        </Typography>
                      </Box>
                    )}

                    {/* Translation Result */}
                    {hasTranslation && (
                      <Box sx={{ width: '100%' }}>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            wordBreak: 'break-word',
                            fontWeight: 500,
                            width: '100%',
                            whiteSpace: 'pre-wrap',
                            color: 'inherit'
                          }}
                        >
                          {currentTranslation.translatedText}
                        </Typography>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          mt: 0.5
                        }}>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              opacity: 0.7,
                              fontSize: '0.7rem',
                              color: isOwnMessage ? 'rgba(255, 255, 255, 0.7)' : '#6b7280'
                            }}
                          >
                            {currentTranslation.sourceLang.toUpperCase()} → {currentTranslation.targetLang.toUpperCase()}
                          </Typography>
                          
                          {/* Save to flashcards button */}
                          {!isOwnMessage && (
                            <Tooltip title={isSaved ? "Remove from flashcards" : "Save to flashcards"}>
                              <IconButton
                                size="small"
                                onClick={handleSaveToFlashcards}
                                disabled={isSaving}
                                sx={{
                                  color: isSaved ? '#4caf50' : '#6b7280',
                                  padding: '2px',
                                  '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                    color: isSaved ? '#45a049' : '#374151'
                                  },
                                  '&:disabled': {
                                    color: '#6b7280',
                                    opacity: 0.5
                                  }
                                }}
                              >
                                {isSaved ? (
                                  <BookmarkedIcon sx={{ fontSize: '16px' }} />
                                ) : (
                                  <BookmarkIcon sx={{ fontSize: '16px' }} />
                                )}
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
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
                    color: isOwnMessage ? 'rgba(255, 255, 255, 0.8)' : '#6b7280',
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
                        color: isOwnMessage ? 'rgba(255, 255, 255, 0.7)' : '#6b7280',
                        padding: '2px',
                        '&:hover': {
                          backgroundColor: isOwnMessage ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                          color: isOwnMessage ? 'white' : '#374151'
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
                          color: isOwnMessage ? 'rgba(255, 255, 255, 0.7)' : '#6b7280',
                          padding: '2px',
                          '&:hover': {
                            backgroundColor: isOwnMessage ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                            color: isOwnMessage ? 'white' : '#374151'
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
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
};