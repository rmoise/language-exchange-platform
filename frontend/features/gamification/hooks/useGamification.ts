import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { 
  useGetUserGamificationDataQuery,
  useGetAllBadgesQuery,
  useGetUserBadgesQuery,
  useGetDailyChallengesQuery,
  useGetLeaderboardQuery,
  useGetUserPositionsQuery,
} from '../gamificationApi';
import { setGamificationData } from '../gamificationSlice';
import type { GetLeaderboardParams } from '../services/gamificationService';

export function useGamification() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => !!state.auth.user);
  
  // Get user gamification data (skip if not authenticated)
  const { data: gamificationData, isLoading: isLoadingData } = useGetUserGamificationDataQuery(undefined, {
    skip: !isAuthenticated,
  });
  
  // Store gamification data in Redux when it loads
  useEffect(() => {
    if (gamificationData) {
      dispatch(setGamificationData(gamificationData));
    }
  }, [gamificationData, dispatch]);

  // Get all badges
  const { data: allBadges } = useGetAllBadgesQuery();

  // Get user badges (skip if not authenticated)
  const { data: userBadges } = useGetUserBadgesQuery(undefined, {
    skip: !isAuthenticated,
  });

  // Get daily challenges (skip if not authenticated)
  const { data: dailyChallenges } = useGetDailyChallengesQuery(undefined, {
    skip: !isAuthenticated,
  });

  // Get user positions (skip if not authenticated)
  const { data: userPositions } = useGetUserPositionsQuery(undefined, {
    skip: !isAuthenticated,
  });

  // Get leaderboard hook
  const useLeaderboard = (params: GetLeaderboardParams = {}) => {
    return useGetLeaderboardQuery(params);
  };

  return {
    // Data
    gamificationData,
    allBadges,
    userBadges,
    dailyChallenges,
    userPositions,
    
    // Loading states
    isLoadingData,
    
    // Hooks
    useLeaderboard,
  };
}