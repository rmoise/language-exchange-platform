"use client";

import React, { useState } from 'react';
import {
  Stack,
  IconButton,
  Tooltip,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  ContentCopy,
  VolumeUp,
  BookmarkAdd,
  BookmarkAdded,
} from '@mui/icons-material';
import { FlashcardService } from '@/features/flashcards/flashcardService';
import { useAuth } from '@/hooks/useAuth';

interface WordInteractionProps {
  word: string;
  translation: string;
  context: string;
  targetLanguage: string;
  nativeLanguage: string;
  darkMode?: boolean;
}

export const WordInteraction: React.FC<WordInteractionProps> = ({
  word,
  translation,
  context,
  targetLanguage,
  nativeLanguage,
  darkMode = false,
}) => {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const handleCopy = () => {
    const textToCopy = `${word} → ${translation}`;
    navigator.clipboard.writeText(textToCopy);
    showMessage('Copied to clipboard', 'success');
  };

  const handleSpeak = (text: string, language: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const handleSaveToFlashcards = async () => {
    if (!user?.id) {
      showMessage('Please login to save flashcards', 'error');
      return;
    }

    if (isSaved) {
      showMessage('Already saved to flashcards', 'success');
      return;
    }

    try {
      await FlashcardService.quickSaveWord(
        user.id,
        word,
        translation,
        targetLanguage,
        nativeLanguage,
        context,
        'image-translation'
      );
      setIsSaved(true);
      showMessage('Saved to flashcards!', 'success');
    } catch (error) {
      console.error('Failed to save flashcard:', error);
      showMessage('Failed to save flashcard', 'error');
    }
  };

  const showMessage = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setShowSnackbar(true);
  };

  return (
    <>
      <Stack direction="row" spacing={0.5} alignItems="center">
        <Tooltip title="Copy">
          <IconButton size="small" onClick={handleCopy}>
            <ContentCopy fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title={`Pronounce "${word}"`}>
          <IconButton
            size="small"
            onClick={() => handleSpeak(word, targetLanguage)}
          >
            <VolumeUp fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title={`Pronounce "${translation}"`}>
          <IconButton
            size="small"
            onClick={() => handleSpeak(translation, nativeLanguage)}
          >
            <VolumeUp fontSize="small" sx={{ color: '#6366f1' }} />
          </IconButton>
        </Tooltip>

        <Tooltip title={isSaved ? 'Saved to flashcards' : 'Save to flashcards'}>
          <IconButton
            size="small"
            onClick={handleSaveToFlashcards}
            sx={{
              color: isSaved ? '#4caf50' : undefined,
            }}
          >
            {isSaved ? (
              <BookmarkAdded fontSize="small" />
            ) : (
              <BookmarkAdd fontSize="small" />
            )}
          </IconButton>
        </Tooltip>

        {isSaved && (
          <Typography
            variant="caption"
            sx={{
              color: '#4caf50',
              ml: 1,
            }}
          >
            Saved
          </Typography>
        )}
      </Stack>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSnackbar(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};