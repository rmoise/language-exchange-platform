"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Popper,
  ClickAwayListener,
  Stack,
  CircularProgress,
  TextField,
  Chip,
  PopperPlacementType
} from '@mui/material';
import {
  Translate,
  Add,
  Close,
  VolumeUp,
  School,
  Check
} from '@mui/icons-material';
import { FlashcardService } from '../flashcardService';
import { useAuth } from '@/hooks/useAuth';
import { translationService } from '@/services/translationService';
import { motion, AnimatePresence } from 'framer-motion';

interface TextSelectionHandlerProps {
  containerRef?: React.RefObject<HTMLElement>;
  darkMode?: boolean;
  targetLanguage?: string;
  nativeLanguage?: string;
}

export const TextSelectionHandler: React.FC<TextSelectionHandlerProps> = ({
  containerRef,
  darkMode = false,
  targetLanguage = 'en',
  nativeLanguage = 'es'
}) => {
  const { user } = useAuth();
  const [selectedText, setSelectedText] = useState('');
  const [virtualElement, setVirtualElement] = useState<null | { getBoundingClientRect: () => DOMRect }>(null);
  const [translation, setTranslation] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTranslation, setEditedTranslation] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [contextSentence, setContextSentence] = useState('');
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        return;
      }

      const text = selection.toString().trim();
      
      if (text.length < 2 || text.length > 500) {
        return;
      }

      // Get the selected range
      const range = selection.getRangeAt(0);
      
      // Check if selection is within a post content area
      const container = range.commonAncestorContainer;
      const element = container.nodeType === Node.TEXT_NODE 
        ? container.parentElement 
        : container as HTMLElement;
      
      // Only proceed if selection is within a post (check for post-content class or data attribute)
      const isInPost = element?.closest('[data-post-content="true"]') || 
                       element?.closest('.post-content');
      
      if (!isInPost) {
        return;
      }

      const rect = range.getBoundingClientRect();

      // Get context sentence
      const parentElement = element;
      
      const fullText = parentElement?.textContent || '';
      const context = extractContextSentence(fullText, text);

      setSelectedText(text);
      setContextSentence(context);
      
      // Create a virtual element for Popper positioning
      const virtualEl = {
        getBoundingClientRect: () => ({
          width: rect.width,
          height: rect.height,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          left: rect.left,
          x: rect.x,
          y: rect.y,
          toJSON: () => {}
        })
      };
      
      setVirtualElement(virtualEl);
      setTranslation('');
      setIsEditing(false);
      setIsSaved(false);
      
      // Auto-translate the selected text
      autoTranslate(text);
    };
    
    const autoTranslate = async (text: string) => {
      if (!text) return;
      
      setIsTranslating(true);
      try {
        const result = await translationService.translateText(
          text,
          targetLanguage,
          nativeLanguage
        );
        setTranslation(result.translatedText);
        setEditedTranslation(result.translatedText);
      } catch (error) {
        console.error('Auto-translation failed:', error);
        // Don't show error message, let user manually translate if needed
      } finally {
        setIsTranslating(false);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      // Don't trigger if clicking inside the tooltip
      if (tooltipRef.current?.contains(e.target as Node)) {
        return;
      }
      setTimeout(handleSelectionChange, 10);
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleSelectionChange);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleSelectionChange);
    };
  }, [targetLanguage, nativeLanguage]);

  const extractContextSentence = (fullText: string, selectedWord: string): string => {
    // Simple sentence extraction - find sentence containing the word
    const sentences = fullText.match(/[^.!?]+[.!?]+/g) || [fullText];
    const sentence = sentences.find(s => s.includes(selectedWord)) || fullText;
    return sentence.trim();
  };

  const handleTranslate = async () => {
    if (!selectedText || isTranslating) return;

    setIsTranslating(true);
    try {
      const result = await translationService.translateText(
        selectedText,
        targetLanguage,
        nativeLanguage
      );
      setTranslation(result.translatedText);
      setEditedTranslation(result.translatedText);
    } catch (error) {
      console.error('Translation failed:', error);
      setTranslation('Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSaveWord = async () => {
    if (!user?.id || !selectedText || (!translation && !editedTranslation)) return;

    const finalTranslation = isEditing ? editedTranslation : translation;
    
    try {
      await FlashcardService.quickSaveWord(
        user.id,
        selectedText,
        finalTranslation,
        targetLanguage,
        nativeLanguage,
        contextSentence,
        window.location.href
      );
      setIsSaved(true);
      
      // Auto-close after save
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      console.error('Failed to save word:', error);
    }
  };

  const handleClose = () => {
    setVirtualElement(null);
    setSelectedText('');
    setTranslation('');
    setIsEditing(false);
    setIsSaved(false);
    window.getSelection()?.removeAllRanges();
  };

  const speakWord = (text: string, language: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const open = Boolean(virtualElement) && Boolean(selectedText);

  return (
    <Popper
      open={open}
      anchorEl={virtualElement}
      placement="bottom"
      modifiers={[
        {
          name: 'offset',
          options: {
            offset: [0, 8],
          },
        },
        {
          name: 'preventOverflow',
          options: {
            boundary: 'viewport',
            padding: 8,
          },
        },
        {
          name: 'flip',
          options: {
            fallbackPlacements: ['top', 'bottom-start', 'bottom-end', 'top-start', 'top-end'],
          },
        },
      ]}
      style={{ zIndex: 999999 }}
      disablePortal={false}
    >
      {({ TransitionProps, placement }) => (
        <AnimatePresence>
          {open && (
            <ClickAwayListener onClickAway={handleClose}>
              <motion.div
                ref={tooltipRef}
                initial={{ opacity: 0, y: placement === 'top' ? 10 : -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: placement === 'top' ? 10 : -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Paper
                elevation={8}
                sx={{
                  p: 2,
                  minWidth: 280,
                  maxWidth: 400,
                  backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
                  border: `1px solid ${darkMode ? '#333' : '#e0e0e0'}`,
                  borderRadius: 2,
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -8,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderBottom: `8px solid ${darkMode ? '#333' : '#e0e0e0'}`,
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: -7,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '7px solid transparent',
                    borderRight: '7px solid transparent',
                    borderBottom: `7px solid ${darkMode ? '#1a1a1a' : '#ffffff'}`,
                  }
                }}
              >
                {/* Header */}
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <School sx={{ color: '#6366f1', fontSize: 20 }} />
                    <Typography variant="subtitle2" fontWeight={600}>
                      Add to Flashcards
                    </Typography>
                  </Stack>
                  <IconButton size="small" onClick={handleClose}>
                    <Close fontSize="small" />
                  </IconButton>
                </Stack>

                {/* Selected Word */}
                <Box sx={{ mb: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                    <Typography variant="h6" fontWeight={500}>
                      {selectedText}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => speakWord(selectedText, targetLanguage)}
                    >
                      <VolumeUp fontSize="small" />
                    </IconButton>
                  </Stack>
                  <Chip
                    label={targetLanguage.toUpperCase()}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                {/* Translation Section */}
                <Box sx={{ mb: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Translation ({nativeLanguage.toUpperCase()})
                    </Typography>
                  </Stack>
                  
                  {isTranslating && (
                    <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Translating...
                      </Typography>
                    </Box>
                  )}

                  {!isTranslating && translation && (
                    <>
                      {!isEditing ? (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body1" sx={{ flex: 1 }}>
                          {translation}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => speakWord(translation, nativeLanguage)}
                        >
                          <VolumeUp fontSize="small" />
                        </IconButton>
                        <Button
                          size="small"
                          onClick={() => setIsEditing(true)}
                        >
                          Edit
                        </Button>
                      </Stack>
                    ) : (
                      <Stack spacing={1}>
                        <TextField
                          size="small"
                          fullWidth
                          value={editedTranslation}
                          onChange={(e) => setEditedTranslation(e.target.value)}
                          placeholder="Edit translation..."
                          autoFocus
                        />
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button
                            size="small"
                            onClick={() => {
                              setIsEditing(false);
                              setEditedTranslation(translation);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => setIsEditing(false)}
                            sx={{
                              backgroundColor: '#6366f1',
                              '&:hover': { backgroundColor: '#5558d9' }
                            }}
                          >
                            Done
                          </Button>
                        </Stack>
                      </Stack>
                    )}
                    </>
                  )}
                  
                  {!isTranslating && !translation && (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                      Translation unavailable
                    </Typography>
                  )}
                </Box>

                {/* Context */}
                {contextSentence && (
                  <Box sx={{ mb: 2, p: 1.5, backgroundColor: darkMode ? '#0f0f0f' : '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                      Context:
                    </Typography>
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                      "{contextSentence}"
                    </Typography>
                  </Box>
                )}

                {/* Action Buttons */}
                <Stack direction="row" spacing={1}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={isSaved ? <Check /> : <Add />}
                    onClick={handleSaveWord}
                    disabled={(!translation && !isTranslating) || isSaved}
                    sx={{
                      backgroundColor: isSaved ? '#4caf50' : '#6366f1',
                      '&:hover': { 
                        backgroundColor: isSaved ? '#45a049' : '#5558d9' 
                      },
                      '&:disabled': {
                        backgroundColor: isSaved ? '#4caf50' : undefined,
                        color: isSaved ? 'white' : undefined
                      }
                    }}
                  >
                    {isSaved ? 'Saved!' : 'Save to Flashcards'}
                  </Button>
                </Stack>
              </Paper>
            </motion.div>
          </ClickAwayListener>
          )}
        </AnimatePresence>
      )}
    </Popper>
  );
};