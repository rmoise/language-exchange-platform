"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Collapse,
  Stack,
  Chip,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  Tooltip
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  School,
  LocalFireDepartment,
  TrendingUp,
  Timer,
  CheckCircle,
  MenuBook,
  PlayArrow,
  EmojiEvents,
  Star
} from '@mui/icons-material';
import { FlashcardReview } from './FlashcardReview';
import { FlashcardService } from '../flashcardService';
import { Flashcard, UserLearningProfile, FlashcardDeck } from '../types';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

interface LearningDashboardProps {
  darkMode?: boolean;
  defaultExpanded?: boolean;
  compact?: boolean;
}

export const LearningDashboard: React.FC<LearningDashboardProps> = ({
  darkMode = false,
  defaultExpanded = true,
  compact = false
}) => {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [profile, setProfile] = useState<UserLearningProfile | null>(null);
  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [cardsToReview, setCardsToReview] = useState<Flashcard[]>([]);
  const [todayStats, setTodayStats] = useState({ reviewed: 0, learned: 0, accuracy: 0 });

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user?.id) return;

    const [userProfile, flashcardDeck, dailyStats] = await Promise.all([
      FlashcardService.getUserProfile(user.id),
      FlashcardService.getDueCards(user.id),
      FlashcardService.getDailyStats(user.id)
    ]);

    setProfile(userProfile);
    setDeck(flashcardDeck);
    
    if (dailyStats) {
      setTodayStats({
        reviewed: dailyStats.cardsReviewed,
        learned: dailyStats.cardsLearned,
        accuracy: dailyStats.cardsReviewed > 0 
          ? Math.round((dailyStats.correctCount / dailyStats.cardsReviewed) * 100)
          : 0
      });
    }

    // Save expanded state preference
    const savedState = localStorage.getItem('learningDashboardExpanded');
    if (savedState !== null) {
      setExpanded(savedState === 'true');
    }
  };

  const handleToggleExpanded = () => {
    const newState = !expanded;
    setExpanded(newState);
    localStorage.setItem('learningDashboardExpanded', String(newState));
  };

  const startReview = (cards: Flashcard[]) => {
    setCardsToReview(cards);
    setReviewDialogOpen(true);
  };

  const handleReviewComplete = (results: any) => {
    setReviewDialogOpen(false);
    loadDashboardData(); // Refresh stats
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return '#ff6b6b';
    if (streak >= 7) return '#ff9800';
    if (streak >= 3) return '#ffd93d';
    return '#9e9e9e';
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#4caf50';
    if (progress >= 50) return '#ff9800';
    return '#f44336';
  };

  if (!user || !profile || !deck) return null;

  const dailyProgress = profile.dailyGoal > 0 
    ? Math.min(100, (todayStats.reviewed / profile.dailyGoal) * 100)
    : 0;

  if (compact) {
    // Compact mode - just show key stats in a small card
    return (
      <Box
        sx={{
          flex: { xs: '1', md: '0 0 35%' },
          backgroundColor: darkMode ? 'rgba(30, 30, 30, 0.8)' : '#f8f9fa',
          backdropFilter: 'blur(10px)',
          border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: '16px',
          p: 2.5,
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: darkMode 
              ? '0 4px 20px rgba(99, 102, 241, 0.1)' 
              : '0 4px 20px rgba(0, 0, 0, 0.05)',
          },
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600 }}>
              Today's Progress
            </Typography>
            <Chip
              icon={<LocalFireDepartment sx={{ color: getStreakColor(profile.currentStreak), fontSize: 16 }} />}
              label={`${profile.currentStreak}d`}
              size="small"
              sx={{ height: 24 }}
            />
          </Stack>
          
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                Daily Goal
              </Typography>
              <Typography variant="caption" fontWeight={600}>
                {todayStats.reviewed}/{profile.dailyGoal}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={dailyProgress}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getProgressColor(dailyProgress),
                  borderRadius: 3,
                }
              }}
            />
          </Stack>

          {deck.dueToday > 0 && (
            <Button
              fullWidth
              variant="contained"
              size="small"
              startIcon={<PlayArrow sx={{ fontSize: 18 }} />}
              onClick={() => startReview(deck.cards.filter(c => c.dueDate && new Date(c.dueDate) <= new Date()))}
              sx={{
                backgroundColor: '#6366f1',
                color: 'white',
                textTransform: 'none',
                py: 1,
                fontSize: '14px',
                fontWeight: 500,
                '&:hover': { backgroundColor: '#5558d9' }
              }}
            >
              Review {deck.dueToday} cards
            </Button>
          )}
        </Stack>
      </Box>
    );
  }

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
          border: `1px solid ${darkMode ? '#333' : '#e0e0e0'}`,
          borderRadius: 2,
          overflow: 'hidden',
          mb: 3,
          transition: 'all 0.3s ease'
        }}
      >
        {/* Header - Always Visible */}
        <Box
          sx={{
            p: 2,
            backgroundColor: darkMode ? '#0f0f0f' : '#f8f9fa',
            borderBottom: `1px solid ${darkMode ? '#333' : '#e0e0e0'}`,
            cursor: 'pointer'
          }}
          onClick={handleToggleExpanded}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={2}>
              <School sx={{ color: '#6366f1', fontSize: 28 }} />
              <Typography variant="h6" fontWeight={500}>
                My Learning Dashboard
              </Typography>
              
              {/* Quick Stats Pills */}
              <Stack direction="row" spacing={1}>
                <Chip
                  icon={<LocalFireDepartment sx={{ color: getStreakColor(profile.currentStreak) }} />}
                  label={`${profile.currentStreak} day streak`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  icon={<MenuBook />}
                  label={`${deck.dueToday} cards due`}
                  size="small"
                  color={deck.dueToday > 0 ? "primary" : "default"}
                  variant={deck.dueToday > 0 ? "filled" : "outlined"}
                />
                {todayStats.reviewed > 0 && (
                  <Chip
                    icon={<CheckCircle />}
                    label={`${todayStats.reviewed} reviewed today`}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                )}
              </Stack>
            </Stack>

            <IconButton size="small">
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Stack>

          {/* Collapsed Progress Bar */}
          {!expanded && dailyProgress > 0 && (
            <Box sx={{ mt: 1 }}>
              <LinearProgress
                variant="determinate"
                value={dailyProgress}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: darkMode ? '#333' : '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getProgressColor(dailyProgress)
                  }
                }}
              />
            </Box>
          )}
        </Box>

        {/* Expanded Content */}
        <Collapse in={expanded}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* Daily Progress Card */}
              <Grid item xs={12} md={4}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    height: '100%',
                    backgroundColor: darkMode ? '#0f0f0f' : '#f8f9fa',
                    border: `1px solid ${darkMode ? '#333' : '#e0e0e0'}`
                  }}
                >
                  <CardContent>
                    <Stack spacing={2}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Daily Progress
                      </Typography>
                      
                      <Box>
                        <Stack direction="row" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">
                            {todayStats.reviewed} / {profile.dailyGoal} cards
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {Math.round(dailyProgress)}%
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={dailyProgress}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: darkMode ? '#333' : '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: getProgressColor(dailyProgress)
                            }
                          }}
                        />
                      </Box>

                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption" color="text.secondary">
                            Accuracy
                          </Typography>
                          <Typography variant="caption" fontWeight={500}>
                            {todayStats.accuracy}%
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption" color="text.secondary">
                            New words
                          </Typography>
                          <Typography variant="caption" fontWeight={500}>
                            {todayStats.learned}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Quick Review Card */}
              <Grid item xs={12} md={4}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    height: '100%',
                    backgroundColor: darkMode ? '#0f0f0f' : '#f8f9fa',
                    border: `1px solid ${darkMode ? '#333' : '#e0e0e0'}`
                  }}
                >
                  <CardContent>
                    <Stack spacing={2}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Quick Review
                      </Typography>
                      
                      <Box>
                        <Stack spacing={1} mb={2}>
                          <Chip
                            size="small"
                            label={`${deck.newCards.length} new`}
                            color="primary"
                            variant="outlined"
                          />
                          <Chip
                            size="small"
                            label={`${deck.learningCards.length} learning`}
                            color="warning"
                            variant="outlined"
                          />
                          <Chip
                            size="small"
                            label={`${deck.reviewCards.length} to review`}
                            color="success"
                            variant="outlined"
                          />
                        </Stack>

                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<PlayArrow />}
                          onClick={() => {
                            const cards = [
                              ...deck.newCards.slice(0, 5),
                              ...deck.learningCards.slice(0, 5),
                              ...deck.reviewCards.slice(0, 5)
                            ];
                            startReview(cards);
                          }}
                          disabled={deck.dueToday === 0}
                          sx={{
                            backgroundColor: '#6366f1',
                            '&:hover': { backgroundColor: '#5558d9' }
                          }}
                        >
                          Start Review
                        </Button>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Stats Card */}
              <Grid item xs={12} md={4}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    height: '100%',
                    backgroundColor: darkMode ? '#0f0f0f' : '#f8f9fa',
                    border: `1px solid ${darkMode ? '#333' : '#e0e0e0'}`
                  }}
                >
                  <CardContent>
                    <Stack spacing={2}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Achievements
                      </Typography>
                      
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmojiEvents sx={{ color: '#ffd700', fontSize: 20 }} />
                          <Typography variant="body2">
                            {profile.totalCardsLearned} words mastered
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Star sx={{ color: '#ff9800', fontSize: 20 }} />
                          <Typography variant="body2">
                            {profile.longestStreak} day best streak
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TrendingUp sx={{ color: '#4caf50', fontSize: 20 }} />
                          <Typography variant="body2">
                            {profile.averageAccuracy}% avg accuracy
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Word of the Day (if available) */}
            {deck.newCards.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Paper
                    sx={{
                      p: 2,
                      backgroundColor: darkMode ? '#0f0f0f' : '#e3f2fd',
                      border: `1px solid ${darkMode ? '#1976d2' : '#90caf9'}`
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Star sx={{ color: '#1976d2' }} />
                      <Box flex={1}>
                        <Typography variant="subtitle2" color="primary">
                          Word of the Day
                        </Typography>
                        <Typography variant="h6">
                          {deck.newCards[0].word} = {deck.newCards[0].translation}
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => startReview([deck.newCards[0]])}
                      >
                        Learn Now
                      </Button>
                    </Stack>
                  </Paper>
                </motion.div>
              </Box>
            )}
          </Box>
        </Collapse>
      </Paper>

      {/* Review Dialog */}
      <Dialog
        open={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: darkMode ? '#0a0a0a' : '#f5f5f5',
            minHeight: '600px'
          }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          {cardsToReview.length > 0 && (
            <FlashcardReview
              flashcards={cardsToReview}
              onComplete={handleReviewComplete}
              onClose={() => setReviewDialogOpen(false)}
              darkMode={darkMode}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};