import { Typography, Box, IconButton, Chip, Avatar, Button } from '@mui/material'
import { cookies } from 'next/headers'
import CollapsibleFilters from './CollapsibleFilters'
import SwipeCard from './SwipeCard'
import { 
  Close as CloseIcon,
  Favorite as HeartIcon,
  Star as StarIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'

async function searchUsers(searchParams: { [key: string]: string | string[] | undefined }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  
  if (!token) {
    throw new Error('No authentication token')
  }
  
  // Build query string from search params
  const queryParams = new URLSearchParams()
  if (searchParams.native && typeof searchParams.native === 'string') {
    queryParams.append('native', searchParams.native)
  }
  if (searchParams.target && typeof searchParams.target === 'string') {
    queryParams.append('target', searchParams.target)
  }
  if (searchParams.location && typeof searchParams.location === 'string') {
    queryParams.append('location', searchParams.location)
  }
  if (searchParams.useLocation === 'true' && searchParams.maxDistance && typeof searchParams.maxDistance === 'string') {
    queryParams.append('useLocation', 'true')
    queryParams.append('maxDistance', searchParams.maxDistance)
  }
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store'
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch users')
  }
  
  const data = await response.json()
  return data.data || data.users || []
}

// Helper function to calculate distance between two points (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Helper function to calculate match percentage based on language compatibility
function calculateMatchPercentage(user: any, currentUser: any): number {
  if (!currentUser?.nativeLanguages || !currentUser?.targetLanguages) return 0
  
  let score = 0
  const maxScore = 100
  
  // Language compatibility (60% of score)
  const hasLanguageMatch = user.nativeLanguages?.some((lang: string) => 
    currentUser.targetLanguages.includes(lang)
  ) && user.targetLanguages?.some((lang: string) => 
    currentUser.nativeLanguages.includes(lang)
  )
  
  if (hasLanguageMatch) score += 60
  
  // Location proximity (20% of score)
  if (user.city === currentUser.city) score += 20
  else if (user.country === currentUser.country) score += 10
  
  // Interest overlap (20% of score) 
  if (user.interests && currentUser.interests) {
    const commonInterests = user.interests.filter((interest: string) =>
      currentUser.interests.includes(interest)
    )
    score += Math.min(20, (commonInterests.length / Math.max(user.interests.length, currentUser.interests.length)) * 20)
  }
  
  return Math.round(score)
}

// Filter users by location
function filterUsersByLocation(users: any[], currentUser: any, searchParams: any): any[] {
  let filteredUsers = [...users]
  
  // Filter by location text (city or country)
  if (searchParams.location) {
    const locationQuery = searchParams.location.toLowerCase()
    filteredUsers = filteredUsers.filter(user => 
      user.city?.toLowerCase().includes(locationQuery) ||
      user.country?.toLowerCase().includes(locationQuery)
    )
  }
  
  // Filter by distance if user coordinates are available
  if (searchParams.useLocation === 'true' && currentUser?.latitude && currentUser?.longitude && searchParams.maxDistance) {
    const maxDistance = parseInt(searchParams.maxDistance)
    filteredUsers = filteredUsers.filter(user => {
      if (!user.latitude || !user.longitude) return false
      
      const distance = calculateDistance(
        currentUser.latitude,
        currentUser.longitude,
        user.latitude,
        user.longitude
      )
      
      // Add distance to user object for display
      user.distance = Math.round(distance)
      
      return distance <= maxDistance
    })
  }
  
  return filteredUsers
}

