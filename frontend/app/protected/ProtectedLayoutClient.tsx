'use client'

import { 
  Box, 
  IconButton,
  useMediaQuery,
  useTheme,
  Avatar,
  Typography,
  BottomNavigation,
  BottomNavigationAction,
  Badge,
  Paper,
} from '@mui/material'
import { 
  Menu as MenuIcon,
  SearchOutlined as SearchIcon,
  PeopleOutlined as PeopleIcon,
  ChatBubbleOutlineOutlined as ChatIcon,
  PersonOutlined as PersonIcon,
  Language as LanguageIcon,
  NotificationsOutlined as NotificationsIcon,
  HelpOutlined as HelpIcon,
  FavoriteBorderOutlined as FavoriteIcon,
  MailOutlineOutlined as MailIcon,
  DashboardOutlined as DashboardIcon,
} from '@mui/icons-material'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAppSelector } from '@/lib/hooks'
import UserAvatar from '@/components/ui/UserAvatar'

const DRAWER_WIDTH = 256
const COLLAPSED_WIDTH = 72

const navigationItems = [
  { text: 'Dashboard', href: '/protected/dashboard', icon: DashboardIcon },
  { text: 'Search Partners', href: '/protected/search', icon: SearchIcon },
  { text: 'Messages', href: '/protected/conversations', icon: ChatIcon },
  { text: 'My Matches', href: '/protected/matches', icon: FavoriteIcon },
  { text: 'Incoming Requests', href: '/protected/requests/incoming', icon: MailIcon, badge: 3 },
  { text: 'Outgoing Requests', href: '/protected/requests/outgoing', icon: MailIcon, badge: 1 },
  { text: 'Profile', href: '/protected/profile', icon: PersonIcon },
]

// Bottom nav items for mobile (simplified main features)
const bottomNavItems = [
  { text: 'Home', href: '/protected/dashboard', icon: DashboardIcon },
  { text: 'Search', href: '/protected/search', icon: SearchIcon },
  { text: 'Chat', href: '/protected/conversations', icon: ChatIcon, badge: 0 },
  { text: 'Matches', href: '/protected/matches', icon: FavoriteIcon },
  { text: 'Profile', href: '/protected/profile', icon: PersonIcon },
]

