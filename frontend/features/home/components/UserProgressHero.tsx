import React from 'react';
import { Box, Stack, Typography, Avatar, LinearProgress, Tooltip, IconButton, Chip } from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon,
  LocalFireDepartment as FireIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { UserProgress } from '../types/gamification';
import { getLevelInfo, calculateProgress, USER_LEVELS } from '../types/gamification';

interface UserProgressHeroProps {
  userProgress: UserProgress;
  darkMode: boolean;
  onViewProfile?: () => void;
}

export const UserProgressHero: React.FC<UserProgressHeroProps> = ({ 
  userProgress, 
  darkMode, 
  onViewProfile 
}) => {
  const levelInfo = getLevelInfo(userProgress.totalXP);
  const progressData = calculateProgress(userProgress.totalXP);
  const nextLevel = USER_LEVELS[levelInfo.level] || USER_LEVELS[USER_LEVELS.length - 1];

  const stats = [
    { 
      label: 'Connections', 
      value: userProgress.stats.totalConnections, 
      icon: '🤝',
      color: '#3b82f6' 
    },
    { 
      label: 'Sessions', 
      value: userProgress.stats.sessionsCompleted, 
      icon: '💬',
      color: '#10b981' 
    },
    { 
      label: 'Words', 
      value: userProgress.stats.wordsLearned, 
      icon: '📚',
      color: '#f59e0b' 
    },
    { 
      label: 'Minutes', 
      value: userProgress.stats.minutesPracticed, 
      icon: '⏱️',
      color: '#8b5cf6' 
    },
  ];

  return (
    <Box
      sx={{
        background: darkMode 
          ? 'linear-gradient(135deg, rgba(30, 30, 30, 0.9) 0%, rgba(30, 30, 30, 0.7) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 250, 251, 0.9) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid',
        borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
        borderRadius: '16px',
        p: { xs: 2.5, sm: 3 },
        mb: 3,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${levelInfo.badgeColor}20 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'center', sm: 'flex-start' }}>
        {/* User Avatar with Level Badge */}
        <Box sx={{ position: 'relative', cursor: 'pointer' }} onClick={onViewProfile}>
          <Avatar
            src={userProgress.avatar}
            sx={{
              width: { xs: 80, sm: 100 },
              height: { xs: 80, sm: 100 },
              bgcolor: levelInfo.badgeColor,
              fontSize: { xs: '28px', sm: '36px' },
              fontWeight: 600,
              border: '3px solid',
              borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          >
            {userProgress.username.substring(0, 2).toUpperCase()}
          </Avatar>
          <Tooltip title={`Level ${levelInfo.level}: ${levelInfo.title}`}>
            <Box
              sx={{
                position: 'absolute',
                bottom: -5,
                right: -5,
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: levelInfo.badgeColor,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '14px',
                border: '2px solid',
                borderColor: darkMode ? '#0a0a0a' : 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              {levelInfo.level}
            </Box>
          </Tooltip>
        </Box>

        {/* Progress and Stats */}
        <Box sx={{ flex: 1, width: '100%' }}>
          {/* Name and Title */}
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: darkMode ? 'white' : '#1a1a1a' }}>
              {userProgress.username === 'You' ? 'Welcome back!' : userProgress.username}
            </Typography>
            <Chip
              label={levelInfo.title}
              size="small"
              sx={{
                bgcolor: `${levelInfo.badgeColor}20`,
                color: levelInfo.badgeColor,
                fontWeight: 600,
                fontSize: '12px',
              }}
            />
            {userProgress.currentStreak > 0 && (
              <Tooltip title={`${userProgress.currentStreak} day streak!`}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <FireIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                  <Typography sx={{ fontWeight: 600, color: '#f59e0b', fontSize: '14px' }}>
                    {userProgress.currentStreak}
                  </Typography>
                </Stack>
              </Tooltip>
            )}
          </Stack>

          {/* XP Progress Bar */}
          <Box sx={{ mb: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
              <Typography variant="body2" sx={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '13px' }}>
                Level {levelInfo.level} Progress
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: darkMode ? '#e5e7eb' : '#374151' }}>
                {progressData.xpInLevel} / {nextLevel.maxXP - levelInfo.minXP} XP
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={progressData.progress}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: `linear-gradient(90deg, ${levelInfo.badgeColor} 0%, ${nextLevel.badgeColor} 100%)`,
                },
              }}
            />
            <Typography 
              variant="caption" 
              sx={{ 
                color: darkMode ? '#9ca3af' : '#6b7280', 
                fontSize: '11px',
                display: 'block',
                mt: 0.5,
              }}
            >
              {progressData.xpToNext} XP to Level {levelInfo.level + 1}
            </Typography>
          </Box>

          {/* Quick Stats */}
          <Stack direction="row" spacing={{ xs: 1, sm: 2 }} flexWrap="wrap">
            {stats.map((stat) => (
              <Tooltip key={stat.label} title={`Total ${stat.label.toLowerCase()}`}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.5,
                    py: 0.75,
                    borderRadius: '8px',
                    bgcolor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                    border: '1px solid',
                    borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: `${stat.color}15`,
                      borderColor: stat.color,
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Typography sx={{ fontSize: '16px' }}>{stat.icon}</Typography>
                  <Stack spacing={0}>
                    <Typography 
                      sx={{ 
                        fontWeight: 700, 
                        fontSize: '14px',
                        color: darkMode ? 'white' : '#1a1a1a',
                        lineHeight: 1,
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: darkMode ? '#9ca3af' : '#6b7280',
                        fontSize: '10px',
                        lineHeight: 1.2,
                      }}
                    >
                      {stat.label}
                    </Typography>
                  </Stack>
                </Box>
              </Tooltip>
            ))}
          </Stack>
        </Box>

        {/* Rank Badge */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.5,
            px: 2,
            py: 1.5,
            borderRadius: '12px',
            bgcolor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
            border: '1px solid',
            borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
          }}
        >
          <TrophyIcon sx={{ color: '#f59e0b', fontSize: 28 }} />
          <Typography sx={{ fontWeight: 700, fontSize: '18px', color: darkMode ? 'white' : '#1a1a1a' }}>
            #{userProgress.rank}
          </Typography>
          <Typography variant="caption" sx={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '11px' }}>
            Global Rank
          </Typography>
        </Box>
      </Stack>

      {/* Weekly/Monthly XP Trend */}
      <Stack 
        direction="row" 
        spacing={2} 
        sx={{ 
          mt: 2, 
          pt: 2, 
          borderTop: '1px solid',
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <TrendingUpIcon sx={{ color: '#10b981', fontSize: 18 }} />
          <Typography variant="body2" sx={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
            This week: <strong style={{ color: '#10b981' }}>+{userProgress.weeklyXP} XP</strong>
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" sx={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
            This month: <strong style={{ color: darkMode ? 'white' : '#1a1a1a' }}>+{userProgress.monthlyXP} XP</strong>
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};