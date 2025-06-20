'use client'

import { Typography, Box, Avatar, Chip, IconButton, LinearProgress, Button, keyframes } from '@mui/material'
import Link from 'next/link'
import { 
  ChatBubbleOutline as ChatIcon,
  PeopleOutline as PeopleIcon,
  FavoriteBorder as HeartIcon,
  MailOutline as MailIcon,
  TrendingUp as TrendingIcon,
  Language as LanguageIcon,
  Star as StarIcon,
  NavigateNext as NextIcon,
  Schedule as ClockIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  EmojiEvents as TrophyIcon,
  School as SchoolIcon,
  Notifications as NotificationIcon
} from '@mui/icons-material'

// Animation keyframes - Same as messages page
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

function getProfileCompletion(user: any) {
  if (!user) return 0
  
  let completed = 0
  let total = 6
  
  if (user.name) completed++
  if (user.email) completed++
  if (user.nativeLanguages?.length > 0) completed++
  if (user.targetLanguages?.length > 0) completed++
  if (user.bio) completed++
  if (user.city && user.country) completed++
  
  return Math.round((completed / total) * 100)
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${diffInHours}h ago`
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`
  return date.toLocaleDateString()
}

interface DashboardClientProps {
  data: {
    user: any
    matches: any[]
    conversations: any[]
    incomingRequests: any[]
    outgoingRequests: any[]
    suggestedUsers: any[]
  }
}

