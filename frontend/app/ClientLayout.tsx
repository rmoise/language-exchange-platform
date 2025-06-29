'use client'

import { useRef, useEffect, useMemo } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { CacheProvider } from '@emotion/react'
import CssBaseline from '@mui/material/CssBaseline'
import { makeStore, makePersistor, AppStore } from '@/lib/store'
import { useAppDispatch } from '@/lib/hooks'
import { getCurrentUser } from '@/features/auth/authSlice'
import SimpleLoading from '@/components/ui/SimpleLoading'
import createEmotionCache from '@/utils/createEmotionCache'
import { apiSlice } from '@/features/api/apiSlice'
import { XPNotificationManagerElegant } from '@/components/ui/XPNotificationElegant'
import { LevelUpManager } from '@/components/ui/LevelUpNotification'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { WebSocketProvider } from '@/contexts/WebSocketContext'
import { MessageNotificationManager } from '@/components/notifications/MessageNotificationManager'
import { ToastNotificationManager } from '@/components/notifications/ToastNotification'

// Create theme with CSS variables enabled for proper dark mode support
const createAppThemeWithCssVars = () => createTheme({
  cssVariables: {
    colorSchemeSelector: 'data',
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#6366f1',
          light: '#8b5cf6',
          dark: '#4f46e5',
        },
        secondary: {
          main: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706',
        },
        background: {
          default: '#f8fafc',
          paper: '#ffffff',
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: '#8b5cf6',
          light: '#a78bfa',
          dark: '#7c3aed',
        },
        secondary: {
          main: '#fbbf24',
          light: '#fcd34d',
          dark: '#f59e0b',
        },
        background: {
          default: '#0f172a',
          paper: '#1e293b',
        },
      },
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '10px 20px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-1px)',
          },
          transition: 'all 0.2s ease-in-out',
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          ...theme.applyStyles('dark', {
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }),
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            '&:hover fieldset': {
              borderColor: 'rgba(99, 102, 241, 0.5)',
            },
          },
        },
      },
    },
    MuiTooltip: {
      defaultProps: {
        arrow: true,
        placement: 'top',
        PopperProps: {
          disablePortal: false,
          popperOptions: {
            modifiers: [
              {
                name: 'flip',
                enabled: true,
                options: {
                  fallbackPlacements: ['top', 'left', 'right', 'bottom'],
                  altBoundary: true,
                },
              },
              {
                name: 'preventOverflow',
                enabled: true,
                options: {
                  boundary: 'window',
                  padding: 16,
                  altBoundary: false,
                  tether: false,
                },
              },
              {
                name: 'offset',
                enabled: true,
                options: {
                  offset: [0, 12],
                },
              },
              {
                name: 'computeStyles',
                options: {
                  gpuAcceleration: false,
                  adaptive: false,
                },
              },
            ],
            strategy: 'fixed',
            placement: 'top',
          },
        },
      },
      styleOverrides: {
        tooltip: ({ theme }) => ({
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: '#fff',
          fontSize: '0.875rem',
          fontWeight: 500,
          padding: '8px 12px',
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          maxWidth: 300,
          wordWrap: 'break-word',
          position: 'relative',
          transform: 'none !important',
          ...theme.applyStyles('dark', {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            color: '#000',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
          }),
        }),
        arrow: ({ theme }) => ({
          color: 'rgba(0, 0, 0, 0.9)',
          '&::before': {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
          },
          ...theme.applyStyles('dark', {
            color: 'rgba(255, 255, 255, 0.95)',
            '&::before': {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
            },
          }),
        }),
        popper: {
          zIndex: 9999,
          '&[data-popper-reference-hidden="true"]': {
            visibility: 'hidden',
            pointerEvents: 'none',
          },
        },
        popperInteractive: {
          zIndex: 9999,
        },
        popperArrow: {
          '&[data-popper-reference-hidden="true"]': {
            visibility: 'hidden',
          },
        },
      },
    },
  },
});


function StoreInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()
  const hasInitialized = useRef(false)

  useEffect(() => {
    // Only run once on mount, not on every render
    if (hasInitialized.current) return
    hasInitialized.current = true

    // Check if user is logged in on app start
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1]
    
    if (token) {
      dispatch(getCurrentUser())
      // Trigger RTK Query to fetch user data
      dispatch(apiSlice.endpoints.getCurrentUser.initiate())
    }
  }, [dispatch]) // Empty dependency array - run only once

  return <>{children}</>
}

function ThemedApp({ children }: { children: React.ReactNode }) {
  const theme = useMemo(() => createAppThemeWithCssVars(), [])
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StoreInitializer>
        <XPNotificationManagerElegant />
        <LevelUpManager />
        <MessageNotificationManager />
        <ToastNotificationManager />
        {children}
      </StoreInitializer>
    </ThemeProvider>
  )
}

// Client-side cache instance
const clientSideEmotionCache = createEmotionCache()

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const storeRef = useRef<AppStore | undefined>(undefined)
  const persistorRef = useRef<any>(undefined)
  const emotionCache = useMemo(() => clientSideEmotionCache, [])
  
  if (!storeRef.current) {
    storeRef.current = makeStore()
    persistorRef.current = makePersistor(storeRef.current)
  }

  return (
    <CacheProvider value={emotionCache}>
      <Provider store={storeRef.current}>
        <PersistGate loading={<SimpleLoading />} persistor={persistorRef.current}>
          <NotificationProvider>
            <WebSocketProvider>
              <ThemedApp>
                {children}
              </ThemedApp>
            </WebSocketProvider>
          </NotificationProvider>
        </PersistGate>
      </Provider>
    </CacheProvider>
  )
}