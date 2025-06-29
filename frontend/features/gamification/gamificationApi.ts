import { apiSlice } from '@/features/api/apiSlice';
import type { 
  UserGamificationData, 
  Badge, 
  UserBadge, 
  UserDailyChallenge,
  LeaderboardEntry,
} from './types/gamification';
import type { 
  GetLeaderboardParams, 
  LeaderboardResponse, 
  UserLeaderboardPositions 
} from './services/gamificationService';

// Extend the existing API slice with gamification endpoints
export const gamificationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get user gamification data
    getUserGamificationData: builder.query<UserGamificationData, void>({
      query: () => '/gamification/me',
      providesTags: ['User'],
      transformResponse: (response: UserGamificationData) => {
        console.log('Gamification API - Raw response:', response);
        return response;
      },
    }),

    // Get all badges
    getAllBadges: builder.query<Badge[], void>({
      query: () => '/gamification/badges',
      transformResponse: (response: { badges: Badge[] }) => response.badges,
    }),

    // Get user badges
    getUserBadges: builder.query<UserBadge[], void>({
      query: () => '/gamification/me/badges',
      transformResponse: (response: { badges: UserBadge[] }) => response.badges,
      providesTags: ['User'],
    }),

    // Get daily challenges
    getDailyChallenges: builder.query<UserDailyChallenge[], void>({
      query: () => '/gamification/me/challenges',
      transformResponse: (response: { challenges: UserDailyChallenge[] }) => response.challenges,
      providesTags: ['User'],
    }),

    // Get leaderboard
    getLeaderboard: builder.query<LeaderboardResponse, GetLeaderboardParams>({
      query: (params) => ({
        url: '/gamification/leaderboard',
        params,
      }),
    }),

    // Get user positions
    getUserPositions: builder.query<UserLeaderboardPositions, void>({
      query: () => '/gamification/me/position',
      transformResponse: (response: { positions: UserLeaderboardPositions }) => response.positions,
      providesTags: ['User'],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetUserGamificationDataQuery,
  useGetAllBadgesQuery,
  useGetUserBadgesQuery,
  useGetDailyChallengesQuery,
  useGetLeaderboardQuery,
  useGetUserPositionsQuery,
} = gamificationApi;