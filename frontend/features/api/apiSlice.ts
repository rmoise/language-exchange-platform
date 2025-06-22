import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { User } from '@/types/global'
import { API_ENDPOINTS } from '@/utils/constants'
import { updateUser } from '@/features/auth/authSlice'

// Define the API slice using RTK Query
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
    prepareHeaders: (headers) => {
      // Get token from cookies
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]
      
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      
      return headers
    },
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    // Get current user
    getCurrentUser: builder.query<User, void>({
      query: () => API_ENDPOINTS.AUTH.ME,
      providesTags: ['User'],
      transformResponse: (response: { data: User }) => {
        const user = response.data
        // Ensure profile image URL is absolute
        if (user && user.profileImage && user.profileImage.startsWith('/')) {
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
          const baseUrl = apiBaseUrl.replace(/\/api\/?$/, '') // Remove /api suffix
          user.profileImage = baseUrl + user.profileImage
        }
        return user
      },
    }),
    
    // Update user profile
    updateUserProfile: builder.mutation<User, Partial<User>>({
      query: (profileData) => ({
        url: API_ENDPOINTS.USERS.UPDATE_PROFILE,
        method: 'PUT',
        body: profileData,
      }),
      // This will trigger a refetch of getCurrentUser
      invalidatesTags: ['User'],
      transformResponse: (response: { data: User }) => {
        const user = response.data
        // Ensure profile image URL is absolute
        if (user && user.profileImage && user.profileImage.startsWith('/')) {
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
          const baseUrl = apiBaseUrl.replace(/\/api\/?$/, '') // Remove /api suffix
          user.profileImage = baseUrl + user.profileImage
        }
        return user
      },
      // Optimistically update the cache
      async onQueryStarted(profileData, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          apiSlice.util.updateQueryData('getCurrentUser', undefined, (draft) => {
            Object.assign(draft, profileData)
          })
        )
        try {
          const { data } = await queryFulfilled
          // Also update the auth state with the new user data
          dispatch(updateUser(data))
        } catch {
          patchResult.undo()
        }
      },
    }),
    
    // Manual cache update for profile image
    updateProfileImageCache: builder.mutation<null, string>({
      queryFn: () => {
        // Return a valid result object with null data
        return { data: null }
      },
      async onQueryStarted(imageUrl, { dispatch }) {
        // Manually update the cache with the new image URL
        dispatch(
          apiSlice.util.updateQueryData('getCurrentUser', undefined, (draft) => {
            if (draft) {
              // Ensure the URL is absolute
              if (imageUrl.startsWith('/')) {
                const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
                const baseUrl = apiBaseUrl.replace(/\/api\/?$/, '')
                draft.profileImage = baseUrl + imageUrl
              } else {
                draft.profileImage = imageUrl
              }
            }
          })
        )
      },
    }),
  }),
})

// Export hooks for usage in functional components
export const {
  useGetCurrentUserQuery,
  useUpdateUserProfileMutation,
  useUpdateProfileImageCacheMutation,
} = apiSlice