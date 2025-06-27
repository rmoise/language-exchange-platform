import React from 'react';
import { Box, Grid, Typography, Badge, Tooltip } from '@mui/material';
import { 
  VideoCall as VideoCallIcon,
  School as SchoolIcon,
  Groups as GroupsIcon,
  SmartToy as AIIcon,
  Schedule as ScheduleIcon,
  Forum as ForumIcon,
  Language as LanguageIcon,
  Quiz as QuizIcon,
} from '@mui/icons-material';
import { QuickAction } from '../types/gamification';

interface QuickActionCardsProps {
  darkMode: boolean;
  onActionClick?: (action: QuickAction) => void;
}

export const QuickActionCards: React.FC<QuickActionCardsProps> = ({ 
  darkMode,
  onActionClick,
}) => {
  const quickActions: QuickAction[] = [
    {
      id: 'start-session',
      title: 'Start Session',
      description: '3 partners online',
      icon: <VideoCallIcon sx={{ fontSize: 28 }} />,
      color: '#22c55e',
      action: () => console.log('Start session'),
      badge: 3,
      isHighlighted: true,
    },
    {
      id: 'review-flashcards',
      title: 'Review Cards',
      description: '12 cards due',
      icon: <SchoolIcon sx={{ fontSize: 28 }} />,
      color: '#3b82f6',
      action: () => console.log('Review flashcards'),
      badge: 12,
    },
    {
      id: 'join-group',
      title: 'Group Chat',
      description: 'Spanish learners',
      icon: <GroupsIcon sx={{ fontSize: 28 }} />,
      color: '#f59e0b',
      action: () => console.log('Join group'),
    },
    {
      id: 'ai-tutor',
      title: 'AI Practice',
      description: 'Available 24/7',
      icon: <AIIcon sx={{ fontSize: 28 }} />,
      color: '#8b5cf6',
      action: () => console.log('AI tutor'),
    },
    {
      id: 'schedule-session',
      title: 'Schedule',
      description: 'Book ahead',
      icon: <ScheduleIcon sx={{ fontSize: 28 }} />,
      color: '#06b6d4',
      action: () => console.log('Schedule'),
    },
    {
      id: 'browse-topics',
      title: 'Topics',
      description: 'New discussions',
      icon: <ForumIcon sx={{ fontSize: 28 }} />,
      color: '#ec4899',
      action: () => console.log('Browse topics'),
      badge: 5,
    },
    {
      id: 'translate',
      title: 'Translate',
      description: 'Quick lookup',
      icon: <LanguageIcon sx={{ fontSize: 28 }} />,
      color: '#10b981',
      action: () => console.log('Translate'),
    },
    {
      id: 'take-quiz',
      title: 'Daily Quiz',
      description: 'Test yourself',
      icon: <QuizIcon sx={{ fontSize: 28 }} />,
      color: '#f97316',
      action: () => console.log('Take quiz'),
      isHighlighted: true,
    },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <Typography 
        variant="h6" 
        sx={{ 
          fontWeight: 600, 
          fontSize: '18px',
          mb: 2,
          color: darkMode ? 'white' : '#1a1a1a',
        }}
      >
        Quick Actions
      </Typography>

      <Grid container spacing={2}>
        {quickActions.map((action) => (
          <Grid item xs={6} sm={3} key={action.id}>
            <Tooltip title={action.description}>
              <Box
                onClick={() => {
                  action.action();
                  onActionClick?.(action);
                }}
                sx={{
                  position: 'relative',
                  p: 2,
                  height: '100%',
                  minHeight: 100,
                  borderRadius: '12px',
                  bgcolor: darkMode 
                    ? `${action.color}15`
                    : `${action.color}10`,
                  border: '1px solid',
                  borderColor: darkMode 
                    ? `${action.color}30`
                    : `${action.color}20`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  '&:hover': {
                    bgcolor: darkMode 
                      ? `${action.color}20`
                      : `${action.color}15`,
                    borderColor: action.color,
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 16px ${action.color}20`,
                  },
                  '&::before': action.isHighlighted ? {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `radial-gradient(circle at top right, ${action.color}20 0%, transparent 70%)`,
                    pointerEvents: 'none',
                  } : {},
                }}
              >
                {/* Badge */}
                {action.badge && (
                  <Badge
                    badgeContent={action.badge}
                    color="error"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      '& .MuiBadge-badge': {
                        fontSize: '10px',
                        height: '18px',
                        minWidth: '18px',
                      },
                    }}
                  />
                )}

                {/* Icon */}
                <Box
                  sx={{
                    color: action.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {action.icon}
                </Box>

                {/* Title */}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 600,
                    color: darkMode ? 'white' : '#1a1a1a',
                    textAlign: 'center',
                    fontSize: '13px',
                  }}
                >
                  {action.title}
                </Typography>

                {/* Description */}
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: darkMode ? '#9ca3af' : '#6b7280',
                    fontSize: '11px',
                    textAlign: 'center',
                  }}
                >
                  {action.description}
                </Typography>

                {/* Highlight indicator */}
                {action.isHighlighted && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: action.color,
                      boxShadow: `0 0 8px ${action.color}`,
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%': {
                          boxShadow: `0 0 0 0 ${action.color}80`,
                        },
                        '70%': {
                          boxShadow: `0 0 0 6px ${action.color}00`,
                        },
                        '100%': {
                          boxShadow: `0 0 0 0 ${action.color}00`,
                        },
                      },
                    }}
                  />
                )}
              </Box>
            </Tooltip>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};