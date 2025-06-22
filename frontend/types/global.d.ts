export interface User {
  id: string
  email: string
  name: string
  username?: string
  googleId?: string
  profileImage?: string
  coverPhoto?: string
  photos?: string[]
  birthday?: string
  city?: string
  country?: string
  timezone?: string
  latitude?: number
  longitude?: number
  bio?: string
  interests?: string[]
  nativeLanguages: string[]
  targetLanguages: string[]
  onboardingStep: number
  createdAt: string
  updatedAt: string
}

export interface MatchRequest {
  id: string
  senderId: string
  recipientId: string
  status: 'pending' | 'accepted' | 'declined'
  sender?: User
  recipient?: User
  createdAt: string
  updatedAt: string
}

export interface Match {
  id: string
  user1: User
  user2: User
  createdAt: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  error: string
  code: string
  details?: Array<{
    field: string
    message: string
  }>
}

export interface SearchFilters {
  native?: string
  target?: string
  city?: string
  country?: string
  maxDistance?: number
  latitude?: number
  longitude?: number
  page?: number
  limit?: number
}