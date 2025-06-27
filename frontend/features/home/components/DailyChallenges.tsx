import React from 'react';
import { Box, Stack, Typography, LinearProgress, Chip, IconButton, Tooltip } from '@mui/material';
import { 
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as UncheckedIcon,
  EmojiEvents as TrophyIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { DailyChallenge } from '../types/gamification';

interface DailyChallengesProps {
  challenges: DailyChallenge[];
  darkMode: boolean;
  onChallengeClick?: (challenge: DailyChallenge) => void;
}

export const DailyChallenges: React.FC<DailyChallengesProps> = ({ 
  challenges, 
  darkMode,
  onChallengeClick 
}) => {
  const completedCount = challenges.filter(c => c.completed).length;
  const totalXP = challenges.reduce((sum, c) => sum + c.xpReward, 0);
  const earnedXP = challenges.filter(c => c.completed).reduce((sum, c) => sum + c.xpReward, 0);

  const categoryColors = {
    conversation: '#3b82f6',
    learning: '#10b981',
    social: '#f59e0b',
    practice: '#8b5cf6',
  };

  const categoryIcons = {
    conversation: '💬',
    learning: '📚',
    social: '🤝',
    practice: '🎯',
  };

  return (
    <Box
      sx={{
        backgroundColor: darkMode ? 'rgba(30, 30, 30, 0.5)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid',
        borderColor: darkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
        borderRadius: '12px',
        boxShadow: darkMode ? '0 20px 40px -12px rgba(0, 0, 0, 0.3)' : '0 20px 40px -12px rgba(0, 0, 0, 0.08)',
        p: { xs: 2, sm: 2.5 },
        mb: 3,
      }}
    >
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '18px', color: darkMode ? 'white' : '#1a1a1a' }}>
            Daily Challenges
          </Typography>
          <Chip
            icon={<TrophyIcon sx={{ fontSize: '14px !important' }} />}
            label={`${earnedXP}/${totalXP} XP`}
            size="small"
            sx={{
              bgcolor: darkMode ? 'rgba(251, 191, 36, 0.1)' : 'rgba(251, 191, 36, 0.08)',
              color: '#f59e0b',
              fontWeight: 600,
              fontSize: '12px',
              '& .MuiChip-icon': {
                color: '#f59e0b',
              },
            }}
          />
        </Stack>
        <Typography variant="body2" sx={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
          {completedCount}/{challenges.length} completed
        </Typography>
      </Stack>

      {/* Overall Progress */}
      <Box sx={{ mb: 2.5 }}>
        <LinearProgress
          variant="determinate"
          value={(completedCount / challenges.length) * 100}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 3,
              background: 'linear-gradient(90deg, #f59e0b 0%, #f97316 100%)',
            },
          }}
        />
      </Box>

      {/* Challenges List */}
      <Stack spacing={1.5}>
        {challenges.map((challenge) => (
          <Box
            key={challenge.id}
            onClick={() => onChallengeClick?.(challenge)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 1.5,
              borderRadius: '10px',
              bgcolor: challenge.completed 
                ? darkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)'
                : darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
              border: '1px solid',
              borderColor: challenge.completed
                ? darkMode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.15)'
                : darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              opacity: challenge.completed ? 0.8 : 1,
              '&:hover': {
                bgcolor: challenge.completed
                  ? darkMode ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.08)'
                  : darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                transform: 'translateX(4px)',
              },
            }}
          >
            {/* Status Icon */}
            {challenge.completed ? (
              <CheckIcon sx={{ color: '#22c55e', fontSize: 24 }} />
            ) : (
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  border: '2px solid',
                  borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)',
                }}
              />
            )}

            {/* Challenge Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                <Typography sx={{ fontSize: '16px' }}>
                  {categoryIcons[challenge.category]}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 600,
                    color: challenge.completed
                      ? darkMode ? '#9ca3af' : '#6b7280'
                      : darkMode ? 'white' : '#1a1a1a',
                    textDecoration: challenge.completed ? 'line-through' : 'none',
                  }}
                >
                  {challenge.title}
                </Typography>
              </Stack>
              
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: darkMode ? '#9ca3af' : '#6b7280',
                    fontSize: '12px',
                  }}
                >
                  {challenge.description}
                </Typography>
                
                {/* Progress indicator for incomplete challenges */}
                {!challenge.completed && challenge.progress > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 4,
                        borderRadius: 2,
                        bgcolor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          width: `${(challenge.progress / challenge.target) * 100}%`,
                          height: '100%',
                          bgcolor: categoryColors[challenge.category],
                          transition: 'width 0.3s',
                        }}
                      />
                    </Box>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontSize: '11px',
                        color: categoryColors[challenge.category],
                        fontWeight: 600,
                      }}
                    >
                      {challenge.progress}/{challenge.target}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>

            {/* XP Reward */}
            <Tooltip title={challenge.completed ? 'XP earned!' : 'Complete to earn XP'}>
              <Chip
                label={`+${challenge.xpReward} XP`}
                size="small"
                sx={{
                  bgcolor: challenge.completed
                    ? darkMode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)'
                    : darkMode ? 'rgba(251, 191, 36, 0.1)' : 'rgba(251, 191, 36, 0.08)',
                  color: challenge.completed ? '#22c55e' : '#f59e0b',
                  fontWeight: 700,
                  fontSize: '12px',
                  height: '24px',
                }}
              />
            </Tooltip>
          </Box>
        ))}
      </Stack>

      {/* Footer Tip */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)' }}>
        <InfoIcon sx={{ fontSize: 14, color: darkMode ? '#9ca3af' : '#6b7280' }} />
        <Typography variant="caption" sx={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '11px' }}>
          Complete all daily challenges to earn bonus XP and maintain your streak!
        </Typography>
      </Stack>
    </Box>
  );
};