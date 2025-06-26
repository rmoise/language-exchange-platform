"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  LinearProgress, 
  Stack,
  Paper,
  Chip,
  IconButton
} from '@mui/material';
import { 
  Close,
  Timer,
  Psychology,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { FlashcardDisplay } from './FlashcardDisplay';
import { Flashcard } from '../types';
import { FlashcardService } from '../flashcardService';
import { motion, AnimatePresence } from 'framer-motion';

interface FlashcardReviewProps {
  flashcards: Flashcard[];
  onComplete: (results: ReviewResults) => void;
  onClose?: () => void;
  darkMode?: boolean;
}

interface ReviewResults {
  totalReviewed: number;
  correctCount: number;
  incorrectCount: number;
  timeSpent: number; // seconds
  masteryGained: number;
}

export const FlashcardReview: React.FC<FlashcardReviewProps> = ({
  flashcards,
  onComplete,
  onClose,
  darkMode = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [startTime] = useState(Date.now());
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    masteryGained: 0
  });

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  const handleAnswer = async (quality: 'again' | 'hard' | 'good' | 'easy') => {
    const isCorrect = quality !== 'again';
    
    // Update the card in the backend
    await FlashcardService.reviewFlashcard(currentCard.id, quality);
    
    // Update session stats
    setSessionStats(prev => ({
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      incorrect: isCorrect ? prev.incorrect : prev.incorrect + 1,
      masteryGained: prev.masteryGained + (isCorrect ? 0.5 : -0.25)
    }));

    // Move to next card or complete
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      onComplete({
        totalReviewed: flashcards.length,
        correctCount: sessionStats.correct + (isCorrect ? 1 : 0),
        incorrectCount: sessionStats.incorrect + (isCorrect ? 0 : 1),
        timeSpent,
        masteryGained: sessionStats.masteryGained + (isCorrect ? 0.5 : -0.25)
      });
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showAnswer) {
        switch(e.key) {
          case '1': handleAnswer('again'); break;
          case '2': handleAnswer('hard'); break;
          case '3': handleAnswer('good'); break;
          case '4': handleAnswer('easy'); break;
        }
      } else if (e.key === ' ') {
        e.preventDefault();
        setShowAnswer(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showAnswer, currentIndex]);

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: darkMode ? '#0a0a0a' : '#f5f5f5',
        borderRadius: 2,
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip
              icon={<Psychology />}
              label={`Card ${currentIndex + 1} of ${flashcards.length}`}
              color="primary"
              variant="outlined"
            />
            <Chip
              icon={<Timer />}
              label={formatTime(Math.round((Date.now() - startTime) / 1000))}
              variant="outlined"
            />
          </Stack>
          
          {onClose && (
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          )}
        </Stack>

        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ 
            height: 8, 
            borderRadius: 4,
            backgroundColor: darkMode ? '#333' : '#e0e0e0',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#6366f1'
            }
          }}
        />

        <Stack direction="row" spacing={2} mt={1}>
          <Typography variant="caption" sx={{ color: '#4caf50', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CheckCircle fontSize="small" /> {sessionStats.correct} correct
          </Typography>
          <Typography variant="caption" sx={{ color: '#f44336', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Cancel fontSize="small" /> {sessionStats.incorrect} incorrect
          </Typography>
        </Stack>
      </Box>

      {/* Flashcard */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <FlashcardDisplay
              flashcard={currentCard}
              showTranslation={showAnswer}
              onFlip={() => setShowAnswer(!showAnswer)}
              darkMode={darkMode}
            />
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ mt: 3 }}>
        {!showAnswer ? (
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={() => setShowAnswer(true)}
            sx={{
              py: 2,
              backgroundColor: '#6366f1',
              '&:hover': { backgroundColor: '#5558d9' }
            }}
          >
            Show Answer (Space)
          </Button>
        ) : (
          <Stack spacing={2}>
            <Typography 
              variant="body2" 
              align="center" 
              sx={{ color: darkMode ? '#999' : '#666', mb: 1 }}
            >
              How difficult was this card?
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleAnswer('again')}
                sx={{
                  color: '#f44336',
                  borderColor: '#f44336',
                  '&:hover': { 
                    borderColor: '#f44336',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)'
                  }
                }}
              >
                Again (1)
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleAnswer('hard')}
                sx={{
                  color: '#ff9800',
                  borderColor: '#ff9800',
                  '&:hover': { 
                    borderColor: '#ff9800',
                    backgroundColor: 'rgba(255, 152, 0, 0.1)'
                  }
                }}
              >
                Hard (2)
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleAnswer('good')}
                sx={{
                  color: '#4caf50',
                  borderColor: '#4caf50',
                  '&:hover': { 
                    borderColor: '#4caf50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)'
                  }
                }}
              >
                Good (3)
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleAnswer('easy')}
                sx={{
                  color: '#2196f3',
                  borderColor: '#2196f3',
                  '&:hover': { 
                    borderColor: '#2196f3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)'
                  }
                }}
              >
                Easy (4)
              </Button>
            </Stack>
          </Stack>
        )}
      </Box>
    </Paper>
  );
};