import { Typography, Box, Card, IconButton, Chip, Avatar, Button } from '@mui/material'
import { getCurrentUser } from '@/features/auth/authSlice'
import { cookies } from 'next/headers'
import ProfileInfo from './ProfileInfo'
import LanguageForm from './LanguageForm'
import ImageUpload from './ImageUpload'
import { 
  Edit as EditIcon,
  Language as LanguageIcon,
  Person as PersonIcon,
  Mail as MailIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as TrophyIcon,
  School as SchoolIcon,
  Star as StarIcon
} from '@mui/icons-material'

async function getProfile() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  
  if (!token) {
    throw new Error('No authentication token')
  }
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store'
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch profile')
  }
  
  const data = await response.json()
  return data.data || data.user
}

async function getUserStats(token: string) {
  try {
    const matchesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })
    
    const matches = matchesResponse.ok ? await matchesResponse.json() : { data: [] }
    
    return {
      activeMatches: matches.data?.length || 0,
    }
  } catch (error) {
    console.error('Failed to fetch user stats:', error)
    return {
      activeMatches: 0,
    }
  }
}

function calculateProfileCompletion(user: any): number {
  const fields = [
    user?.name,
    user?.email,
    user?.nativeLanguages?.length > 0,
    user?.targetLanguages?.length > 0,
    user?.city,
    user?.country,
    user?.bio,
    user?.interests?.length > 0,
  ]
  
  const completedFields = fields.filter(field => Boolean(field)).length
  return Math.round((completedFields / fields.length) * 100)
}

function formatJoinDate(createdAt: string): string {
  try {
    const date = new Date(createdAt)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  } catch {
    return 'Recently'
  }
}

