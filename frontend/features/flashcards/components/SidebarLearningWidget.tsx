"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
  LinearProgress,
  IconButton,
  Dialog,
  DialogContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Skeleton
} from '@mui/material';
import {
  LocalFireDepartment,
  School,
  PlayArrow,
  TrendingUp,
  EmojiEvents,
  NavigateNext,
  Timer,
  CheckCircle
} from '@mui/icons-material';
import { FlashcardService } from '../flashcardService';
import { FlashcardReview } from './FlashcardReview';
import { useAuth } from '@/hooks/useAuth';
import { UserLearningProfile, FlashcardDeck, Flashcard } from '../types';
import { motion } from 'framer-motion';

interface SidebarLearningWidgetProps {
  darkMode?: boolean;
}

export const SidebarLearningWidget: React.FC<SidebarLearningWidgetProps> = ({
  darkMode = false
}) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserLearningProfile | null>(null);
  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [recentWords, setRecentWords] = useState<Flashcard[]>([]);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [cardsToReview, setCardsToReview] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [todayProgress, setTodayProgress] = useState(0);

  useEffect(() => {
    if (user?.id) {
      loadWidgetData();
      // Refresh every 5 minutes
      const interval = setInterval(loadWidgetData, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadWidgetData = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const [userProfile, flashcardDeck, allCards, dailyStats] = await Promise.all([
        FlashcardService.getUserProfile(user.id),
        FlashcardService.getDueCards(user.id),
        FlashcardService.getFlashcards(user.id),
        FlashcardService.getDailyStats(user.id)
      ]);

      setProfile(userProfile);
      setDeck(flashcardDeck);
      
      // Get 5 most recent cards
      const recent = allCards
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      setRecentWords(recent);

      // Calculate daily progress
      if (dailyStats && userProfile.dailyGoal > 0) {
        const progress = Math.min(100, (dailyStats.cardsReviewed / userProfile.dailyGoal) * 100);
        setTodayProgress(progress);
      }
    } catch (error) {
      console.error('Failed to load learning data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startQuickReview = () => {
    if (!deck) return;
    
    const cards = [
      ...deck.newCards.slice(0, 3),
      ...deck.learningCards.slice(0, 3),
      ...deck.reviewCards.slice(0, 4)
    ];
    
    setCardsToReview(cards);
    setReviewDialogOpen(true);
  };

  const handleReviewComplete = () => {
    setReviewDialogOpen(false);
    loadWidgetData(); // Refresh stats
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return '#ff6b6b';
    if (streak >= 7) return '#ff9800';
    if (streak >= 3) return '#ffd93d';
    return '#9e9e9e';
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'just now';
  };

  if (!user) return null;

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
          border: `1px solid ${darkMode ? '#333' : '#e0e0e0'}`,
          borderRadius: 2,
          mb: 3
        }}
      >
        <Stack spacing={2}>
          {/* Header */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1}>
              <School sx={{ color: '#6366f1', fontSize: 20 }} />
              <Typography variant="subtitle2" fontWeight={600}>
                Your Learning
              </Typography>
            </Stack>
            {profile && (
              <Chip
                icon={<LocalFireDepartment sx={{ color: getStreakColor(profile.currentStreak) }} />}
                label={`${profile.currentStreak}`}
                size="small"
                variant="outlined"
              />
            )}
          </Stack>

          {isLoading ? (
            <Stack spacing={2}>
              <Skeleton variant="rectangular" height={60} />
              <Skeleton variant="rectangular" height={40} />
              <Skeleton variant="rectangular" height={80} />
            </Stack>
          ) : (
            <>
              {/* Quick Stats */}
              {deck && (
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: darkMode ? '#0f0f0f' : '#f8f9fa',
                    borderRadius: 1,
                    border: `1px solid ${darkMode ? '#333' : '#e0e0e0'}`
                  }}
                >
                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        Due Today
                      </Typography>
                      <Typography variant="h6" fontWeight={600} color="primary">
                        {deck.dueToday}
                      </Typography>
                    </Stack>
                    
                    {/* Progress Bar */}
                    {profile && profile.dailyGoal > 0 && (
                      <>
                        <LinearProgress
                          variant="determinate"
                          value={todayProgress}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: darkMode ? '#333' : '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: todayProgress >= 100 ? '#4caf50' : '#6366f1'
                            }
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" align="center">
                          {Math.round(todayProgress)}% of daily goal
                        </Typography>
                      </>
                    )}

                    {/* Quick Review Button */}
                    {deck.dueToday > 0 && (
                      <Button
                        fullWidth
                        variant="contained"
                        size="small"
                        startIcon={<PlayArrow />}
                        onClick={startQuickReview}
                        sx={{
                          mt: 1,
                          backgroundColor: '#6366f1',
                          '&:hover': { backgroundColor: '#5558d9' }
                        }}
                      >
                        Quick Review (10 cards)
                      </Button>
                    )}
                  </Stack>
                </Box>
              )}

              <Divider />

              {/* Recent Words */}
              {recentWords.length > 0 && (
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Recent Words
                  </Typography>
                  <List dense sx={{ mx: -2 }}>
                    {recentWords.map((word) => (
                      <ListItem
                        key={word.id}
                        sx={{
                          py: 0.5,
                          '&:hover': {
                            backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                          }
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontWeight={500}>
                              {word.word}
                            </Typography>
                          }
                          secondary={
                            <>
                              {word.translation} • {formatTimeAgo(word.createdAt)}
                            </>
                          }
                          secondaryTypographyProps={{
                            variant: "caption",
                            color: "text.secondary"
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              <Divider />

              {/* Mini Achievements */}
              {profile && (
                <Stack spacing={1}>
                  <Typography variant="caption" color="text.secondary">
                    Achievements
                  </Typography>
                  <Stack spacing={0.5}>
                    {profile.currentStreak >= 3 && (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <LocalFireDepartment sx={{ fontSize: 16, color: getStreakColor(profile.currentStreak) }} />
                        <Typography variant="caption">
                          {profile.currentStreak} day streak!
                        </Typography>
                      </Stack>
                    )}
                    {profile.totalCardsLearned >= 50 && (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <EmojiEvents sx={{ fontSize: 16, color: '#ffd700' }} />
                        <Typography variant="caption">
                          {profile.totalCardsLearned} words learned
                        </Typography>
                      </Stack>
                    )}
                    {profile.averageAccuracy >= 80 && (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <TrendingUp sx={{ fontSize: 16, color: '#4caf50' }} />
                        <Typography variant="caption">
                          {Math.round(profile.averageAccuracy)}% accuracy
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </Stack>
              )}

              {/* View All Button */}
              <Button
                fullWidth
                variant="text"
                size="small"
                endIcon={<NavigateNext />}
                sx={{ color: darkMode ? '#999' : '#666' }}
              >
                View All Flashcards
              </Button>
            </>
          )}
        </Stack>
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