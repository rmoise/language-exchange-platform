export interface UserLevel {
  level: number;
  title: string;
  minXP: number;
  maxXP: number;
  perks: string[];
  badgeColor: string;
}

export interface UserProgress {
  userId: string;
  username: string;
  avatar?: string;
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  rank: number;
  badges: Badge[];
  stats: UserStats;
  weeklyXP: number;
  monthlyXP: number;
}

export interface UserStats {
  totalConnections: number;
  sessionsCompleted: number;
  wordsLearned: number;
  minutesPracticed: number;
  messagesExchanged: number;
  helpfulReplies: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  progress: number;
  target: number;
  completed: boolean;
  category: 'conversation' | 'learning' | 'social' | 'practice';
}

export interface Connection {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  nativeLanguage: string;
  learningLanguage: string;
  level: number;
  lastActive: Date;
  status: 'online' | 'away' | 'offline';
  sharedSessions: number;
  connectionDate: Date;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  score: number;
  level: number;
  change: number; // position change from last period
  stats?: {
    streak?: number;
    sessions?: number;
    wordsLearned?: number;
  };
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
  badge?: number;
  isHighlighted?: boolean;
}

// Level definitions
export const USER_LEVELS: UserLevel[] = [
  { level: 1, title: "Beginner", minXP: 0, maxXP: 100, perks: ["Basic chat features"], badgeColor: "#94a3b8" },
  { level: 2, title: "Explorer", minXP: 100, maxXP: 250, perks: ["Profile customization"], badgeColor: "#64748b" },
  { level: 3, title: "Learner", minXP: 250, maxXP: 500, perks: ["Priority matching"], badgeColor: "#475569" },
  { level: 4, title: "Practitioner", minXP: 500, maxXP: 1000, perks: ["Group sessions"], badgeColor: "#10b981" },
  { level: 5, title: "Conversationalist", minXP: 1000, maxXP: 2000, perks: ["Advanced tools"], badgeColor: "#059669" },
  { level: 6, title: "Fluent Speaker", minXP: 2000, maxXP: 3500, perks: ["Mentor status"], badgeColor: "#3b82f6" },
  { level: 7, title: "Language Expert", minXP: 3500, maxXP: 5000, perks: ["Expert badge"], badgeColor: "#2563eb" },
  { level: 8, title: "Polyglot", minXP: 5000, maxXP: 7500, perks: ["VIP features"], badgeColor: "#7c3aed" },
  { level: 9, title: "Master", minXP: 7500, maxXP: 10000, perks: ["Master badge"], badgeColor: "#6d28d9" },
  { level: 10, title: "Legend", minXP: 10000, maxXP: Infinity, perks: ["Legendary status"], badgeColor: "#f59e0b" },
];

// Helper functions
export const getLevelInfo = (xp: number): UserLevel => {
  return USER_LEVELS.find(level => xp >= level.minXP && xp < level.maxXP) || USER_LEVELS[0];
};

export const calculateProgress = (currentXP: number): { level: number; progress: number; xpInLevel: number; xpToNext: number } => {
  const levelInfo = getLevelInfo(currentXP);
  const xpInLevel = currentXP - levelInfo.minXP;
  const levelRange = levelInfo.maxXP - levelInfo.minXP;
  const progress = levelInfo.maxXP === Infinity ? 100 : (xpInLevel / levelRange) * 100;
  const xpToNext = levelInfo.maxXP === Infinity ? 0 : levelInfo.maxXP - currentXP;
  
  return {
    level: levelInfo.level,
    progress,
    xpInLevel,
    xpToNext
  };
};