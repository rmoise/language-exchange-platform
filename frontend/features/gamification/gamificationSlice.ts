import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UserGamificationData, XPTransaction, Badge, UserBadge } from './types/gamification';

interface LevelUpEvent {
  userId: string;
  newLevel: number;
  previousLevel: number;
  xpGained: number;
  timestamp: string;
}

interface GamificationState {
  data: UserGamificationData | null;
  recentXPGains: XPTransaction[];
  recentLevelUps: LevelUpEvent[];
  loading: boolean;
  error: string | null;
}

const initialState: GamificationState = {
  data: null,
  recentXPGains: [],
  recentLevelUps: [],
  loading: false,
  error: null,
};

const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {
    // Set gamification data
    setGamificationData: (state, action: PayloadAction<UserGamificationData>) => {
      state.data = action.payload;
      state.loading = false;
      state.error = null;
    },
    
    // Update specific fields
    updateXP: (state, action: PayloadAction<{ totalXP: number; level: number; xpToNextLevel: number; xpGained?: number }>) => {
      if (state.data) {
        const previousLevel = state.data.level;
        const newLevel = action.payload.level;
        
        state.data.totalXP = action.payload.totalXP;
        state.data.level = newLevel;
        state.data.xpToNextLevel = action.payload.xpToNextLevel;
        
        // Check for level up
        if (newLevel > previousLevel && state.data.user) {
          const levelUpEvent: LevelUpEvent = {
            userId: state.data.user.id,
            newLevel,
            previousLevel,
            xpGained: action.payload.xpGained || 0,
            timestamp: new Date().toISOString(),
          };
          
          state.recentLevelUps.unshift(levelUpEvent);
          // Keep only last 5 level ups
          if (state.recentLevelUps.length > 5) {
            state.recentLevelUps.pop();
          }
        }
      }
    },
    
    updateStreak: (state, action: PayloadAction<{ currentStreak: number; longestStreak: number }>) => {
      if (state.data) {
        state.data.currentStreak = action.payload.currentStreak;
        state.data.longestStreak = Math.max(
          action.payload.longestStreak,
          state.data.longestStreak
        );
      }
    },
    
    addBadge: (state, action: PayloadAction<UserBadge>) => {
      if (state.data) {
        state.data.badges.push(action.payload);
      }
    },
    
    updateChallengeProgress: (state, action: PayloadAction<{ challengeId: string; progress: number; completed?: boolean }>) => {
      if (state.data) {
        const challenge = state.data.dailyChallenges.find(c => c.challengeId === action.payload.challengeId);
        if (challenge) {
          challenge.progress = action.payload.progress;
          if (action.payload.completed !== undefined) {
            challenge.completed = action.payload.completed;
          }
        }
      }
    },
    
    // Add recent XP gain for notifications
    addRecentXPGain: (state, action: PayloadAction<XPTransaction>) => {
      state.recentXPGains.unshift(action.payload);
      // Keep only last 10 XP gains
      if (state.recentXPGains.length > 10) {
        state.recentXPGains.pop();
      }
    },
    
    clearRecentXPGains: (state) => {
      state.recentXPGains = [];
    },
    
    // Level up event management
    addLevelUpEvent: (state, action: PayloadAction<LevelUpEvent>) => {
      state.recentLevelUps.unshift(action.payload);
      // Keep only last 5 level ups
      if (state.recentLevelUps.length > 5) {
        state.recentLevelUps.pop();
      }
    },
    
    clearLevelUpEvent: (state, action: PayloadAction<string>) => {
      state.recentLevelUps = state.recentLevelUps.filter(
        event => event.timestamp !== action.payload
      );
    },
    
    clearAllLevelUpEvents: (state) => {
      state.recentLevelUps = [];
    },
    
    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    // Clear data (on logout)
    clearGamificationData: (state) => {
      state.data = null;
      state.recentXPGains = [];
      state.recentLevelUps = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setGamificationData,
  updateXP,
  updateStreak,
  addBadge,
  updateChallengeProgress,
  addRecentXPGain,
  clearRecentXPGains,
  addLevelUpEvent,
  clearLevelUpEvent,
  clearAllLevelUpEvents,
  setLoading,
  setError,
  clearGamificationData,
} = gamificationSlice.actions;

export default gamificationSlice.reducer;

// Selectors
export const selectGamificationData = (state: { gamification: GamificationState }) => state.gamification.data;
export const selectUserLevel = (state: { gamification: GamificationState }) => state.gamification.data?.level || 1;
export const selectUserXP = (state: { gamification: GamificationState }) => state.gamification.data?.totalXP || 0;
export const selectUserStreak = (state: { gamification: GamificationState }) => state.gamification.data?.currentStreak || 0;
export const selectUserBadges = (state: { gamification: GamificationState }) => state.gamification.data?.badges || [];
export const selectDailyChallenges = (state: { gamification: GamificationState }) => state.gamification.data?.dailyChallenges || [];
export const selectRecentXPGains = (state: { gamification: GamificationState }) => state.gamification.recentXPGains;
export const selectRecentLevelUps = (state: { gamification: GamificationState }) => state.gamification.recentLevelUps;
export const selectGamificationLoading = (state: { gamification: GamificationState }) => state.gamification.loading;
export const selectGamificationError = (state: { gamification: GamificationState }) => state.gamification.error;

// Export the LevelUpEvent type for use in components
export type { LevelUpEvent };