import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ThemeState {
  mode: 'light' | 'dark'
}

const initialState: ThemeState = {
  mode: 'light',
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setMode: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.mode = action.payload
    },
    toggleMode: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light'
    },
    initializeTheme: (state) => {
      // Initialize theme based on system preference if available
      if (typeof window !== 'undefined') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        state.mode = prefersDark ? 'dark' : 'light'
      }
    },
  },
})

export const { setMode, toggleMode, initializeTheme } = themeSlice.actions
export default themeSlice.reducer

// Selectors
export const selectThemeMode = (state: { theme: ThemeState }) => state.theme.mode