"use client";

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  Grid,
  Stack,
  Modal,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  Lock as LockIcon,
  LocationOn as LocationIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { 
  useGetRecentVisitorCountQuery, 
  useGetProfileVisitsQuery 
} from '@/features/api/apiSlice';
import UserAvatar from '@/components/ui/UserAvatar';
import { formatDistanceToNow } from 'date-fns';
import type { User } from '@/types/global';

interface ProfileVisitorsProps {
  isPremium?: boolean;
}

const ProfileVisitors: React.FC<ProfileVisitorsProps> = ({ isPremium = false }) => {
  const [open, setOpen] = useState(false);
  const [timeWindow, setTimeWindow] = useState<'week' | 'month'>('week');

  // Get recent visitor count
  const { 
    data: countData, 
    isLoading: countLoading 
  } = useGetRecentVisitorCountQuery(timeWindow);

  // Get detailed visits only if premium and modal is open
  const { 
    data: visitsData, 
    isLoading: visitsLoading 
  } = useGetProfileVisitsQuery(
    { timeWindow, limit: 20, page: 0 },
    { skip: !isPremium || !open }
  );

  const handleOpen = () => {
    if (isPremium) {
      setOpen(true);
    } else {
      // Open modal to show premium upgrade UI instead of alert
      setOpen(true);
    }
  };

  const handleClose = () => setOpen(false);

  const visitorCount = countData?.count || 0;

  return (
    <>
      {/* Visitor Count Card */}
      <Card 
        sx={{ 
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(10px)',
          '&:hover': {
            transform: 'translateY(-1px)',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          },
        }}
        onClick={handleOpen}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={3}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <VisibilityIcon sx={{ fontSize: 24, color: 'rgba(255, 255, 255, 0.8)' }} />
            </Box>
            <Box flex={1}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  mb: 0.5,
                }}
              >
                {countLoading ? (
                  <CircularProgress size={16} sx={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                ) : visitorCount === 0 ? (
                  'No profile visitors'
                ) : (
                  `${visitorCount} profile view${visitorCount !== 1 ? 's' : ''}`
                )}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.875rem',
                }}
              >
                in the last {timeWindow}
              </Typography>
            </Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              {!isPremium && (
                <LockIcon sx={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.4)' }} />
              )}
              <ArrowForwardIcon sx={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.6)' }} />
            </Stack>
          </Stack>
          
          {!isPremium && (
            <Box
              sx={{
                mt: 2,
                pt: 2,
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '0.75rem',
                }}
              >
                Upgrade to see who viewed your profile
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Visitors Modal */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="profile-visitors-modal"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '95%', sm: 500 },
            maxHeight: '85vh',
            overflow: 'hidden',
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 3,
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'white',
                fontWeight: 600,
                fontSize: '1.125rem',
              }}
            >
              Profile Visitors
            </Typography>
            <IconButton 
              onClick={handleClose}
              sx={{ 
                color: 'rgba(255, 255, 255, 0.6)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Time Window Selector */}
          <Box sx={{ p: 3, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <Stack direction="row" spacing={1}>
              <Button
                variant={timeWindow === 'week' ? 'contained' : 'text'}
                size="small"
                onClick={() => setTimeWindow('week')}
                sx={{
                  backgroundColor: timeWindow === 'week' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  },
                }}
              >
                This Week
              </Button>
              <Button
                variant={timeWindow === 'month' ? 'contained' : 'text'}
                size="small"
                onClick={() => setTimeWindow('month')}
                sx={{
                  backgroundColor: timeWindow === 'month' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  },
                }}
              >
                This Month
              </Button>
            </Stack>
            {visitsData && (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.6)', 
                  mt: 2,
                  fontSize: '0.875rem',
                }}
              >
                {visitsData.visibleCount} of {visitsData.count} visitors
              </Typography>
            )}
          </Box>

          {/* Visitors List */}
          <Box sx={{ 
            maxHeight: '60vh', 
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(255, 255, 255, 0.05)',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '3px',
            },
          }}>
            {visitsLoading ? (
              <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress sx={{ color: 'rgba(255, 255, 255, 0.6)' }} />
              </Box>
            ) : !isPremium ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <LockIcon sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'white', 
                    mb: 1,
                    fontWeight: 500,
                  }}
                >
                  Premium Feature
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.6)',
                    mb: 3,
                  }}
                >
                  Upgrade to see who visited your profile
                </Typography>
                <Button 
                  variant="contained"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    },
                  }}
                >
                  Upgrade Now
                </Button>
              </Box>
            ) : visitsData?.visitors && visitsData.visitors.length > 0 ? (
              <Box sx={{ p: 3 }}>
                <Stack spacing={2}>
                  {visitsData.visitors.map((visitor, index) => {
                    const visit = visitsData.recentVisits?.[index];
                    return (
                      <Box
                        key={visitor.id}
                        sx={{
                          p: 2.5,
                          borderRadius: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                          },
                        }}
                      >
                        <Stack direction="row" spacing={3} alignItems="center">
                          <UserAvatar 
                            user={visitor} 
                            size={44}
                            showOnlineStatus={false}
                          />
                          <Box flex={1}>
                            <Typography 
                              variant="subtitle1" 
                              sx={{ 
                                color: 'white',
                                fontWeight: 500,
                                fontSize: '0.95rem',
                                mb: 0.5,
                              }}
                            >
                              {visitor.name}
                              {visitor.username && (
                                <Typography 
                                  component="span" 
                                  sx={{ 
                                    color: 'rgba(255, 255, 255, 0.5)',
                                    fontSize: '0.85rem',
                                    ml: 1,
                                    fontWeight: 400,
                                  }}
                                >
                                  @{visitor.username}
                                </Typography>
                              )}
                            </Typography>
                            {(visitor.city || visitor.country) && (
                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                <LocationIcon sx={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.4)' }} />
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    color: 'rgba(255, 255, 255, 0.5)',
                                    fontSize: '0.8rem',
                                  }}
                                >
                                  {[visitor.city, visitor.country].filter(Boolean).join(', ')}
                                </Typography>
                              </Stack>
                            )}
                          </Box>
                          {visit && (
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: 'rgba(255, 255, 255, 0.4)',
                                fontSize: '0.75rem',
                              }}
                            >
                              {formatDistanceToNow(new Date(visit.viewedAt), { addSuffix: true })}
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            ) : (
              <Box sx={{ p: 6, textAlign: 'center' }}>
                <VisibilityIcon sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.95rem',
                  }}
                >
                  No visitors in the selected time period
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default ProfileVisitors;