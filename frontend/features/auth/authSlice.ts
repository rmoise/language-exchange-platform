import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { api } from '@/utils/api'
import { API_ENDPOINTS } from '@/utils/constants'
import type { User, ApiResponse } from '@/types/global'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post<{ data: { user: User; token: string } }>(
        API_ENDPOINTS.AUTH.LOGIN,
        { email, password }
      )
      
      // Backend sends {data: {token, user}} so access token and user from response.data
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      document.cookie = `token=${response.data.token}; expires=${expires.toUTCString()}; path=/; samesite=lax`
      
      return response.data.user
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message || 'Login failed')
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ email, password, name }: { email: string; password: string; name: string }) => {
    const response = await api.post<{ data: { user: User; token: string } }>(
      API_ENDPOINTS.AUTH.REGISTER,
      { email, password, name }
    )
    
    // Set cookie
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    document.cookie = `token=${response.data.token}; expires=${expires.toUTCString()}; path=/; samesite=lax`
    
    return response.data.user
  }
)

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async () => {
    const response = await api.get<{ data: User }>(API_ENDPOINTS.AUTH.ME)
    return response.data.data
  }
)

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (code: string) => {
    const response = await api.get<{ data: { user: User; token: string } }>(
      `${API_ENDPOINTS.AUTH.GOOGLE_CALLBACK}?code=${code}`
    )
    
    // Set cookie
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    document.cookie = `token=${response.data.token}; expires=${expires.toUTCString()}; path=/; samesite=lax`
    
    return response.data.user
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.error = null
      // Clear cookie
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
    },
    clearError: (state) => {
      state.error = null
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string || action.error.message || 'Login failed'
      })

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Registration failed'
      })

    // Get current user
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.isLoading = false
        state.user = null
        state.isAuthenticated = false
      })

    // Google OAuth
    builder
      .addCase(loginWithGoogle.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Google authentication failed'
      })
  },
})

export const { logout, clearError, updateUser } = authSlice.actions
export default authSlice.reducer