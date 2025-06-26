"use client";

import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, IconButton, Chip } from '@mui/material';
import { Flip, VolumeUp, Bookmark, BookmarkBorder } from '@mui/icons-material';
import { Flashcard } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface FlashcardDisplayProps {
  flashcard: Flashcard;
  showTranslation?: boolean;
  onFlip?: () => void;
  onBookmark?: (id: string) => void;
  isBookmarked?: boolean;
  darkMode?: boolean;
}

export const FlashcardDisplay: React.FC<FlashcardDisplayProps> = ({
  flashcard,
  showTranslation = false,
  onFlip,
  onBookmark,
  isBookmarked = false,
  darkMode = false
}) => {
  const [isFlipped, setIsFlipped] = useState(showTranslation);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleFlip = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setIsFlipped(!isFlipped);
      onFlip?.();
      setTimeout(() => setIsAnimating(false), 600);
    }
  };

  const speakWord = (text: string, language: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'hard': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getMasteryColor = (level: number) => {
    if (level >= 4) return '#4caf50';
    if (level >= 2) return '#ff9800';
    return '#f44336';
  };

  return (
    <Box
      sx={{
        perspective: '1000px',
        width: '100%',
        height: '300px',
        cursor: 'pointer',
      }}
      onClick={handleFlip}
    >
      <motion.div
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 60 }}
        style={{
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          position: 'relative',
        }}
      >
        {/* Front of card - Target word */}
        <Card
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
            border: `1px solid ${darkMode ? '#333' : '#e0e0e0'}`,
            boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
            <Chip 
              label={flashcard.difficulty} 
              size="small"
              sx={{ 
                backgroundColor: getDifficultyColor(flashcard.difficulty),
                color: 'white',
                fontSize: '0.75rem'
              }}
            />
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onBookmark?.(flashcard.id);
              }}
              sx={{ color: darkMode ? '#fff' : '#666' }}
            >
              {isBookmarked ? <Bookmark /> : <BookmarkBorder />}
            </IconButton>
          </Box>

          <CardContent 
            sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              p: 4
            }}
          >
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 500,
                mb: 3,
                color: darkMode ? '#fff' : '#000',
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
              }}
            >
              {flashcard.word}
            </Typography>
            
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                speakWord(flashcard.word, flashcard.targetLanguage);
              }}
              sx={{ 
                backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                '&:hover': {
                  backgroundColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'
                }
              }}
            >
              <VolumeUp />
            </IconButton>

            {flashcard.context && (
              <Typography 
                variant="body2" 
                sx={{ 
                  mt: 3,
                  fontStyle: 'italic',
                  color: darkMode ? '#999' : '#666',
                  maxWidth: '80%'
                }}
              >
                "{flashcard.context}"
              </Typography>
            )}
          </CardContent>

          <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'center' }}>
            <Chip
              icon={<Flip />}
              label="Click to flip"
              size="small"
              variant="outlined"
              sx={{ 
                color: darkMode ? '#999' : '#666',
                borderColor: darkMode ? '#444' : '#ddd'
              }}
            />
          </Box>
        </Card>

        {/* Back of card - Translation */}
        <Card
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
            border: `1px solid ${darkMode ? '#333' : '#e0e0e0'}`,
            boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
            <Chip 
              label={`Mastery: ${flashcard.masteryLevel}/5`} 
              size="small"
              sx={{ 
                backgroundColor: getMasteryColor(flashcard.masteryLevel),
                color: 'white',
                fontSize: '0.75rem'
              }}
            />
          </Box>

          <CardContent 
            sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              p: 4
            }}
          >
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 500,
                mb: 3,
                color: darkMode ? '#fff' : '#000',
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
              }}
            >
              {flashcard.translation}
            </Typography>
            
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                speakWord(flashcard.translation, flashcard.nativeLanguage);
              }}
              sx={{ 
                backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                '&:hover': {
                  backgroundColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'
                }
              }}
            >
              <VolumeUp />
            </IconButton>

            {flashcard.notes && (
              <Typography 
                variant="body1" 
                sx={{ 
                  mt: 3,
                  color: darkMode ? '#bbb' : '#555',
                  maxWidth: '80%'
                }}
              >
                {flashcard.notes}
              </Typography>
            )}

            <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
              {flashcard.tags?.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    color: darkMode ? '#999' : '#666',
                    borderColor: darkMode ? '#444' : '#ddd'
                  }}
                />
              ))}
            </Box>
          </CardContent>

          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: darkMode ? '#999' : '#666' }}>
              Reviewed: {flashcard.reviewCount} times
            </Typography>
            <Typography variant="caption" sx={{ color: darkMode ? '#999' : '#666' }}>
              Accuracy: {flashcard.reviewCount > 0 ? Math.round((flashcard.correctCount / flashcard.reviewCount) * 100) : 0}%
            </Typography>
          </Box>
        </Card>
      </motion.div>
    </Box>
  );
};