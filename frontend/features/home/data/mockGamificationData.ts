import { UserProgress, DailyChallenge, Connection, LeaderboardEntry, Badge } from '../types/gamification';

export const mockUserProgress: UserProgress = {
  userId: 'current-user',
  username: 'You',
  avatar: undefined,
  level: 4,
  currentXP: 675,
  xpToNextLevel: 325,
  totalXP: 675,
  currentStreak: 12,
  longestStreak: 23,
  rank: 42,
  weeklyXP: 120,
  monthlyXP: 450,
  badges: [
    {
      id: 'streak-7',
      name: 'Week Warrior',
      description: '7-day streak',
      icon: '🔥',
      rarity: 'common',
      unlockedAt: new Date('2024-01-15'),
    },
    {
      id: 'helper-5',
      name: 'Community Helper',
      description: 'Helped 5 learners',
      icon: '🤝',
      rarity: 'rare',
      unlockedAt: new Date('2024-01-20'),
    },
    {
      id: 'sessions-10',
      name: 'Session Master',
      description: 'Completed 10 sessions',
      icon: '🎯',
      rarity: 'rare',
      unlockedAt: new Date('2024-01-22'),
    },
  ],
  stats: {
    totalConnections: 24,
    sessionsCompleted: 38,
    wordsLearned: 342,
    minutesPracticed: 1250,
    messagesExchanged: 156,
    helpfulReplies: 12,
  },
};

export const mockDailyChallenges: DailyChallenge[] = [
  {
    id: 'daily-1',
    title: 'Morning Conversation',
    description: 'Have a 30-minute conversation session',
    icon: '💬',
    xpReward: 50,
    progress: 0,
    target: 30,
    completed: false,
    category: 'conversation',
  },
  {
    id: 'daily-2',
    title: 'Vocabulary Builder',
    description: 'Learn 10 new words',
    icon: '📚',
    xpReward: 30,
    progress: 4,
    target: 10,
    completed: false,
    category: 'learning',
  },
  {
    id: 'daily-3',
    title: 'Community Support',
    description: 'Help answer 2 questions',
    icon: '🤝',
    xpReward: 40,
    progress: 1,
    target: 2,
    completed: false,
    category: 'social',
  },
  {
    id: 'daily-4',
    title: 'Practice Makes Perfect',
    description: 'Complete 15 flashcard reviews',
    icon: '🎯',
    xpReward: 20,
    progress: 15,
    target: 15,
    completed: true,
    category: 'practice',
  },
];

export const mockConnections: Connection[] = [
  {
    id: 'conn-1',
    userId: 'user-1',
    username: 'Maria García',
    avatar: undefined,
    nativeLanguage: 'Spanish',
    learningLanguage: 'English',
    level: 5,
    lastActive: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    status: 'online',
    sharedSessions: 12,
    connectionDate: new Date('2024-01-01'),
  },
  {
    id: 'conn-2',
    userId: 'user-2',
    username: 'Yuki Tanaka',
    avatar: undefined,
    nativeLanguage: 'Japanese',
    learningLanguage: 'English',
    level: 7,
    lastActive: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
    status: 'online',
    sharedSessions: 8,
    connectionDate: new Date('2024-01-05'),
  },
  {
    id: 'conn-3',
    userId: 'user-3',
    username: 'Pierre Dubois',
    avatar: undefined,
    nativeLanguage: 'French',
    learningLanguage: 'Spanish',
    level: 3,
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    status: 'away',
    sharedSessions: 5,
    connectionDate: new Date('2024-01-10'),
  },
  {
    id: 'conn-4',
    userId: 'user-4',
    username: 'Anna Mueller',
    avatar: undefined,
    nativeLanguage: 'German',
    learningLanguage: 'Italian',
    level: 6,
    lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    status: 'offline',
    sharedSessions: 15,
    connectionDate: new Date('2023-12-20'),
  },
];