export default function ProtectedLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [headerScrolled, setHeaderScrolled] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))
  const pathname = usePathname()
  const router = useRouter()
  
  // Get current user from Redux store
  const user = useAppSelector(state => state.auth.user)

  // Get current bottom nav value based on pathname
  const getBottomNavValue = () => {
    const item = bottomNavItems.find(item => {
      if (item.href === '/protected/requests/incoming') {
        return pathname.startsWith('/protected/requests')
      }
      return pathname === item.href
    })
    return item ? bottomNavItems.indexOf(item) : 0
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setHeaderScrolled(scrollTop > 50)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const sidebar = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      gap: sidebarCollapsed ? 2 : 3,
      p: sidebarCollapsed ? 2 : 3,
      borderRight: '1px solid #374151',
      background: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.3s ease-in-out',
      overflow: 'hidden'
    }}>
      {/* Hamburger Menu Button */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
        mb: 2
      }}>
        <IconButton 
          onClick={handleSidebarToggle}
          sx={{ 
            color: '#9ca3af',
            '&:hover': {
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              color: '#6366f1'
            }
          }}
        >
          <MenuIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      {/* Logo */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: sidebarCollapsed ? 0 : 1.5,
        justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
        minHeight: 32,
        position: 'relative'
      }}>
        <Box sx={{
          width: 32,
          height: 32,
          backgroundColor: '#6366f1',
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <LanguageIcon sx={{ fontSize: 20, color: 'white' }} />
        </Box>
        {!sidebarCollapsed && (
          <Box sx={{
            overflow: 'hidden',
            transition: 'width 0.3s ease-in-out',
            whiteSpace: 'nowrap'
          }}>
            <Typography sx={{ 
              fontSize: '1.125rem', 
              fontWeight: 300, 
              letterSpacing: '-0.025em', 
              color: 'white',
              transition: 'opacity 0.2s ease-in-out',
              minWidth: 'max-content'
            }}>
              LinguaConnect
            </Typography>
          </Box>
        )}
      </Box>

      {/* Navigation */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, fontSize: '0.875rem' }}>
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          const isSearchPage = item.href === '/protected/search'
          const isActiveSearchPage = isSearchPage && isActive
          
          return (
            <Link key={item.text} href={item.href} style={{ textDecoration: 'none' }}>
              <Box
                onClick={() => isMobile && setMobileOpen(false)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: sidebarCollapsed ? 0 : 1.5,
                  px: 1.5,
                  py: isActive ? 1.5 : 1,
                  borderRadius: 2,
                  backgroundColor: isActive 
                    ? 'rgba(99, 102, 241, 0.2)' 
                    : 'transparent',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontWeight: isActiveSearchPage ? 300 : 300,
                  border: isActive ? '1px solid #374151' : '1px solid transparent',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  position: 'relative',
                  '&:hover': {
                    backgroundColor: isActive 
                      ? 'rgba(99, 102, 241, 0.3)' 
                      : 'rgba(99, 102, 241, 0.1)',
                    borderColor: '#6366f1',
                  }
                }}
                title={sidebarCollapsed ? item.text : ''}
              >
                <Icon sx={{ fontSize: 16 }} />
                {!sidebarCollapsed && (
                  <>
                    <Typography sx={{ flex: 1, fontSize: '0.875rem', fontWeight: 300 }}>
                      {item.text}
                    </Typography>
                    {item.badge && (
                      <Typography sx={{
                        fontSize: '0.75rem',
                        backgroundColor: item.badge > 2 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(6, 182, 212, 0.2)',
                        color: item.badge > 2 ? '#4ade80' : '#22d3ee',
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: item.badge > 2 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(6, 182, 212, 0.3)'
                      }}>
                        {item.badge}
                      </Typography>
                    )}
                  </>
                )}
                {sidebarCollapsed && item.badge && (
                  <Box sx={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    width: 8,
                    height: 8,
                    backgroundColor: item.badge > 2 ? '#4ade80' : '#22d3ee',
                    borderRadius: '50%',
                    border: '1px solid rgba(0, 0, 0, 0.8)',
                  }} />
                )}
              </Box>
            </Link>
          )
        })}
      </Box>
    </Box>
  )

  // Bottom navigation component for mobile - Glass morphism design
  const BottomNav = () => {
    const currentIndex = getBottomNavValue()
    
    return (
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          left: 16,
          right: 16,
          zIndex: 1000,
          display: { xs: 'block', lg: 'none' },
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '12px',
          px: 6,
          py: 3,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
          }}
        >
          {bottomNavItems.map((item, index) => {
            const Icon = item.icon
            const isActive = index === currentIndex
            
            return (
              <Box
                key={item.text}
                onClick={() => router.push(item.href)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  color: isActive ? '#a855f7' : 'rgba(156, 163, 175, 1)', // purple-500 for active, gray-400 for inactive
                  '&:active': {
                    transform: 'scale(0.95)',
                  }
                }}
              >
                {/* Icon with optional badge */}
                <Box 
                  sx={{ 
                    position: 'relative', 
                    mb: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.badge && item.badge > 0 ? (
                    <Badge
                      badgeContent={item.badge}
                      sx={{
                        '& .MuiBadge-badge': {
                          background: '#ef4444', // red-500
                          color: 'white',
                          fontSize: '0.5rem',
                          fontWeight: 600,
                          minWidth: '14px',
                          height: '14px',
                          borderRadius: '7px',
                          border: '1px solid rgba(0, 0, 0, 0.6)',
                          top: -2,
                          right: -2,
                        }
                      }}
                    >
                      <Icon
                        sx={{
                          fontSize: 24,
                          color: 'inherit',
                          transition: 'all 0.3s ease',
                        }}
                      />
                    </Badge>
                  ) : (
                    <Icon
                      sx={{
                        fontSize: 24,
                        color: 'inherit',
                        transition: 'all 0.3s ease',
                      }}
                    />
                  )}
                </Box>
                
                {/* Text label */}
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 400,
                    color: 'inherit',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {item.text}
                </Typography>
              </Box>
            )
          })}
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh',
      backgroundColor: '#000000',
      color: 'white',
      fontFamily: 'Inter, sans-serif',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(ellipse at top, rgba(99, 102, 241, 0.2) 0%, #000000 50%)',
        zIndex: -1,
      }
    }}>
      {/* Mobile Menu Button - Only show on tablet/desktop when sidebar is hidden */}
      {isMobile && !isTablet && (
        <IconButton
          onClick={handleDrawerToggle}
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 50,
            p: 1,
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            backdropFilter: 'blur(16px)',
            borderRadius: 1,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white'
          }}
        >
          <MenuIcon sx={{ fontSize: 20 }} />
        </IconButton>
      )}

      {/* Mobile Overlay */}
      {isMobile && mobileOpen && (
        <Box
          onClick={handleDrawerToggle}
          sx={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 30
          }}
        />
      )}

      {/* Sidebar - Hidden on mobile, visible on larger screens */}
      <Box
        sx={{
          position: isMobile ? 'fixed' : 'relative',
          top: 0,
          left: 0,
          zIndex: 40,
          width: sidebarCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
          height: '100vh',
          transform: isMobile ? (mobileOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
          transition: 'all 0.3s ease-in-out',
          flexShrink: 0,
          display: { xs: 'none', lg: 'block' }
        }}
      >
        {sidebar}
      </Box>

      {/* Mobile Sidebar Overlay - Show sidebar when needed on tablet */}
      {!isTablet && isMobile && mobileOpen && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 40,
            width: DRAWER_WIDTH, // Mobile always uses full width
            height: '100vh',
            transform: 'translateX(0)',
            transition: 'transform 0.3s ease-in-out',
          }}
        >
          {sidebar}
        </Box>
      )}

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Mobile Header - Theme Consistent */}
        <Box sx={{
          display: { xs: 'flex', lg: 'none' },
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2.5,
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          borderBottom: '1px solid #374151',
          minHeight: 72,
        }}>
          {/* Logo & User Profile Section */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            flex: 1,
          }}>
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 32,
                height: 32,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <LanguageIcon sx={{ fontSize: 18, color: 'white' }} />
              </Box>
              <Typography sx={{ 
                fontSize: '16px', 
                fontWeight: 600, 
                color: 'white',
                letterSpacing: '-0.02em',
                display: { xs: 'none', sm: 'block' }
              }}>
                LinguaConnect
              </Typography>
            </Box>
            
            {/* User Info */}
            <Box sx={{ 
              display: { xs: 'none', sm: 'flex' }, 
              alignItems: 'center', 
              gap: 1.5,
              minWidth: 0,
              flex: 1,
              ml: 1
            }}>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ 
                  fontSize: '13px', 
                  fontWeight: 500, 
                  color: 'white',
                  lineHeight: 1.2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  Language Learner
                </Typography>
                <Typography sx={{ 
                  fontSize: '11px', 
                  color: '#9ca3af',
                  lineHeight: 1.2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  user@linguaconnect.io
                </Typography>
              </Box>
            </Box>
          </Box>
          
          {/* Action Buttons */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            flexShrink: 0,
          }}>
            <IconButton 
              sx={{ 
                width: 32,
                height: 32,
                backgroundColor: 'rgba(0, 0, 0, 0.3)', 
                '&:hover': {
                  backgroundColor: 'rgba(99, 102, 241, 0.2)',
                },
                borderRadius: '12px',
                border: '1px solid #374151',
              }}
            >
              <NotificationsIcon sx={{ fontSize: 16, color: '#9ca3af' }} />
            </IconButton>
            <UserAvatar 
              user={user}
              size={32}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
                transition: 'transform 0.2s ease',
              }}
            />
          </Box>
        </Box>

        {/* Main Content */}
        <Box sx={{
          flex: 1,
          overflowY: 'auto',
          p: { xs: 2, lg: 3 },
          pb: { xs: 12, lg: 3 } // Extra padding bottom for mobile bottom nav
        }}>
          {/* Desktop Header - Theme styled */}
          <Box sx={{
            display: { xs: 'none', lg: 'flex' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            px: 3,
            py: 2,
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            border: '1px solid #374151',
            borderRadius: 1,
            mb: 3,
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              borderColor: '#6366f1',
              background: 'rgba(0, 0, 0, 0.6)',
            }
          }}>
            {/* Left Section */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
            }}>
              <Box>
                <Typography sx={{ fontSize: '1.125rem', fontWeight: 300, color: 'white' }}>
                  Language Exchange Dashboard
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                  {navigationItems.reduce((sum, item) => sum + (item.badge || 0), 0)} active connections • Premium Member
                </Typography>
              </Box>
            </Box>

            {/* Right Section */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5,
            }}>
              <IconButton sx={{ 
                position: 'relative', 
                color: '#9ca3af',
                '&:hover': {
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  color: '#6366f1'
                }
              }}>
                <NotificationsIcon sx={{ fontSize: 20 }} />
                <Box sx={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#06b6d4'
                }} />
              </IconButton>
              <IconButton sx={{ 
                color: '#9ca3af',
                '&:hover': {
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  color: '#6366f1'
                }
              }}>
                <HelpIcon sx={{ fontSize: 20 }} />
              </IconButton>
              <UserAvatar 
                user={user}
                size={32}
              />
            </Box>
          </Box>
          
          {children}
        </Box>
      </Box>

      {/* Bottom Navigation for Mobile */}
      <BottomNav />
    </Box>
  )
}