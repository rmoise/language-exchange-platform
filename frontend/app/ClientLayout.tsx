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
import { ThemeContextProvider, useTheme as useCustomTheme } from '@/contexts/ThemeContext'
import { initializeTheme } from '@/features/theme/themeSlice'
import SimpleLoading from '@/components/ui/SimpleLoading'
import createEmotionCache from '@/utils/createEmotionCache'
import { apiSlice } from '@/features/api/apiSlice'

// Create theme function that returns theme based on mode
const createAppTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#6366f1' : '#8b5cf6',
      light: mode === 'light' ? '#8b5cf6' : '#a78bfa',
      dark: mode === 'light' ? '#4f46e5' : '#7c3aed',
    },
    secondary: {
      main: mode === 'light' ? '#f59e0b' : '#fbbf24',
      light: mode === 'light' ? '#fbbf24' : '#fcd34d',
      dark: mode === 'light' ? '#d97706' : '#f59e0b',
    },
    background: {
      default: mode === 'light' ? '#f8fafc' : '#0f172a',
      paper: mode === 'light' ? '#ffffff' : '#1e293b',
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
        root: {
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
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: mode === 'light' 
            ? '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)'
            : '0 1px 3px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.8)',
          border: mode === 'light' 
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
        },
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
        disableInteractive: false,
        followCursor: false,
        PopperProps: {
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
      styleOverrides: {
        tooltip: {
          backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)',
          color: mode === 'light' ? '#fff' : '#000',
          fontSize: '0.875rem',
          fontWeight: 500,
          padding: '8px 12px',
          borderRadius: 8,
          boxShadow: mode === 'light' 
            ? '0 4px 12px rgba(0, 0, 0, 0.15)'
            : '0 4px 12px rgba(0, 0, 0, 0.5)',
          maxWidth: 300,
          wordWrap: 'break-word',
          position: 'relative',
          transform: 'none !important',
        },
        arrow: {
          color: mode === 'light' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)',
          '&::before': {
            backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)',
          },
        },
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
})

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
  const { mode } = useCustomTheme()
  const theme = createAppTheme(mode)
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StoreInitializer>
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
          <ThemeContextProvider>
            <ThemedApp>
              {children}
            </ThemedApp>
          </ThemeContextProvider>
        </PersistGate>
      </Provider>
    </CacheProvider>
  )
}