export const mockLeaderboard: {
  weekly: LeaderboardEntry[];
  monthly: LeaderboardEntry[];
  allTime: LeaderboardEntry[];
} = {
  weekly: [
    {
      userId: 'leader-1',
      username: 'Sarah Chen',
      avatar: undefined,
      score: 520,
      level: 8,
      change: 2,
      stats: { streak: 45, sessions: 12, wordsLearned: 89 },
    },
    {
      userId: 'leader-2',
      username: 'Alex Kim',
      avatar: undefined,
      score: 485,
      level: 7,
      change: -1,
      stats: { streak: 23, sessions: 15, wordsLearned: 76 },
    },
    {
      userId: 'leader-3',
      username: 'Marco Rossi',
      avatar: undefined,
      score: 470,
      level: 6,
      change: 0,
      stats: { streak: 31, sessions: 10, wordsLearned: 92 },
    },
    {
      userId: 'leader-4',
      username: 'Emma Johnson',
      avatar: undefined,
      score: 455,
      level: 7,
      change: 3,
      stats: { streak: 18, sessions: 14, wordsLearned: 65 },
    },
    {
      userId: 'leader-5',
      username: 'Luis Rodriguez',
      avatar: undefined,
      score: 440,
      level: 5,
      change: -2,
      stats: { streak: 27, sessions: 8, wordsLearned: 71 },
    },
  ],
  monthly: [
    {
      userId: 'month-1',
      username: 'Kenji Nakamura',
      avatar: undefined,
      score: 2150,
      level: 9,
      change: 0,
      stats: { streak: 67, sessions: 45 },
    },
    {
      userId: 'month-2',
      username: 'Sophie Martin',
      avatar: undefined,
      score: 1980,
      level: 8,
      change: 1,
      stats: { streak: 54, sessions: 38 },
    },
    {
      userId: 'month-3',
      username: 'David Lee',
      avatar: undefined,
      score: 1850,
      level: 8,
      change: -1,
      stats: { streak: 48, sessions: 42 },
    },
  ],
  allTime: [
    {
      userId: 'all-1',
      username: 'Language Legend',
      avatar: undefined,
      score: 15420,
      level: 10,
      change: 0,
    },
    {
      userId: 'all-2',
      username: 'Polyglot Pro',
      avatar: undefined,
      score: 12350,
      level: 10,
      change: 0,
    },
    {
      userId: 'all-3',
      username: 'Master Mind',
      avatar: undefined,
      score: 10890,
      level: 9,
      change: 0,
    },
  ],
};

export const mockBadges: Badge[] = [
  // Common badges
  { id: 'first-session', name: 'First Steps', description: 'Complete your first session', icon: '👶', rarity: 'common' },
  { id: 'streak-3', name: 'Getting Started', description: '3-day streak', icon: '🔥', rarity: 'common' },
  { id: 'words-10', name: 'Word Collector', description: 'Learn 10 words', icon: '📝', rarity: 'common' },
  
  // Rare badges
  { id: 'streak-30', name: 'Dedicated Learner', description: '30-day streak', icon: '💎', rarity: 'rare' },
  { id: 'helper-10', name: 'Community Pillar', description: 'Help 10 learners', icon: '🏆', rarity: 'rare' },
  { id: 'sessions-50', name: 'Conversation Expert', description: '50 sessions completed', icon: '🎓', rarity: 'rare' },
  
  // Epic badges
  { id: 'streak-100', name: 'Unstoppable', description: '100-day streak', icon: '⚡', rarity: 'epic' },
  { id: 'polyglot', name: 'Polyglot', description: 'Learn 3+ languages', icon: '🌍', rarity: 'epic' },
  
  // Legendary badges
  { id: 'streak-365', name: 'Year of Learning', description: '365-day streak', icon: '👑', rarity: 'legendary' },
  { id: 'mentor-100', name: 'Master Teacher', description: 'Mentor 100 students', icon: '🌟', rarity: 'legendary' },
];

// Helper function to generate connection opportunities
export const generateConnectionOpportunities = (currentUser: any) => {
  const languages = ['Spanish', 'French', 'Japanese', 'German', 'Italian', 'Korean', 'Portuguese', 'Russian'];
  const names = [
    'Carlos Mendez', 'Marie Dupont', 'Hiroshi Sato', 'Elena Volkov', 
    'Giovanni Romano', 'Min-jung Park', 'Ana Silva', 'Olga Petrov'
  ];
  
  return Array.from({ length: 4 }, (_, i) => ({
    id: `opp-${i}`,
    userId: `new-user-${i}`,
    username: names[i],
    avatar: undefined,
    nativeLanguage: languages[i],
    learningLanguage: 'English', // Simplified for demo
    level: Math.floor(Math.random() * 5) + 3,
    compatibility: Math.floor(Math.random() * 20) + 80, // 80-100% match
    commonInterests: ['Travel', 'Movies', 'Cooking'].slice(0, Math.floor(Math.random() * 3) + 1),
  }));
};