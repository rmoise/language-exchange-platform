'use client'

import { Typography, Box, Chip, Divider, Avatar } from '@mui/material'
import { 
  Person, 
  Email, 
  Schedule, 
  Language, 
  School, 
  Info,
  LocationOn,
  Work,
  Cake
} from '@mui/icons-material'

interface User {
  id: string
  name: string
  email: string
  nativeLanguages: string[]
  targetLanguages: string[]
  createdAt: string
}

interface ProfileInfoProps {
  user: User | null
}

export default function ProfileInfo({ user }: ProfileInfoProps) {
  if (!user) {
    return <Typography>Loading profile...</Typography>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Box>
      {/* About Section Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Info sx={{ mr: 1.5, color: 'primary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          About
        </Typography>
      </Box>
      
      {/* Contact Information */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
          <Email sx={{ mr: 2, color: 'text.secondary', fontSize: 20 }} />
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {user.email}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Email address
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
          <Cake sx={{ mr: 2, color: 'text.secondary', fontSize: 20 }} />
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Joined {formatDate(user.createdAt)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Member since
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Languages Section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Language sx={{ mr: 1.5, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Languages
          </Typography>
        </Box>
        
        {/* Native Languages */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                mr: 1.5,
              }}
            />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Native Languages
            </Typography>
          </Box>
          <Box sx={{ ml: 3.5 }}>
            {user.nativeLanguages?.length > 0 ? (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {user.nativeLanguages.map((lang, index) => (
                  <Chip 
                    key={index} 
                    label={lang} 
                    size="small"
                    sx={{
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      }
                    }}
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No native languages set
              </Typography>
            )}
          </Box>
        </Box>

        {/* Target Languages */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: 'secondary.main',
                mr: 1.5,
              }}
            />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Learning Languages
            </Typography>
          </Box>
          <Box sx={{ ml: 3.5 }}>
            {user.targetLanguages?.length > 0 ? (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {user.targetLanguages.map((lang, index) => (
                  <Chip 
                    key={index} 
                    label={lang} 
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: 'secondary.main',
                      color: 'secondary.main',
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: 'secondary.main',
                        color: 'secondary.contrastText',
                      }
                    }}
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No target languages set
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Quick Stats */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Work sx={{ mr: 1.5, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Quick Stats
          </Typography>
        </Box>
        
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: 2,
          mt: 2 
        }}>
          <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'action.hover', borderRadius: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {user.nativeLanguages?.length || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Native Languages
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'action.hover', borderRadius: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'secondary.main' }}>
              {user.targetLanguages?.length || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Learning Languages
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}