export default async function ProfilePage() {
  let user = null
  let stats = null
  let error = null
  
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    
    if (!token) {
      throw new Error('No authentication token')
    }
    
    user = await getProfile()
    stats = await getUserStats(token)
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load profile'
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'white', fontWeight: 500 }}>
          My Profile
        </Typography>
        <Typography sx={{ color: '#ef4444' }}>{error}</Typography>
      </Box>
    )
  }
  
  return (
    <Box sx={{ minHeight: '100vh', px: { xs: 1, sm: 0 } }}>
      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: { xs: 1.5, sm: 2 }, mb: { xs: 2, sm: 3 } }}>
        <Box sx={{
          backgroundColor: 'rgba(20, 20, 20, 0.6)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 1.5,
          p: { xs: 1.5, sm: 2 }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                Active Matches
              </Typography>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 600, color: 'white' }}>
                {stats?.activeMatches || 0}
              </Typography>
            </Box>
            <Box sx={{
              width: 40,
              height: 40,
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <PersonIcon sx={{ fontSize: 20, color: '#6366f1' }} />
            </Box>
          </Box>
        </Box>

        <Box sx={{
          backgroundColor: 'rgba(20, 20, 20, 0.6)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 1.5,
          p: { xs: 1.5, sm: 2 }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                Languages Learning
              </Typography>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 600, color: 'white' }}>
                {user?.targetLanguages?.length || 0}
              </Typography>
            </Box>
            <Box sx={{
              width: 40,
              height: 40,
              backgroundColor: 'rgba(6, 182, 212, 0.2)',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <LanguageIcon sx={{ fontSize: 20, color: '#06b6d4' }} />
            </Box>
          </Box>
        </Box>

        <Box sx={{
          backgroundColor: 'rgba(20, 20, 20, 0.6)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 1.5,
          p: { xs: 1.5, sm: 2 }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                Profile Status
              </Typography>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 600, color: 'white' }}>
                {user?.onboardingStep >= 5 ? 'Complete' : 'Incomplete'}
              </Typography>
            </Box>
            <Box sx={{
              width: 40,
              height: 40,
              backgroundColor: 'rgba(34, 197, 94, 0.2)',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUpIcon sx={{ fontSize: 20, color: '#22c55e' }} />
            </Box>
          </Box>
        </Box>

        <Box sx={{
          backgroundColor: 'rgba(20, 20, 20, 0.6)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 1.5,
          p: { xs: 1.5, sm: 2 }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                Profile Score
              </Typography>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 600, color: 'white' }}>
                {calculateProfileCompletion(user)}%
              </Typography>
            </Box>
            <Box sx={{
              width: 40,
              height: 40,
              backgroundColor: 'rgba(168, 85, 247, 0.2)',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrophyIcon sx={{ fontSize: 20, color: '#a855f7' }} />
            </Box>
          </Box>
        </Box>
      </Box>

      <Box sx={{ 
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        gap: { xs: 2, sm: 3 }
      }}>
        {/* Main Profile Section */}
        <Box sx={{
          backgroundColor: 'rgba(20, 20, 20, 0.6)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 1.5,
          p: { xs: 1.5, sm: 3 },
          flex: { xs: 'none', lg: 2 }
        }}>
          {/* Profile Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography sx={{ fontSize: '1rem', fontWeight: 500, color: 'white' }}>
              Profile Information
            </Typography>
            <IconButton sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              <EditIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          {/* Profile Avatar and Info */}
          <Box sx={{ display: 'flex', alignItems: { xs: 'center', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 3 }, mb: { xs: 3, sm: 4 } }}>
            <Box sx={{ position: 'relative', alignSelf: { xs: 'center', sm: 'auto' } }}>
              <Avatar
                src={user?.profileImage}
                sx={{
                  width: { xs: 60, sm: 80 },
                  height: { xs: 60, sm: 80 },
                  backgroundColor: '#6366f1',
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                  fontWeight: 600,
                  mx: { xs: 'auto', sm: 0 }
                }}
              >
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: -4,
                  right: -4,
                  width: 24,
                  height: 24,
                  backgroundColor: 'rgba(99, 102, 241, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  '&:hover': {
                    backgroundColor: 'rgba(99, 102, 241, 0.3)',
                  }
                }}
              >
                <EditIcon sx={{ fontSize: 12, color: 'white' }} />
              </IconButton>
            </Box>
            <Box sx={{ textAlign: { xs: 'center', sm: 'left' }, width: { xs: '100%', sm: 'auto' }, display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', sm: 'flex-start' } }}>
              <Typography sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, fontWeight: 600, color: 'white', mb: 0.5 }}>
                {user?.name || 'Your Name'}
              </Typography>
              <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'rgba(255, 255, 255, 0.6)', mb: 1 }}>
                {user?.bio ? user.bio.slice(0, 60) + (user.bio.length > 60 ? '...' : '') : 'Language Exchange Enthusiast'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-start' }, gap: 1 }}>
                <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Profile {calculateProfileCompletion(user)}% complete
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Language Preferences */}
          <Box sx={{ mb: 4 }}>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'white', mb: 2 }}>
              Language Preferences
            </Typography>
            <LanguageForm 
              initialNative={user?.nativeLanguages || []}
              initialTarget={user?.targetLanguages || []}
            />
          </Box>

          {/* Additional Info */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MailIcon sx={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.6)' }} />
              <Typography sx={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                {user?.email || 'Not provided'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationIcon sx={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.6)' }} />
              <Typography sx={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                {user?.city && user?.country ? `${user.city}, ${user.country}` : 'Location not set'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarIcon sx={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.6)' }} />
              <Typography sx={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                Joined {formatJoinDate(user?.createdAt)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SchoolIcon sx={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.6)' }} />
              <Typography sx={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                {user?.onboardingStep >= 5 ? 'Ready to learn' : 'Setting up profile'}
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
          {/* User Interests */}
          {user?.interests && user.interests.length > 0 && (
            <Box sx={{
              backgroundColor: 'rgba(20, 20, 20, 0.6)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 1.5,
              p: { xs: 1.5, sm: 3 }
            }}>
              <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 500, color: 'white', mb: { xs: 1.5, sm: 2 } }}>
                My Interests
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {user.interests.slice(0, 8).map((interest: string) => (
                  <Chip
                    key={interest}
                    label={interest}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(99, 102, 241, 0.2)',
                      color: 'white',
                      fontSize: '0.75rem',
                      '& .MuiChip-label': {
                        padding: '0 8px',
                      },
                    }}
                  />
                ))}
                {user.interests.length > 8 && (
                  <Chip
                    label={`+${user.interests.length - 8} more`}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '0.75rem',
                    }}
                  />
                )}
              </Box>
            </Box>
          )}

          {/* Profile Bio */}
          {user?.bio && (
            <Box sx={{
              backgroundColor: 'rgba(20, 20, 20, 0.6)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 1.5,
              p: { xs: 1.5, sm: 3 }
            }}>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'white', mb: 2 }}>
                About Me
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.5 }}>
                {user.bio}
              </Typography>
            </Box>
          )}

          {/* Quick Actions */}
          <Box sx={{
            backgroundColor: 'rgba(20, 20, 20, 0.6)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 1.5,
            p: { xs: 1.5, sm: 3 }
          }}>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'white', mb: 2 }}>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  py: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.25)',
                  }
                }}
              >
                Edit Profile
              </Button>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  py: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.25)',
                  }
                }}
              >
                Find Partners
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}