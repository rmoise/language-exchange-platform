"use client";

import React from 'react';
import {
  Box,
  Tooltip,
  Stack,
  Typography,
  Avatar,
  Chip,
  IconButton
} from '@mui/material';
import {
  LocalFireDepartment,
  EmojiEvents,
  School,
  Star,
  Bolt,
  WorkspacePremium,
  AutoAwesome,
  TrendingUp,
  Psychology,
  Language
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  requirement: {
    type: 'streak' | 'words' | 'accuracy' | 'reviews' | 'helper';
    value: number;
  };
  earned: boolean;
  progress: number; // 0-100
  earnedDate?: Date;
}

interface GamificationBadgesProps {
  userStats: {
    currentStreak: number;
    longestStreak: number;
    totalWordsLearned: number;
    totalReviews: number;
    averageAccuracy: number;
    helpfulReplies?: number;
  };
  displayMode?: 'compact' | 'full';
  darkMode?: boolean;
}

export const GamificationBadges: React.FC<GamificationBadgesProps> = ({
  userStats,
  displayMode = 'compact',
  darkMode = false
}) => {
  // Define all possible badges
  const badges: Badge[] = [
    // Streak Badges
    {
      id: 'streak_3',
      name: 'Starter Streak',
      description: 'Study 3 days in a row',
      icon: <LocalFireDepartment />,
      color: '#ffd93d',
      requirement: { type: 'streak', value: 3 },
      earned: userStats.currentStreak >= 3 || userStats.longestStreak >= 3,
      progress: Math.min(100, (userStats.currentStreak / 3) * 100)
    },
    {
      id: 'streak_7',
      name: 'Week Warrior',
      description: 'Study 7 days in a row',
      icon: <LocalFireDepartment />,
      color: '#ff9800',
      requirement: { type: 'streak', value: 7 },
      earned: userStats.currentStreak >= 7 || userStats.longestStreak >= 7,
      progress: Math.min(100, (userStats.currentStreak / 7) * 100)
    },
    {
      id: 'streak_30',
      name: 'Fire Master',
      description: 'Study 30 days in a row',
      icon: <LocalFireDepartment />,
      color: '#ff6b6b',
      requirement: { type: 'streak', value: 30 },
      earned: userStats.currentStreak >= 30 || userStats.longestStreak >= 30,
      progress: Math.min(100, (userStats.currentStreak / 30) * 100)
    },
    
    // Word Learning Badges
    {
      id: 'words_10',
      name: 'First Steps',
      description: 'Learn 10 words',
      icon: <School />,
      color: '#4caf50',
      requirement: { type: 'words', value: 10 },
      earned: userStats.totalWordsLearned >= 10,
      progress: Math.min(100, (userStats.totalWordsLearned / 10) * 100)
    },
    {
      id: 'words_50',
      name: 'Vocabulary Builder',
      description: 'Learn 50 words',
      icon: <Psychology />,
      color: '#2196f3',
      requirement: { type: 'words', value: 50 },
      earned: userStats.totalWordsLearned >= 50,
      progress: Math.min(100, (userStats.totalWordsLearned / 50) * 100)
    },
    {
      id: 'words_100',
      name: 'Word Master',
      description: 'Learn 100 words',
      icon: <AutoAwesome />,
      color: '#9c27b0',
      requirement: { type: 'words', value: 100 },
      earned: userStats.totalWordsLearned >= 100,
      progress: Math.min(100, (userStats.totalWordsLearned / 100) * 100)
    },
    
    // Accuracy Badges
    {
      id: 'accuracy_80',
      name: 'Sharp Mind',
      description: 'Maintain 80% accuracy',
      icon: <Star />,
      color: '#ffd700',
      requirement: { type: 'accuracy', value: 80 },
      earned: userStats.averageAccuracy >= 80,
      progress: Math.min(100, (userStats.averageAccuracy / 80) * 100)
    },
    {
      id: 'accuracy_90',
      name: 'Precision Expert',
      description: 'Maintain 90% accuracy',
      icon: <WorkspacePremium />,
      color: '#e91e63',
      requirement: { type: 'accuracy', value: 90 },
      earned: userStats.averageAccuracy >= 90,
      progress: Math.min(100, (userStats.averageAccuracy / 90) * 100)
    },
    
    // Review Badges
    {
      id: 'reviews_100',
      name: 'Dedicated Learner',
      description: 'Complete 100 reviews',
      icon: <TrendingUp />,
      color: '#00bcd4',
      requirement: { type: 'reviews', value: 100 },
      earned: userStats.totalReviews >= 100,
      progress: Math.min(100, (userStats.totalReviews / 100) * 100)
    },
    
    // Community Helper Badge
    {
      id: 'helper_5',
      name: 'Community Helper',
      description: 'Help 5 people with translations',
      icon: <Language />,
      color: '#795548',
      requirement: { type: 'helper', value: 5 },
      earned: (userStats.helpfulReplies || 0) >= 5,
      progress: Math.min(100, ((userStats.helpfulReplies || 0) / 5) * 100)
    }
  ];

  const earnedBadges = badges.filter(b => b.earned);
  const nextBadge = badges.find(b => !b.earned && b.progress > 0);

  if (displayMode === 'compact') {
    return (
      <Stack direction="row" spacing={0.5} alignItems="center">
        {/* Show up to 3 most recent earned badges */}
        {earnedBadges.slice(-3).map((badge) => (
          <Tooltip
            key={badge.id}
            title={
              <Box>
                <Typography variant="subtitle2">{badge.name}</Typography>
                <Typography variant="caption" display="block">
                  {badge.description}
                </Typography>
              </Box>
            }
          >
            <Avatar
              sx={{
                width: 24,
                height: 24,
                backgroundColor: badge.color,
                '& svg': { fontSize: 16 }
              }}
            >
              {badge.icon}
            </Avatar>
          </Tooltip>
        ))}
        
        {earnedBadges.length > 3 && (
          <Chip
            label={`+${earnedBadges.length - 3}`}
            size="small"
            sx={{ height: 24, fontSize: '0.75rem' }}
          />
        )}
        
        {/* Show next badge progress */}
        {nextBadge && (
          <Tooltip
            title={
              <Box>
                <Typography variant="subtitle2">Next: {nextBadge.name}</Typography>
                <Typography variant="caption" display="block">
                  {nextBadge.description}
                </Typography>
                <Typography variant="caption" display="block">
                  Progress: {Math.round(nextBadge.progress)}%
                </Typography>
              </Box>
            }
          >
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <Avatar
                sx={{
                  width: 24,
                  height: 24,
                  backgroundColor: darkMode ? '#333' : '#e0e0e0',
                  opacity: 0.5,
                  '& svg': { fontSize: 16 }
                }}
              >
                {nextBadge.icon}
              </Avatar>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -2,
                  left: 0,
                  right: 0,
                  height: 2,
                  backgroundColor: darkMode ? '#444' : '#ddd',
                  borderRadius: 1,
                  overflow: 'hidden'
                }}
              >
                <Box
                  sx={{
                    width: `${nextBadge.progress}%`,
                    height: '100%',
                    backgroundColor: nextBadge.color,
                    transition: 'width 0.3s ease'
                  }}
                />
              </Box>
            </Box>
          </Tooltip>
        )}
      </Stack>
    );
  }

  // Full display mode
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Your Achievements
      </Typography>
      
      <Stack spacing={2}>
        {/* Earned Badges */}
        {earnedBadges.length > 0 && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Earned Badges
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {earnedBadges.map((badge) => (
                <motion.div
                  key={badge.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <Tooltip title={badge.description}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: darkMode ? '#1a1a1a' : '#f5f5f5',
                        border: `2px solid ${badge.color}`,
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)'
                        }
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          backgroundColor: badge.color,
                          mb: 1
                        }}
                      >
                        {badge.icon}
                      </Avatar>
                      <Typography variant="caption" align="center">
                        {badge.name}
                      </Typography>
                    </Box>
                  </Tooltip>
                </motion.div>
              ))}
            </Box>
          </Box>
        )}

        {/* In Progress Badges */}
        {badges.filter(b => !b.earned).length > 0 && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              In Progress
            </Typography>
            <Stack spacing={1}>
              {badges.filter(b => !b.earned).map((badge) => (
                <Box
                  key={badge.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 1.5,
                    borderRadius: 1,
                    backgroundColor: darkMode ? '#0f0f0f' : '#fafafa',
                    opacity: badge.progress > 0 ? 1 : 0.5
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      backgroundColor: darkMode ? '#333' : '#e0e0e0',
                      color: darkMode ? '#666' : '#999'
                    }}
                  >
                    {badge.icon}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2">{badge.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {badge.description}
                    </Typography>
                    <Box
                      sx={{
                        mt: 0.5,
                        height: 4,
                        backgroundColor: darkMode ? '#333' : '#e0e0e0',
                        borderRadius: 2,
                        overflow: 'hidden'
                      }}
                    >
                      <Box
                        sx={{
                          width: `${badge.progress}%`,
                          height: '100%',
                          backgroundColor: badge.color,
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {Math.round(badge.progress)}%
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </Stack>
    </Box>
  );
};