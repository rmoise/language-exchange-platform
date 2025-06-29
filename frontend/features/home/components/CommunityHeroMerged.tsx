"use client";

import React, { useEffect, useRef } from 'react';
import { Box, Stack, Typography, Avatar, LinearProgress, Tooltip, Button, Chip } from '@mui/material';
import { keyframes } from '@mui/system';
import { showLevelUpNotification } from '@/components/ui/LevelUpNotification';
import { 
  TrendingUp as TrendingUpIcon,
  LocalFireDepartment as FireIcon,
  EmojiEvents as TrophyIcon,
  Public as PublicIcon,
  Groups as GroupsIcon,
  AddCircleOutline as AddCircleOutlineIcon,
} from '@mui/icons-material';
import { UserProgress } from '../types/gamification';
import { getLevelInfo, calculateProgress, USER_LEVELS } from '../types/gamification';
import UserAvatar from '@/components/ui/UserAvatar';
import { useColorScheme } from '@mui/material/styles';

const levelBadgePulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
`;

interface CommunityHeroMergedProps {
  userProgress: UserProgress;
  memberCount?: number;
  onViewProfile?: () => void;
  onInviteClick?: () => void;
  onMembersClick?: () => void;
}

export const CommunityHeroMerged: React.FC<CommunityHeroMergedProps> = ({ 
  userProgress, 
  memberCount = 0,
  onViewProfile,
  onInviteClick,
  onMembersClick,
}) => {
  console.log('CommunityHeroMerged - memberCount:', memberCount);
  const { mode } = useColorScheme();
  const darkMode = mode === 'dark';
  const levelInfo = getLevelInfo(userProgress.totalXP);
  const progressData = calculateProgress(userProgress.totalXP);
  const nextLevel = USER_LEVELS[levelInfo.level] || USER_LEVELS[USER_LEVELS.length - 1];
  const formattedMemberCount = memberCount ? memberCount.toLocaleString() : '0';
  const previousLevelRef = useRef(userProgress.level);
  const [levelChanged, setLevelChanged] = React.useState(false);
  
  // Detect level changes
  useEffect(() => {
    if (previousLevelRef.current && userProgress.level > previousLevelRef.current) {
      // User leveled up!
      showLevelUpNotification(userProgress.level, levelInfo.title);
      setLevelChanged(true);
      // Reset animation after 1 second
      setTimeout(() => setLevelChanged(false), 1000);
    }
    previousLevelRef.current = userProgress.level;
  }, [userProgress.level, levelInfo.title]);

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
        mb: 4,
        p: { xs: 3, sm: 4, md: 5 },
        background: darkMode
          ? "linear-gradient(135deg, rgba(17, 17, 17, 0.9) 0%, rgba(30, 30, 30, 0.7) 100%)"
          : "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 250, 251, 0.95) 100%)",
        backdropFilter: "blur(20px)",
        borderRadius: "24px",
        border: "1px solid",
        borderColor: darkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)",
        position: "relative",
        overflow: "hidden",
        boxShadow: darkMode
          ? "0 20px 40px -12px rgba(0, 0, 0, 0.3)"
          : "0 20px 40px -12px rgba(0, 0, 0, 0.08)",
      }}
    >
      {/* Background decorations */}
      <Box
        sx={{
          position: "absolute",
          top: "-50%",
          right: "-10%",
          width: "400px",
          height: "400px",
          background: darkMode
            ? "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 50%)"
            : "radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 50%)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: "-30%",
          left: "-5%",
          width: "300px",
          height: "300px",
          background: darkMode
            ? "radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 50%)"
            : "radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 50%)",
          pointerEvents: "none",
        }}
      />

      {/* Community Header */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "12px",
              background: darkMode
                ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                : "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: darkMode
                ? "0 8px 16px -4px rgba(99, 102, 241, 0.3)"
                : "0 8px 16px -4px rgba(59, 130, 246, 0.2)",
            }}
          >
            <GroupsIcon sx={{ fontSize: 24, color: "white" }} />
          </Box>
          <Stack spacing={0.5}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 300,
                fontSize: { xs: "20px", sm: "24px" },
                color: darkMode ? "#fff" : "#0f172a",
                letterSpacing: "-0.02em",
              }}
            >
              Language Learning Community
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography
                variant="body2"
                sx={{
                  color: darkMode ? "#94a3b8" : "#64748b",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                Public Community
              </Typography>
              <Box
                sx={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  backgroundColor: darkMode ? "#475569" : "#cbd5e1",
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: darkMode ? "#94a3b8" : "#64748b",
                  fontSize: "14px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  cursor: "pointer",
                  transition: "color 0.2s",
                  "&:hover": {
                    color: darkMode ? "#e2e8f0" : "#334155",
                  }
                }}
                onClick={() => {
                  if (onMembersClick) {
                    onMembersClick();
                  } else if ((window as any).__openMembersModal) {
                    (window as any).__openMembersModal();
                  }
                }}
              >
                <Box
                  component="span"
                  sx={{
                    color: darkMode ? "#e2e8f0" : "#0f172a",
                    fontWeight: 700,
                  }}
                >
                  {memberCount !== undefined ? formattedMemberCount : '...'}
                </Box>
                members
              </Typography>
            </Stack>
          </Stack>
        </Stack>
        <Button
          variant="contained"
          startIcon={<AddCircleOutlineIcon sx={{ fontSize: 20 }} />}
          onClick={onInviteClick}
          sx={{
            textTransform: "none",
            borderRadius: "12px",
            px: 3,
            py: 1.25,
            fontSize: "15px",
            fontWeight: 600,
            background: darkMode
              ? "#fff"
              : "#0f172a",
            color: darkMode
              ? "#0f172a"
              : "#fff",
            boxShadow: "none",
            transition: "all 0.2s",
            "&:hover": {
              background: darkMode
                ? "#f1f5f9"
                : "#1e293b",
              transform: "translateY(-1px)",
              boxShadow: darkMode
                ? "0 10px 20px -5px rgba(0, 0, 0, 0.3)"
                : "0 10px 20px -5px rgba(0, 0, 0, 0.2)",
            },
          }}
        >
          Invite
        </Button>
      </Stack>

      {/* User Progress Section */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'center', sm: 'flex-start' }}>
        {/* User Avatar with Level Badge */}
        <Box sx={{ position: 'relative', cursor: 'pointer' }} onClick={onViewProfile}>
          <UserAvatar
            user={{ 
              name: userProgress.username,
              profileImage: userProgress.avatar,
            } as any}
            size={{ xs: 80, sm: 100 }}
            showOnlineStatus={false}
            showBorderForNonImage={true}
            sx={{
              border: '3px solid',
              borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          />
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
                animation: levelChanged ? `${levelBadgePulse} 0.5s ease-in-out` : 'none',
                transition: 'background-color 0.3s ease',
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
              {userProgress.totalXP > 0 ? `Welcome back, ${userProgress.username}!` : `Hello, ${userProgress.username}!`}
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