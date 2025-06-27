"use client";

import React, { useState } from 'react';
import { Box, Stack, Typography, Avatar, Chip, Tabs, Tab, IconButton, Tooltip } from '@mui/material';
import { 
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Remove as NoChangeIcon,
  LocalFireDepartment as FireIcon,
  School as SchoolIcon,
  ChatBubble as ChatIcon,
} from '@mui/icons-material';
import { LeaderboardEntry } from '../types/gamification';
import { getLevelInfo } from '../types/gamification';

interface CommunityLeaderboardProps {
  leaderboard: {
    weekly: LeaderboardEntry[];
    monthly: LeaderboardEntry[];
    allTime: LeaderboardEntry[];
  };
  currentUserId?: string;
  darkMode: boolean;
  onUserClick?: (entry: LeaderboardEntry) => void;
}

export const CommunityLeaderboard: React.FC<CommunityLeaderboardProps> = ({ 
  leaderboard,
  currentUserId,
  darkMode,
  onUserClick,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1: return { icon: '🥇', color: '#fbbf24' };
      case 2: return { icon: '🥈', color: '#94a3b8' };
      case 3: return { icon: '🥉', color: '#f97316' };
      default: return null;
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUpIcon sx={{ fontSize: 16, color: '#22c55e' }} />;
    if (change < 0) return <TrendingDownIcon sx={{ fontSize: 16, color: '#ef4444' }} />;
    return <NoChangeIcon sx={{ fontSize: 16, color: '#6b7280' }} />;
  };

  const currentLeaderboard = activeTab === 0 ? leaderboard.weekly : 
                            activeTab === 1 ? leaderboard.monthly : 
                            leaderboard.allTime;

  return (
    <Box
      sx={{
        backgroundColor: darkMode ? 'rgba(30, 30, 30, 0.5)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid',
        borderColor: darkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
        borderRadius: '12px',
        boxShadow: darkMode ? '0 20px 40px -12px rgba(0, 0, 0, 0.3)' : '0 20px 40px -12px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        mb: 3,
      }}
    >
      {/* Header */}
      <Box sx={{ px: 2.5, pt: 2.5, pb: 0 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <TrophyIcon sx={{ color: '#f59e0b', fontSize: 24 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '18px', color: darkMode ? 'white' : '#1a1a1a' }}>
            Community Leaderboard
          </Typography>
        </Stack>

        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{
            borderBottom: '1px solid',
            borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
            '& .MuiTab-root': {
              minHeight: 40,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '14px',
              color: darkMode ? '#9ca3af' : '#6b7280',
              '&.Mui-selected': {
                color: darkMode ? 'white' : '#1a1a1a',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#f59e0b',
            },
          }}
        >
          <Tab label="This Week" />
          <Tab label="This Month" />
          <Tab label="All Time" />
        </Tabs>
      </Box>

      {/* Leaderboard List */}
      <Box sx={{ p: 2.5, pt: 2 }}>
        <Stack spacing={1.5}>
          {currentLeaderboard.map((entry, index) => {
            const rank = index + 1;
            const rankBadge = getRankBadge(rank);
            const levelInfo = getLevelInfo(entry.level * 150); // Mock XP calculation
            const isCurrentUser = entry.userId === currentUserId;

            return (
              <Box
                key={entry.userId}
                onClick={() => onUserClick?.(entry)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 1.5,
                  borderRadius: '10px',
                  bgcolor: isCurrentUser
                    ? darkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)'
                    : darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  border: '1px solid',
                  borderColor: isCurrentUser
                    ? darkMode ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.15)'
                    : darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: isCurrentUser
                      ? darkMode ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.08)'
                      : darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                {/* Rank */}
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: rankBadge ? '20px' : '14px',
                    color: rankBadge ? rankBadge.color : darkMode ? '#9ca3af' : '#6b7280',
                  }}
                >
                  {rankBadge ? rankBadge.icon : `#${rank}`}
                </Box>

                {/* Position Change */}
                {activeTab !== 2 && ( // No change indicator for all-time
                  <Stack alignItems="center" spacing={0}>
                    {getChangeIcon(entry.change)}
                    {entry.change !== 0 && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontSize: '10px',
                          color: entry.change > 0 ? '#22c55e' : '#ef4444',
                          fontWeight: 600,
                        }}
                      >
                        {Math.abs(entry.change)}
                      </Typography>
                    )}
                  </Stack>
                )}

                {/* User Avatar */}
                <Avatar
                  src={entry.avatar}
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: levelInfo.badgeColor,
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                >
                  {entry.username.substring(0, 2).toUpperCase()}
                </Avatar>

                {/* User Info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600,
                        color: darkMode ? 'white' : '#1a1a1a',
                      }}
                    >
                      {entry.username}
                      {isCurrentUser && ' (You)'}
                    </Typography>
                    <Chip
                      label={`Lvl ${entry.level}`}
                      size="small"
                      sx={{
                        height: '18px',
                        fontSize: '10px',
                        bgcolor: `${levelInfo.badgeColor}20`,
                        color: levelInfo.badgeColor,
                        fontWeight: 600,
                      }}
                    />
                  </Stack>
                  
                  {/* Stats */}
                  {entry.stats && (
                    <Stack direction="row" spacing={1.5} sx={{ mt: 0.5 }}>
                      {entry.stats.streak && (
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <FireIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
                          <Typography variant="caption" sx={{ fontSize: '11px', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                            {entry.stats.streak} days
                          </Typography>
                        </Stack>
                      )}
                      {entry.stats.sessions && (
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <ChatIcon sx={{ fontSize: 14, color: '#3b82f6' }} />
                          <Typography variant="caption" sx={{ fontSize: '11px', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                            {entry.stats.sessions} sessions
                          </Typography>
                        </Stack>
                      )}
                      {entry.stats.wordsLearned && (
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <SchoolIcon sx={{ fontSize: 14, color: '#10b981' }} />
                          <Typography variant="caption" sx={{ fontSize: '11px', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                            {entry.stats.wordsLearned} words
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                  )}
                </Box>

                {/* Score */}
                <Box sx={{ textAlign: 'right' }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 700,
                      color: darkMode ? 'white' : '#1a1a1a',
                      fontSize: '16px',
                    }}
                  >
                    {entry.score}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontSize: '11px',
                      color: darkMode ? '#9ca3af' : '#6b7280',
                    }}
                  >
                    XP
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Stack>

        {/* Your Position (if not in top) */}
        {currentUserId && !currentLeaderboard.find(e => e.userId === currentUserId) && (
          <Box
            sx={{
              mt: 2,
              pt: 2,
              borderTop: '1px solid',
              borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 1.5,
                borderRadius: '10px',
                bgcolor: darkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
                border: '1px solid',
                borderColor: darkMode ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.15)',
              }}
            >
              <Typography sx={{ fontWeight: 600, color: darkMode ? '#9ca3af' : '#6b7280' }}>
                #42
              </Typography>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#6366f1', fontSize: '12px' }}>
                Y
              </Avatar>
              <Typography variant="body2" sx={{ flex: 1, fontWeight: 600 }}>
                You
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                120 XP
              </Typography>
            </Box>
          </Box>
        )}

        {/* Footer */}
        <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
          <Chip
            label="View full rankings"
            size="small"
            clickable
            sx={{
              bgcolor: darkMode ? 'rgba(251, 191, 36, 0.1)' : 'rgba(251, 191, 36, 0.08)',
              color: '#f59e0b',
              fontWeight: 600,
              fontSize: '12px',
              '&:hover': {
                bgcolor: darkMode ? 'rgba(251, 191, 36, 0.15)' : 'rgba(251, 191, 36, 0.12)',
              },
            }}
          />
        </Stack>
      </Box>
    </Box>
  );
};