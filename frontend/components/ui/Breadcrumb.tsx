'use client'

import { Box, Breadcrumbs, Link, Typography, IconButton } from '@mui/material'
import { ArrowBack as ArrowBackIcon, Home as HomeIcon } from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import NextLink from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
  active?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  showBackButton?: boolean
  showHomeIcon?: boolean
  variant?: 'default' | 'compact'
}

export default function Breadcrumb({ 
  items, 
  showBackButton = true, 
  showHomeIcon = true,
  variant = 'default'
}: BreadcrumbProps) {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  const isCompact = variant === 'compact'

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: isCompact ? 1 : 1.5,
        py: isCompact ? 1 : 1.5,
        px: isCompact ? 0 : 0,
      }}
    >
      {/* Back Button */}
      {showBackButton && (
        <IconButton
          onClick={handleBack}
          size={isCompact ? 'small' : 'medium'}
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            },
            width: isCompact ? 32 : 40,
            height: isCompact ? 32 : 40,
          }}
        >
          <ArrowBackIcon fontSize={isCompact ? 'small' : 'medium'} />
        </IconButton>
      )}

      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        separator="/"
        sx={{
          color: 'white',
          '& .MuiBreadcrumbs-separator': {
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: isCompact ? '0.75rem' : '0.875rem',
            mx: isCompact ? 0.5 : 1,
          },
        }}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const isActive = item.active || isLast

          if (isActive || !item.href) {
            return (
              <Typography
                key={index}
                sx={{
                  color: isActive ? 'white' : 'rgba(255, 255, 255, 0.7)',
                  fontSize: isCompact ? '0.75rem' : '0.875rem',
                  fontWeight: isActive ? 600 : 400,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                {index === 0 && showHomeIcon && (
                  <HomeIcon 
                    fontSize={isCompact ? 'small' : 'medium'} 
                    sx={{ fontSize: isCompact ? 14 : 16 }} 
                  />
                )}
                {item.label}
              </Typography>
            )
          }

          return (
            <Link
              key={index}
              component={NextLink}
              href={item.href}
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                textDecoration: 'none',
                fontSize: isCompact ? '0.75rem' : '0.875rem',
                fontWeight: 400,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                transition: 'color 0.2s ease',
                '&:hover': {
                  color: 'white',
                  textDecoration: 'none',
                },
              }}
            >
              {index === 0 && showHomeIcon && (
                <HomeIcon 
                  fontSize={isCompact ? 'small' : 'medium'} 
                  sx={{ fontSize: isCompact ? 14 : 16 }} 
                />
              )}
              {item.label}
            </Link>
          )
        })}
      </Breadcrumbs>
    </Box>
  )
}