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
  Error as ErrorIcon,
  AutoFixHigh as ImproveIcon
} from '@mui/icons-material';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useGesture } from 'react-use-gesture';
import { useTranslation, useTranslationPreferences } from '@/hooks/useTranslation';
import { aiImprovementService } from '@/services/aiImprovementService';
import { UpgradeToProModal } from '@/components/ui/UpgradeToProModal';

interface SessionMessage {
  id: string;
  session_id: string;
  user_id: string;
  content: string;
  message_type: 'text' | 'system';
  created_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

interface SwipeTranslateSessionMessageProps {
  message: SessionMessage;
  isCurrentUser: boolean;
  showAvatar: boolean;
  formatTime: (timestamp: string) => string;
  // Translation specific props
  enableTranslation?: boolean;
  sourceLang?: string;
  targetLang?: string;
}

export const SwipeTranslateSessionMessage: React.FC<SwipeTranslateSessionMessageProps> = ({
  message,
  isCurrentUser,
  showAvatar,
  formatTime,
  enableTranslation = true,
  sourceLang,
  targetLang
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  
  // Translation state
  const [showTranslation, setShowTranslation] = useState(false);
  const [hasTriggeredTranslation, setHasTriggeredTranslation] = useState(false);
  const [swipeThreshold] = useState(80); // pixels
  
  // Improvement state
  const [isImproving, setIsImproving] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeModalData, setUpgradeModalData] = useState<{
    preview?: string;
    originalText?: string;
    usageInfo?: { used: number; limit: number };
  }>({});
  
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

  // Handle translation trigger
  const handleTranslationTrigger = useCallback(async () => {
    if (!enableTranslation || hasTriggeredTranslation || currentTranslation || message.message_type === 'system') {
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
    message.message_type,
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

  // Handle improve message
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

  // Gesture handlers for swipe detection
  const bind = useGesture({
    onDrag: ({ active, movement: [mx], direction: [xDir], velocity: [vx], cancel }: any) => {
      // Only trigger on right-to-left swipe (negative mx) for non-current user messages
      if (!enableTranslation || isCurrentUser || mx > 0 || message.message_type === 'system') {
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

  // Don't render translation features for system messages
  if (message.message_type === 'system') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
        <Chip
          label={message.content}
          size="small"
          sx={{
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            color: '#a5b4fc',
            fontSize: '0.75rem'
          }}
        />
      </Box>
    );
  }

  const shouldShowTranslationIndicator = enableTranslation && !isCurrentUser && !hasTriggeredTranslation;
  const hasTranslation = currentTranslation && !currentTranslation.isLoading && !currentTranslation.error;
  const translationError = currentTranslation?.error;

  return (
    <>
    <Box
      ref={containerRef}
      sx={{
        display: 'flex',
        flexDirection: isCurrentUser ? 'row-reverse' : 'row',
        mb: showAvatar ? 2 : 0.5,
        alignItems: 'flex-end',
        position: 'relative'
      }}
    >
      {/* Avatar */}
      {!isCurrentUser && (
        <Avatar
          sx={{
            width: showAvatar ? 32 : 32,
            height: showAvatar ? 32 : 32,
            mr: 1,
            backgroundColor: '#6366f1',
            fontSize: '0.875rem',
            visibility: showAvatar ? 'visible' : 'hidden',
            zIndex: 2
          }}
        >
          {message.user?.name?.charAt(0) || 'U'}
        </Avatar>
      )}

      {/* Message Container */}
      <Box
        sx={{
          maxWidth: '70%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isCurrentUser ? 'flex-end' : 'flex-start',
          position: 'relative'
        }}
      >
        {/* Swipe Hint */}
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
                label="Swipe →"
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

        {/* Sender Name and Time */}
        {showAvatar && !isCurrentUser && (
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255, 255, 255, 0.6)',
              mb: 0.5,
              ml: 0.5
            }}
          >
            {message.user?.name} • {formatTime(message.created_at)}
          </Typography>
        )}

        {/* Message Bubble with Swipe Gesture */}
        <motion.div
          {...(enableTranslation && !isCurrentUser ? bind() : {})}
          animate={controls}
          style={{
            touchAction: 'pan-y', // Allow vertical scrolling while capturing horizontal swipes
            position: 'relative'
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              backgroundColor: isCurrentUser 
                ? '#6366f1' 
                : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              borderRadius: 2,
              borderTopLeftRadius: !isCurrentUser && !showAvatar ? 1 : 2,
              borderTopRightRadius: isCurrentUser && !showAvatar ? 1 : 2,
              wordBreak: 'break-word',
              position: 'relative',
              cursor: enableTranslation && !isCurrentUser ? 'grab' : 'default',
              '&:active': {
                cursor: enableTranslation && !isCurrentUser ? 'grabbing' : 'default'
              }
            }}
          >
            {/* Original Message Content */}
            <Typography 
              variant="body2" 
              sx={{ 
                lineHeight: 1.4,
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
                          variant="body2" 
                          sx={{ 
                            lineHeight: 1.4,
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

            {/* Translation and Improvement Controls */}
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                mt: 0.5,
                gap: 0.5
              }}
            >
              {/* Improve button for current user */}
              {isCurrentUser && (
                <Tooltip title="Improve with AI">
                  <IconButton
                    size="small"
                    onClick={handleImprove}
                    disabled={isImproving}
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      padding: '2px',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    {isImproving ? (
                      <CircularProgress size={14} sx={{ color: 'inherit' }} />
                    ) : (
                      <ImproveIcon sx={{ fontSize: '14px' }} />
                    )}
                  </IconButton>
                </Tooltip>
              )}
              
              {/* Translation controls for non-current user */}
              {enableTranslation && !isCurrentUser && (
                <>
                {/* Manual Translation Button */}
                <Tooltip title={hasTranslation ? (showTranslation ? "Hide translation" : "Show translation") : "Translate"}>
                  <IconButton
                    size="small"
                    onClick={handleManualTranslation}
                    disabled={currentTranslation?.isLoading}
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
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
                        color: 'rgba(255, 255, 255, 0.7)',
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
                </>
              )}
            </Box>
          </Paper>
        </motion.div>

        {/* Time for current user messages */}
        {isCurrentUser && showAvatar && (
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255, 255, 255, 0.6)',
              mt: 0.5,
              mr: 0.5
            }}
          >
            {formatTime(message.created_at)}
          </Typography>
        )}
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