async function getCurrentUser(token: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.data || data.user
    }
  } catch (error) {
    console.error('Failed to fetch current user:', error)
  }
  return null
}

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams
  let users: any[] = []
  let currentUser = null
  let error = null
  
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    
    if (!token) {
      throw new Error('No authentication token')
    }
    
    // Fetch current user and search results in parallel
    const [currentUserResult, usersResult] = await Promise.all([
      getCurrentUser(token),
      searchUsers(resolvedSearchParams)
    ])
    
    currentUser = currentUserResult
    users = usersResult || []
    
    // Apply location-based filtering
    users = filterUsersByLocation(users, currentUser, resolvedSearchParams)
    
    // Add match percentage to each user
    users = users.map(user => ({
      ...user,
      matchPercentage: calculateMatchPercentage(user, currentUser),
      location: user.city && user.country ? `${user.city}, ${user.country}` : 'Location not set'
    }))
    
    // Sort by match percentage, then by distance if available
    users.sort((a, b) => {
      const matchDiff = b.matchPercentage - a.matchPercentage
      if (matchDiff !== 0) return matchDiff
      
      // If match percentages are equal, sort by distance (closer first)
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance
      }
      
      return 0
    })
    
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load users'
  }
  
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Collapsible Filters */}
      <CollapsibleFilters />

      {/* Main Content Area */}
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        gap: { xs: 2, lg: 3 },
        minHeight: 0,
        px: { xs: 1, lg: 0 }
      }}>
        {/* Swipe Cards Area */}
        <Box sx={{
          position: 'relative',
          height: { xs: '70vh', lg: '100%' },
          backgroundColor: 'rgba(20, 20, 20, 0.6)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 1.5,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          flex: { xs: 'none', lg: 2 }
        }}>
          {error ? (
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center'
            }}>
              <Typography sx={{ color: '#ef4444', fontWeight: 500, mb: 2 }}>
                ⚠️ {error}
              </Typography>
            </Box>
          ) : users.length > 0 ? (
            <Box sx={{ flex: 1, position: 'relative' }}>
              <SwipeCard users={users} />
            </Box>
          ) : (
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center'
            }}>
              <Typography sx={{ fontSize: '3rem', mb: 2 }}>🎉</Typography>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 600, color: 'white', mb: 1 }}>
                No more partners to show
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)', mb: 3 }}>
                Check back later or adjust your filters
              </Typography>
              <Button
                startIcon={<RefreshIcon />}
                sx={{
                  backgroundColor: 'rgba(99, 102, 241, 0.2)',
                  color: 'white',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(99, 102, 241, 0.3)',
                  }
                }}
              >
                Refresh
              </Button>
            </Box>
          )}

          {/* Action Buttons */}
          {users.length > 0 && (
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 1.5,
              pt: 1.5,
              pb: 1,
              mt: 'auto',
              zIndex: 10
            }}>
              <IconButton
                sx={{
                  width: 48,
                  height: 48,
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#ef4444',
                  '&:hover': {
                    backgroundColor: 'rgba(239, 68, 68, 0.3)',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <CloseIcon sx={{ fontSize: 24 }} />
              </IconButton>
              
              <IconButton
                sx={{
                  width: 48,
                  height: 48,
                  backgroundColor: 'rgba(251, 191, 36, 0.2)',
                  border: '1px solid rgba(251, 191, 36, 0.4)',
                  color: '#fbbf24',
                  '&:hover': {
                    backgroundColor: 'rgba(251, 191, 36, 0.3)',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <StarIcon sx={{ fontSize: 24 }} />
              </IconButton>
              
              <IconButton
                sx={{
                  width: 48,
                  height: 48,
                  backgroundColor: 'rgba(34, 197, 94, 0.2)',
                  border: '1px solid rgba(34, 197, 94, 0.4)',
                  color: '#22c55e',
                  '&:hover': {
                    backgroundColor: 'rgba(34, 197, 94, 0.3)',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <HeartIcon sx={{ fontSize: 24 }} />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* Desktop Sidebar */}
        <Box sx={{ 
          display: { xs: 'none', lg: 'flex' },
          flexDirection: 'column',
          gap: 3,
          height: '100%',
          overflow: 'auto',
          pr: 1,
          pb: 4,
          flex: 1
        }}>
          {/* Quick Actions */}
          <Box sx={{
            backgroundColor: 'rgba(20, 20, 20, 0.6)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 1.5,
            p: 3
          }}>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'white', mb: 2 }}>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                fullWidth
                size="small"
                sx={{
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  py: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                View Matches
              </Button>
              <Button
                fullWidth
                size="small"
                sx={{
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  py: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                Messages
              </Button>
            </Box>
          </Box>

          {/* Tips */}
          <Box sx={{
            backgroundColor: 'rgba(20, 20, 20, 0.6)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 1.5,
            p: 3
          }}>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'white', mb: 2 }}>
              💡 Tips
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                ❌ Pass on profiles that don't interest you
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                ⭐ Super like for priority matching
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                ❤️ Like to start a conversation
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}