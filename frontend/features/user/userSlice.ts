import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { User } from '@/types/global'
import { API_ENDPOINTS } from '@/utils/constants'

// Async thunk for fetching user data
export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]

      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.AUTH.ME}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user data')
      }

      const data = await response.json()
      return data.data || data.user
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch user')
    }
  }
)

// Async thunk for updating profile image
export const updateProfileImage = createAsyncThunk(
  'user/updateProfileImage',
  async (imageUrl: string, { rejectWithValue, dispatch }) => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]

      if (!token) {
        throw new Error('No authentication token found')
      }

      // Save the profile image to the backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.USERS.UPDATE_PROFILE}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          profileImage: imageUrl,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile image')
      }

      // Fetch the latest user data to ensure consistency
      await dispatch(fetchUser())
      
      return imageUrl
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update image')
    }
  }
)

interface UserState {
  data: User | null
  loading: boolean
  error: string | null
}

const initialState: UserState = {
  data: null,
  loading: false,
  error: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUser: (state) => {
      state.data = null
      state.loading = false
      state.error = null
    },
    updateUserField: (state, action: PayloadAction<{ field: keyof User; value: any }>) => {
      if (state.data) {
        state.data[action.payload.field] = action.payload.value
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user cases
      .addCase(fetchUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
        state.error = null
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Update profile image cases
      .addCase(updateProfileImage.pending, (state) => {
        // Keep current state, no loading indicator for optimistic update
      })
      .addCase(updateProfileImage.fulfilled, (state, action) => {
        if (state.data) {
          state.data.profileImage = action.payload
        }
      })
      .addCase(updateProfileImage.rejected, (state, action) => {
        state.error = action.payload as string
      })
  },
})

export const { clearUser, updateUserField } = userSlice.actions
export default userSlice.reducer

// Selectors
export const selectUser = (state: { user: UserState }) => state.user.data
export const selectUserLoading = (state: { user: UserState }) => state.user.loading
export const selectUserError = (state: { user: UserState }) => state.user.error
export const selectProfileImage = (state: { user: UserState }) => state.user.data?.profileImage