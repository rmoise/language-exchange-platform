'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { toggleMode, selectThemeMode } from '@/features/theme/themeSlice'

interface ThemeContextType {
  mode: 'light' | 'dark'
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeContextProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()
  const mode = useAppSelector(selectThemeMode)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    dispatch(toggleMode())
  }

  // Prevent hydration mismatch by providing consistent SSR theme
  if (!mounted) {
    return (
      <ThemeContext.Provider value={{ mode: 'light', toggleTheme }}>
        {children}
      </ThemeContext.Provider>
    )
  }

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeContextProvider')
  }
  return context
}