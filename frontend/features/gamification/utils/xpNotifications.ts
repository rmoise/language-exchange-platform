import { showXPNotification } from '@/components/ui/XPNotificationElegant';

// XP reward amounts (should match backend)
export const XP_REWARDS = {
  SESSION_COMPLETE: 50,
  MATCH_REQUEST: 10,
  MATCH_ACCEPTED: 20,
  POST_CREATED: 15,
  HELPFUL_REPLY: 25,
  DAILY_LOGIN: 5,
  PROFILE_COMPLETE: 100,
  STREAK_BONUS: 10,
} as const;

// XP notification messages
export const XP_MESSAGES = {
  SESSION_COMPLETE: 'Session completed!',
  MATCH_REQUEST: 'Match request sent!',
  MATCH_ACCEPTED: 'Match accepted!',
  POST_CREATED: 'Post created!',
  HELPFUL_REPLY: 'Helpful reply!',
  DAILY_LOGIN: 'Daily login bonus!',
  PROFILE_COMPLETE: 'Profile completed!',
  STREAK_BONUS: 'Streak bonus!',
  BADGE_EARNED: 'Badge earned!',
  CHALLENGE_COMPLETE: 'Challenge completed!',
} as const;

// Helper function to show XP notifications
export const notifyXPGain = (
  actionType: keyof typeof XP_REWARDS | 'BADGE_EARNED' | 'CHALLENGE_COMPLETE',
  customMessage?: string,
  xpAmount?: number
) => {
  const defaultXP = XP_REWARDS[actionType as keyof typeof XP_REWARDS] || 0;
  const amount = xpAmount || defaultXP;
  const message = customMessage || XP_MESSAGES[actionType] || 'XP Gained!';
  
  if (amount > 0) {
    showXPNotification(amount, message);
  }
};