export default function DashboardClient({ data }: DashboardClientProps) {
  const profileCompletion = getProfileCompletion(data.user)
  
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      px: { xs: 1, sm: 0 },
      position: 'relative',
      animation: `${fadeInUp} 0.6s ease-out`,
      '&::before': {
        content: '""',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(ellipse at top, rgba(99, 102, 241, 0.1) 0%, #000000 50%)',
        zIndex: -1,
      }
    }}>
      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: { xs: 1.5, sm: 2 }, mb: { xs: 2, sm: 3 } }}>
        <Box sx={{
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(10px)',
          border: '1px solid #374151',
          borderRadius: 1,
          p: { xs: 1.5, sm: 2 },
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            borderColor: '#6366f1',
            background: 'rgba(0, 0, 0, 0.6)',
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                Active Matches
              </Typography>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 300, color: 'white' }}>
                {data.matches.length}
              </Typography>
            </Box>
            <Box sx={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #22c55e, #22c55e88)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <HeartIcon sx={{ fontSize: 20, color: 'white' }} />
            </Box>
          </Box>
        </Box>

        <Box sx={{
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(10px)',
          border: '1px solid #374151',
          borderRadius: 1,
          p: { xs: 1.5, sm: 2 },
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            borderColor: '#6366f1',
            background: 'rgba(0, 0, 0, 0.6)',
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                Conversations
              </Typography>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 300, color: 'white' }}>
                {data.conversations.length}
              </Typography>
            </Box>
            <Box sx={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #3b82f6, #3b82f688)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ChatIcon sx={{ fontSize: 20, color: 'white' }} />
            </Box>
          </Box>
        </Box>

        <Box sx={{
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(10px)',
          border: '1px solid #374151',
          borderRadius: 1,
          p: { xs: 1.5, sm: 2 },
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            borderColor: '#6366f1',
            background: 'rgba(0, 0, 0, 0.6)',
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                Learning Languages
              </Typography>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 300, color: 'white' }}>
                {data.user?.targetLanguages?.length || 0}
              </Typography>
            </Box>
            <Box sx={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #fbbf24, #fbbf2488)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <LanguageIcon sx={{ fontSize: 20, color: 'white' }} />
            </Box>
          </Box>
        </Box>

        <Box sx={{
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(10px)',
          border: '1px solid #374151',
          borderRadius: 1,
          p: { xs: 1.5, sm: 2 },
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            borderColor: '#6366f1',
            background: 'rgba(0, 0, 0, 0.6)',
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                Profile Score
              </Typography>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 300, color: 'white' }}>
                {profileCompletion}%
              </Typography>
            </Box>
            <Box sx={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #a855f7, #a855f788)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrophyIcon sx={{ fontSize: 20, color: 'white' }} />
            </Box>
          </Box>
        </Box>
      </Box>

      <Box sx={{ 
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        gap: { xs: 2, sm: 3 }
      }}>
        {/* Main Dashboard Section */}
        <Box sx={{
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(10px)',
          border: '1px solid #374151',
          borderRadius: 1,
          p: { xs: 1.5, sm: 3 },
          flex: { xs: 'none', lg: 2 },
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            borderColor: '#6366f1',
            background: 'rgba(0, 0, 0, 0.6)',
          }
        }}>
          {/* Profile Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography sx={{ fontSize: '1rem', fontWeight: 300, color: 'white' }}>
              Dashboard Overview
            </Typography>
            <IconButton sx={{ color: '#9ca3af' }}>
              <EditIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          {/* Profile Avatar and Welcome */}
          <Box sx={{ display: 'flex', alignItems: { xs: 'center', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 3 }, mb: { xs: 3, sm: 4 } }}>
            <Box sx={{ position: 'relative', alignSelf: { xs: 'center', sm: 'auto' } }}>
              <Avatar
                src={data.user?.profileImage}
                sx={{
                  width: { xs: 60, sm: 80 },
                  height: { xs: 60, sm: 80 },
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                  fontWeight: 300,
                  mx: { xs: 'auto', sm: 0 }
                }}
              >
                {data.user?.name?.charAt(0) || 'U'}
              </Avatar>
              <Box sx={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 20,
                height: 20,
                backgroundColor: '#22c55e',
                borderRadius: '50%',
                border: '2px solid rgba(0, 0, 0, 0.8)',
              }} />
            </Box>
            <Box sx={{ textAlign: { xs: 'center', sm: 'left' }, width: { xs: '100%', sm: 'auto' }, display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', sm: 'flex-start' } }}>
              <Typography sx={{ fontSize: { xs: '1.125rem', sm: '1.5rem' }, fontWeight: 300, color: 'white', mb: 0.5 }}>
                Welcome back{data.user?.name ? `, ${data.user.name.split(' ')[0]}` : ''}! 👋
              </Typography>
              <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, color: '#9ca3af', mb: 1 }}>
                Here's your language exchange overview
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-start' }, gap: 1 }}>
                <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                  Profile {profileCompletion}% complete
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Quick Actions */}
          <Box sx={{ mb: 4 }}>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 300, color: 'white', mb: 2 }}>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
              <Link href="/protected/search" style={{ textDecoration: 'none' }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PeopleIcon />}
                  sx={{
                    color: 'white',
                    borderColor: '#374151',
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'rgba(255, 255, 255, 0.5)'
                    }
                  }}
                >
                  Discover Partners
                </Button>
              </Link>
              <Link href="/protected/conversations" style={{ textDecoration: 'none' }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ChatIcon />}
                  sx={{
                    color: 'white',
                    borderColor: '#374151',
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'rgba(255, 255, 255, 0.5)'
                    }
                  }}
                >
                  Messages
                </Button>
              </Link>
              <Link href="/protected/matches" style={{ textDecoration: 'none' }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<HeartIcon />}
                  sx={{
                    color: 'white',
                    borderColor: '#374151',
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'rgba(255, 255, 255, 0.5)'
                    }
                  }}
                >
                  My Matches
                </Button>
              </Link>
              <Link href="/protected/requests/incoming" style={{ textDecoration: 'none' }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<MailIcon />}
                  sx={{
                    color: 'white',
                    borderColor: '#374151',
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'rgba(255, 255, 255, 0.5)'
                    }
                  }}
                >
                  Requests ({data.incomingRequests.length})
                </Button>
              </Link>
            </Box>
          </Box>

          {/* Profile Completion */}
          {profileCompletion < 100 && (
            <Box sx={{ mb: 4 }}>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 300, color: 'white', mb: 2 }}>
                Complete Your Profile
              </Typography>
              <Box sx={{ 
                p: 2, 
                borderRadius: 1,
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}>
                <Typography variant="body2" sx={{ color: '#9ca3af', mb: 2 }}>
                  A complete profile gets 3x more matches
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={profileCompletion} 
                  sx={{ 
                    mb: 2,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#ef4444',
                      borderRadius: 4
                    }
                  }} 
                />
                <Link href="/protected/profile" style={{ textDecoration: 'none' }}>
                  <Button 
                    variant="outlined" 
                    size="small"
                    sx={{ 
                      color: '#ef4444', 
                      borderColor: '#ef4444',
                      '&:hover': {
                        backgroundColor: 'rgba(239, 68, 68, 0.1)'
                      }
                    }}
                  >
                    Complete Profile
                  </Button>
                </Link>
              </Box>
            </Box>
          )}

          {/* Additional Info */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MailIcon sx={{ fontSize: 16, color: '#9ca3af' }} />
              <Typography sx={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                {data.user?.email || 'Not provided'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationIcon sx={{ fontSize: 16, color: '#9ca3af' }} />
              <Typography sx={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                {data.user?.city && data.user?.country ? `${data.user.city}, ${data.user.country}` : 'Location not set'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarIcon sx={{ fontSize: 16, color: '#9ca3af' }} />
              <Typography sx={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                Joined {data.user?.createdAt ? formatTimeAgo(data.user.createdAt) : 'Recently'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SchoolIcon sx={{ fontSize: 16, color: '#9ca3af' }} />
              <Typography sx={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                {data.user?.onboardingStep >= 5 ? 'Ready to learn' : 'Setting up profile'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Sidebar */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: { xs: 2, sm: 3 },
          flex: { xs: 'none', lg: 1 }
        }}>
          {/* Language Learning Goals */}
          {data.user?.targetLanguages?.length > 0 && (
            <Box sx={{
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(10px)',
              border: '1px solid #374151',
              borderRadius: 1,
              p: { xs: 1.5, sm: 3 },
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                borderColor: '#6366f1',
                background: 'rgba(0, 0, 0, 0.6)',
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LanguageIcon sx={{ color: '#764ba2', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 300, fontSize: '0.875rem' }}>
                  Learning Journey
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {data.user.targetLanguages.slice(0, 3).map((language: string) => (
                  <Box key={language} sx={{ 
                    p: 2, 
                    borderRadius: 1,
                    backgroundColor: 'rgba(118, 75, 162, 0.1)',
                    border: '1px solid rgba(118, 75, 162, 0.2)'
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 300, mb: 1 }}>
                      {language}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.floor(Math.random() * 40) + 30} // Mock progress
                      sx={{ 
                        height: 6,
                        borderRadius: 1,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#764ba2',
                          borderRadius: 1
                        }
                      }} 
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Recent Conversations */}
          <Box sx={{ 
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            border: '1px solid #374151',
            borderRadius: 1,
            p: { xs: 1.5, sm: 3 },
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              borderColor: '#6366f1',
              background: 'rgba(0, 0, 0, 0.6)',
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 300, color: 'white' }}>
                Recent Conversations
              </Typography>
              <Link href="/protected/conversations" style={{ textDecoration: 'none' }}>
                <IconButton size="small" sx={{ color: '#9ca3af' }}>
                  <NextIcon />
                </IconButton>
              </Link>
            </Box>
            
            {data.conversations.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {data.conversations.slice(0, 3).map((conversation: any, index: number) => (
                  <Link 
                    key={conversation.id || index} 
                    href={`/protected/conversations/${conversation.id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      p: 2, 
                      borderRadius: 1,
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                      },
                      transition: 'all 0.2s ease'
                    }}>
                      <Avatar sx={{ width: 32, height: 32, mr: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        {conversation.otherUser?.name?.charAt(0) || '?'}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 300, color: 'white', fontSize: '0.75rem' }}>
                          {conversation.otherUser?.name || 'Unknown User'}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: '#9ca3af',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'block',
                            fontSize: '0.7rem'
                          }}
                        >
                          {conversation.lastMessage?.content || 'No messages yet'}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: '0.7rem' }}>
                        {conversation.lastMessage?.createdAt ? formatTimeAgo(conversation.lastMessage.createdAt) : 'New'}
                      </Typography>
                    </Box>
                  </Link>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <ChatIcon sx={{ fontSize: 32, color: 'rgba(255, 255, 255, 0.3)', mb: 1 }} />
                <Typography variant="body2" sx={{ color: '#9ca3af', mb: 1, fontSize: '0.75rem' }}>
                  No conversations yet
                </Typography>
                <Link href="/protected/search" style={{ textDecoration: 'none' }}>
                  <Button size="small" variant="outlined" sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.3)', fontSize: '0.7rem' }}>
                    Start Discovering
                  </Button>
                </Link>
              </Box>
            )}
          </Box>

          {/* Match Suggestions */}
          <Box sx={{
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            border: '1px solid #374151',
            borderRadius: 1,
            p: { xs: 1.5, sm: 3 },
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              borderColor: '#6366f1',
              background: 'rgba(0, 0, 0, 0.6)',
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 300, color: 'white' }}>
                Suggested Partners
              </Typography>
              <Link href="/protected/search" style={{ textDecoration: 'none' }}>
                <IconButton size="small" sx={{ color: '#9ca3af' }}>
                  <NextIcon />
                </IconButton>
              </Link>
            </Box>
            
            {data.suggestedUsers.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {data.suggestedUsers.slice(0, 3).map((user: any, index: number) => (
                  <Box 
                    key={user.id || index}
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      p: 2, 
                      borderRadius: 1,
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Avatar sx={{ width: 32, height: 32, mr: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                      {user.name?.charAt(0) || '?'}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 300, color: 'white', fontSize: '0.75rem' }}>
                        {user.name || 'Anonymous User'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        {user.nativeLanguages?.slice(0, 2).map((lang: string) => (
                          <Chip 
                            key={lang}
                            label={lang} 
                            size="small" 
                            sx={{ 
                              fontSize: '0.6rem', 
                              height: 16,
                              backgroundColor: 'rgba(102, 126, 234, 0.2)',
                              color: '#667eea'
                            }} 
                          />
                        ))}
                      </Box>
                    </Box>
                    {user.city && (
                      <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: '0.7rem' }}>
                        {user.city}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <PeopleIcon sx={{ fontSize: 32, color: 'rgba(255, 255, 255, 0.3)', mb: 1 }} />
                <Typography variant="body2" sx={{ color: '#9ca3af', mb: 1, fontSize: '0.75rem' }}>
                  No suggestions available
                </Typography>
                <Link href="/protected/search" style={{ textDecoration: 'none' }}>
                  <Button size="small" variant="outlined" sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.3)', fontSize: '0.7rem' }}>
                    Explore Partners
                  </Button>
                </Link>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}