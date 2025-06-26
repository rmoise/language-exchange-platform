export interface Flashcard {
  id: string;
  userId: string;
  word: string;
  translation: string;
  targetLanguage: string;
  nativeLanguage: string;
  context?: string; // The sentence/post where the word was found
  contextUrl?: string; // Link to the original post/comment
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: Date;
  lastReviewedAt?: Date;
  nextReviewAt: Date;
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
  masteryLevel: number; // 0-5, based on spaced repetition algorithm
  tags?: string[];
  notes?: string;
}

export interface FlashcardReview {
  flashcardId: string;
  reviewedAt: Date;
  correct: boolean;
  responseTime: number; // milliseconds
  difficulty: 'again' | 'hard' | 'good' | 'easy'; // Based on SM-2 algorithm
}

export interface DailyStats {
  date: Date;
  cardsReviewed: number;
  cardsLearned: number;
  correctCount: number;
  streak: number;
  studyTime: number; // minutes
}

export interface UserLearningProfile {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  totalCardsLearned: number;
  totalReviews: number;
  averageAccuracy: number;
  lastStudyDate?: Date;
  dailyGoal: number; // cards per day
  preferredStudyTime?: string; // e.g., "morning", "evening"
  learningLanguages: string[];
  nativeLanguages: string[];
}

export interface VocabularyList {
  id: string;
  userId: string;
  name: string;
  description?: string;
  flashcardIds: string[];
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  tags: string[];
}

// Spaced Repetition Algorithm Parameters
export interface SRSParameters {
  easinessFactor: number; // 2.5 default
  interval: number; // days until next review
  repetitions: number; // successful repetitions in a row
}

export interface FlashcardDeck {
  newCards: Flashcard[];
  learningCards: Flashcard[];
  reviewCards: Flashcard[];
  totalCards: number;
  dueToday: number;
}