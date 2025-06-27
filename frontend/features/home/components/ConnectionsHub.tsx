"use client";

import React, { useState } from 'react';
import { Box, Stack, Typography, Avatar, Chip, Button, IconButton, Tooltip, Badge, Tabs, Tab } from '@mui/material';
import { 
  Message as MessageIcon,
  VideoCall as VideoCallIcon,
  Schedule as ScheduleIcon,
  PersonAdd as PersonAddIcon,
  Circle as CircleIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { Connection } from '../types/gamification';
import { getLevelInfo } from '../types/gamification';

// Helper function to map languages to emoji flags
const getLanguageEmojiFlag = (language: string): string => {
  const languageToEmoji: { [key: string]: string } = {
    English: "🇺🇸",
    Spanish: "🇪🇸",
    French: "🇫🇷",
    German: "🇩🇪",
    Italian: "🇮🇹",
    Portuguese: "🇵🇹",
    Russian: "🇷🇺",
    Chinese: "🇨🇳",
    Japanese: "🇯🇵",
    Korean: "🇰🇷",
    Arabic: "🇸🇦",
    Hindi: "🇮🇳",
    Swedish: "🇸🇪",
    Dutch: "🇳🇱",
    Norwegian: "🇳🇴",
    Danish: "🇩🇰",
    Finnish: "🇫🇮",
    Polish: "🇵🇱",
    Czech: "🇨🇿",
    Hungarian: "🇭🇺",
    Romanian: "🇷🇴",
    Bulgarian: "🇧🇬",
    Greek: "🇬🇷",
    Turkish: "🇹🇷",
    Hebrew: "🇮🇱",
    Thai: "🇹🇭",
    Vietnamese: "🇻🇳",
    Indonesian: "🇮🇩",
    Malay: "🇲🇾",
    Filipino: "🇵🇭",
    Ukrainian: "🇺🇦",
    Croatian: "🇭🇷",
    Serbian: "🇷🇸",
    Slovenian: "🇸🇮",
    Slovak: "🇸🇰",
    Estonian: "🇪🇪",
    Latvian: "🇱🇻",
    Lithuanian: "🇱🇹",
  };

  return languageToEmoji[language] || "🌐";
};

interface ConnectionsHubProps {
  connections: Connection[];
  opportunities: any[]; // Simplified for now
  darkMode: boolean;
  onMessageClick?: (connection: Connection) => void;
  onScheduleClick?: (connection: Connection) => void;
  onConnectClick?: (opportunity: any) => void;
}

export const ConnectionsHub: React.FC<ConnectionsHubProps> = ({ 
  connections, 
  opportunities,
  darkMode,
  onMessageClick,
  onScheduleClick,
  onConnectClick,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const activeConnections = connections.filter(c => c.status === 'online');
  const recentConnections = connections.slice(0, 6);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#22c55e';
      case 'away': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
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
        overflow: 'hidden',
        mb: 3,
      }}
    >
      {/* Header with Tabs */}
      <Box sx={{ px: 2.5, pt: 2.5, pb: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '18px', color: darkMode ? 'white' : '#1a1a1a' }}>
            Your Connections
          </Typography>
          <Chip
            label={`${connections.length} total`}
            size="small"
            sx={{
              bgcolor: darkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.08)',
              color: '#6366f1',
              fontWeight: 600,
              fontSize: '12px',
            }}
          />
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
              backgroundColor: '#6366f1',
            },
          }}
        >
          <Tab label={`Active Now (${activeConnections.length})`} />
          <Tab label="Recent" />
          <Tab label={`Discover (${opportunities.length})`} />
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2.5, pt: 2 }}>
        {/* Active Connections Tab */}
        {activeTab === 0 && (
          <Stack spacing={2}>
            {activeConnections.length === 0 ? (
              <Typography variant="body2" sx={{ color: darkMode ? '#9ca3af' : '#6b7280', textAlign: 'center', py: 3 }}>
                No connections online right now
              </Typography>
            ) : (
              activeConnections.map((connection) => {
                const levelInfo = getLevelInfo(connection.level * 150); // Mock XP calculation
                return (
                  <Box
                    key={connection.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 1.5,
                      borderRadius: '10px',
                      bgcolor: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                      border: '1px solid',
                      borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                        borderColor: '#6366f1',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    {/* Avatar with online status */}
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        <CircleIcon 
                          sx={{ 
                            fontSize: 12, 
                            color: getStatusColor(connection.status),
                            bgcolor: darkMode ? '#0a0a0a' : 'white',
                            borderRadius: '50%',
                          }} 
                        />
                      }
                    >
                      <Avatar
                        src={connection.avatar}
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: levelInfo.badgeColor,
                          fontWeight: 600,
                        }}
                      >
                        {connection.username.substring(0, 2).toUpperCase()}
                      </Avatar>
                    </Badge>

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
                          {connection.username}
                        </Typography>
                        <Chip
                          label={`Lvl ${connection.level}`}
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
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Typography sx={{ fontSize: '16px' }}>
                            {getLanguageEmojiFlag(connection.nativeLanguage)}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: darkMode ? '#9ca3af' : '#6b7280',
                              fontSize: '12px',
                            }}
                          >
                            →
                          </Typography>
                          <Typography sx={{ fontSize: '16px' }}>
                            {getLanguageEmojiFlag(connection.learningLanguage)}
                          </Typography>
                        </Stack>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: '#22c55e',
                            fontSize: '11px',
                          }}
                        >
                          • Online now
                        </Typography>
                      </Stack>
                    </Box>

                    {/* Action Buttons */}
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Send message">
                        <IconButton
                          size="small"
                          onClick={() => onMessageClick?.(connection)}
                          sx={{
                            bgcolor: darkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.08)',
                            color: '#6366f1',
                            '&:hover': {
                              bgcolor: darkMode ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.15)',
                            },
                          }}
                        >
                          <MessageIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Start video call">
                        <IconButton
                          size="small"
                          sx={{
                            bgcolor: darkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.08)',
                            color: '#22c55e',
                            '&:hover': {
                              bgcolor: darkMode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.15)',
                            },
                          }}
                        >
                          <VideoCallIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>
                );
              })
            )}
          </Stack>
        )}

        {/* Recent Connections Tab */}
        {activeTab === 1 && (
          <Stack spacing={2}>
            {recentConnections.map((connection) => {
              const levelInfo = getLevelInfo(connection.level * 150);
              return (
                <Box
                  key={connection.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 1.5,
                    borderRadius: '10px',
                    opacity: connection.status === 'offline' ? 0.7 : 1,
                  }}
                >
                  <Avatar
                    src={connection.avatar}
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: levelInfo.badgeColor,
                      fontSize: '14px',
                    }}
                  >
                    {connection.username.substring(0, 2).toUpperCase()}
                  </Avatar>

                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 500,
                        color: darkMode ? 'white' : '#1a1a1a',
                      }}
                    >
                      {connection.username}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: darkMode ? '#9ca3af' : '#6b7280',
                        fontSize: '11px',
                      }}
                    >
                      Last seen {getTimeAgo(connection.lastActive)}
                    </Typography>
                  </Box>

                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Chip
                      label={`${connection.sharedSessions} sessions`}
                      size="small"
                      sx={{
                        height: '20px',
                        fontSize: '11px',
                        bgcolor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => onScheduleClick?.(connection)}
                    >
                      <ScheduleIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        )}

        {/* Discover Tab */}
        {activeTab === 2 && (
          <Stack spacing={2}>
            {opportunities.map((opp) => (
              <Box
                key={opp.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  borderRadius: '10px',
                  bgcolor: darkMode ? 'rgba(99, 102, 241, 0.05)' : 'rgba(99, 102, 241, 0.03)',
                  border: '1px solid',
                  borderColor: darkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.08)',
                }}
              >
                <Avatar
                  src={opp.avatar}
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: '#6366f1',
                  }}
                >
                  {opp.username.substring(0, 2).toUpperCase()}
                </Avatar>

                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600,
                        color: darkMode ? 'white' : '#1a1a1a',
                      }}
                    >
                      {opp.username}
                    </Typography>
                    <Chip
                      icon={<StarIcon sx={{ fontSize: '12px !important' }} />}
                      label={`${opp.compatibility}% match`}
                      size="small"
                      sx={{
                        height: '20px',
                        fontSize: '11px',
                        bgcolor: darkMode ? 'rgba(251, 191, 36, 0.1)' : 'rgba(251, 191, 36, 0.08)',
                        color: '#f59e0b',
                        '& .MuiChip-icon': {
                          color: '#f59e0b',
                        },
                      }}
                    />
                  </Stack>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Typography sx={{ fontSize: '16px' }}>
                      {getLanguageEmojiFlag(opp.nativeLanguage)}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: darkMode ? '#9ca3af' : '#6b7280',
                        fontSize: '12px',
                      }}
                    >
                      speaker learning
                    </Typography>
                    <Typography sx={{ fontSize: '16px' }}>
                      {getLanguageEmojiFlag(opp.learningLanguage)}
                    </Typography>
                  </Stack>
                  {opp.commonInterests.length > 0 && (
                    <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                      {opp.commonInterests.map((interest: string, i: number) => (
                        <Chip
                          key={i}
                          label={interest}
                          size="small"
                          sx={{
                            height: '18px',
                            fontSize: '10px',
                            bgcolor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
                          }}
                        />
                      ))}
                    </Stack>
                  )}
                </Box>

                <Button
                  variant="contained"
                  size="small"
                  startIcon={<PersonAddIcon />}
                  onClick={() => onConnectClick?.(opp)}
                  sx={{
                    bgcolor: '#6366f1',
                    '&:hover': {
                      bgcolor: '#5558e3',
                    },
                  }}
                >
                  Connect
                </Button>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
};