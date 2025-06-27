'use client'

import { usePathname } from 'next/navigation'
import Breadcrumb from './Breadcrumb'

interface HierarchicalBreadcrumbProps {
  variant?: 'default' | 'compact'
  showBackButton?: boolean
  showHomeIcon?: boolean
  userName?: string // For user profile pages
  customLabel?: string // For custom last segment label
}

export default function HierarchicalBreadcrumb({ 
  variant = 'default',
  showBackButton = true,
  showHomeIcon = true,
  userName,
  customLabel
}: HierarchicalBreadcrumbProps) {
  const pathname = usePathname()

  const getBreadcrumbItems = () => {
    // Remove /app prefix and split path
    const cleanPath = pathname.replace('/app', '')
    const segments = cleanPath.split('/').filter(Boolean)
    
    // Start with Home
    const items = [
      { label: 'Home', href: '/app' }
    ]

    // Build hierarchical path
    let currentPath = '/app'
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      currentPath += `/${segment}`
      
      // Determine label based on segment
      let label = segment
      const isLast = i === segments.length - 1
      
      switch (segment) {
        case 'home':
          label = 'Home'
          break
        case 'connect':
          label = 'Connect'
          break
        case 'community':
          label = 'Community'
          break
        case 'dashboard':
          label = 'Dashboard'
          break
        case 'profile':
          // Check if this is a user profile (has ID after)
          if (i < segments.length - 1) {
            // This is /profile/[userId] - skip this segment and use user name in next iteration
            continue
          } else {
            // This is just /profile (own profile)
            label = 'Profile'
          }
          break
        case 'matches':
          label = 'Matches'
          break
        case 'conversations':
          label = 'Conversations'
          break
        case 'feed':
          label = 'Feed'
          break
        case 'sessions':
          label = 'Sessions'
          break
        case 'posts':
          label = 'Posts'
          break
        default:
          // Check if previous segment was 'profile' - this would be a user ID
          if (i > 0 && segments[i - 1] === 'profile') {
            label = userName || 'User Profile'
          } else if (i > 0 && segments[i - 1] === 'conversations') {
            label = 'Conversation'
          } else if (i > 0 && segments[i - 1] === 'posts') {
            label = 'Post Details'
          } else {
            // Capitalize first letter for other segments
            label = segment.charAt(0).toUpperCase() + segment.slice(1)
          }
      }

      // Use custom label for last segment if provided
      if (isLast && customLabel) {
        label = customLabel
      }
      
      items.push({
        label,
        href: isLast ? undefined : currentPath,
        active: isLast
      })
    }

    return items
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '8px 16px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      marginBottom: '24px'
    }}>
      <Breadcrumb
        items={getBreadcrumbItems()}
        variant={variant}
        showHomeIcon={showHomeIcon}
        showBackButton={showBackButton}
      />
    </div>
  )
}