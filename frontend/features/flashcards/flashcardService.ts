import { 
  Flashcard, 
  FlashcardReview, 
  DailyStats, 
  UserLearningProfile,
  SRSParameters,
  FlashcardDeck 
} from './types';

// Spaced Repetition Algorithm (SM-2 variant)
class SpacedRepetition {
  private static calculateInterval(
    quality: number, // 0-5 rating
    repetitions: number,
    previousInterval: number,
    easinessFactor: number
  ): { interval: number; easinessFactor: number; repetitions: number } {
    let newEasinessFactor = easinessFactor;
    let newInterval = previousInterval;
    let newRepetitions = repetitions;

    if (quality >= 3) {
      // Correct response
      if (repetitions === 0) {
        newInterval = 1;
      } else if (repetitions === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(previousInterval * easinessFactor);
      }
      newRepetitions = repetitions + 1;
    } else {
      // Incorrect response
      newRepetitions = 0;
      newInterval = 1;
    }

    // Update easiness factor
    newEasinessFactor = Math.max(1.3, easinessFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    return {
      interval: newInterval,
      easinessFactor: newEasinessFactor,
      repetitions: newRepetitions
    };
  }

  static getNextReviewDate(flashcard: Flashcard, quality: 'again' | 'hard' | 'good' | 'easy'): Date {
    const qualityMap = { again: 0, hard: 2, good: 3, easy: 5 };
    const qualityScore = qualityMap[quality];
    
    const srsParams: SRSParameters = {
      easinessFactor: flashcard.masteryLevel > 0 ? 2.5 + (flashcard.masteryLevel * 0.1) : 2.5,
      interval: 1,
      repetitions: flashcard.correctCount
    };

    const result = this.calculateInterval(
      qualityScore,
      srsParams.repetitions,
      srsParams.interval,
      srsParams.easinessFactor
    );

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + result.interval);
    return nextReview;
  }

  static updateMasteryLevel(flashcard: Flashcard, correct: boolean): number {
    const currentLevel = flashcard.masteryLevel;
    if (correct) {
      return Math.min(5, currentLevel + 0.5);
    } else {
      return Math.max(0, currentLevel - 1);
    }
  }
}

export class FlashcardService {
  private static STORAGE_KEY = 'lingua_flashcards';
  private static PROFILE_KEY = 'lingua_learning_profile';
  private static STATS_KEY = 'lingua_daily_stats';

  // Local storage helpers
  private static getFromStorage<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  private static saveToStorage(key: string, data: any): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Flashcard CRUD operations
  static async createFlashcard(flashcard: Omit<Flashcard, 'id' | 'createdAt' | 'reviewCount' | 'correctCount' | 'incorrectCount' | 'masteryLevel'>): Promise<Flashcard> {
    const flashcards = this.getFromStorage<Flashcard[]>(this.STORAGE_KEY) || [];
    
    const newFlashcard: Flashcard = {
      ...flashcard,
      id: `fc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      reviewCount: 0,
      correctCount: 0,
      incorrectCount: 0,
      masteryLevel: 0,
      nextReviewAt: new Date() // Due immediately for new cards
    };

    flashcards.push(newFlashcard);
    this.saveToStorage(this.STORAGE_KEY, flashcards);
    
    return newFlashcard;
  }

  static async getFlashcards(userId: string): Promise<Flashcard[]> {
    const flashcards = this.getFromStorage<Flashcard[]>(this.STORAGE_KEY) || [];
    return flashcards.filter(fc => fc.userId === userId);
  }

  static async getFlashcardById(id: string): Promise<Flashcard | null> {
    const flashcards = this.getFromStorage<Flashcard[]>(this.STORAGE_KEY) || [];
    return flashcards.find(fc => fc.id === id) || null;
  }

  static async updateFlashcard(id: string, updates: Partial<Flashcard>): Promise<Flashcard | null> {
    const flashcards = this.getFromStorage<Flashcard[]>(this.STORAGE_KEY) || [];
    const index = flashcards.findIndex(fc => fc.id === id);
    
    if (index === -1) return null;
    
    flashcards[index] = { ...flashcards[index], ...updates };
    this.saveToStorage(this.STORAGE_KEY, flashcards);
    
    return flashcards[index];
  }

  static async deleteFlashcard(id: string): Promise<boolean> {
    const flashcards = this.getFromStorage<Flashcard[]>(this.STORAGE_KEY) || [];
    const filtered = flashcards.filter(fc => fc.id !== id);
    
    if (filtered.length === flashcards.length) return false;
    
    this.saveToStorage(this.STORAGE_KEY, filtered);
    return true;
  }

  // Review functionality
  static async reviewFlashcard(
    flashcardId: string, 
    quality: 'again' | 'hard' | 'good' | 'easy'
  ): Promise<void> {
    const flashcard = await this.getFlashcardById(flashcardId);
    if (!flashcard) return;

    const correct = quality !== 'again';
    const nextReviewAt = SpacedRepetition.getNextReviewDate(flashcard, quality);
    const newMasteryLevel = SpacedRepetition.updateMasteryLevel(flashcard, correct);

    await this.updateFlashcard(flashcardId, {
      lastReviewedAt: new Date(),
      nextReviewAt,
      reviewCount: flashcard.reviewCount + 1,
      correctCount: correct ? flashcard.correctCount + 1 : flashcard.correctCount,
      incorrectCount: correct ? flashcard.incorrectCount : flashcard.incorrectCount + 1,
      masteryLevel: newMasteryLevel
    });

    // Update daily stats
    await this.updateDailyStats(flashcard.userId, correct);
  }

  // Get cards due for review
  static async getDueCards(userId: string): Promise<FlashcardDeck> {
    const allCards = await this.getFlashcards(userId);
    const now = new Date();
    
    const newCards = allCards.filter(card => card.reviewCount === 0);
    const learningCards = allCards.filter(card => 
      card.reviewCount > 0 && card.masteryLevel < 3 && new Date(card.nextReviewAt) <= now
    );
    const reviewCards = allCards.filter(card => 
      card.masteryLevel >= 3 && new Date(card.nextReviewAt) <= now
    );

    return {
      newCards: newCards.slice(0, 10), // Limit new cards per day
      learningCards,
      reviewCards,
      totalCards: allCards.length,
      dueToday: newCards.slice(0, 10).length + learningCards.length + reviewCards.length
    };
  }

  // User profile management
  static async getUserProfile(userId: string): Promise<UserLearningProfile> {
    const profile = this.getFromStorage<UserLearningProfile>(this.PROFILE_KEY);
    
    if (profile && profile.userId === userId) {
      return profile;
    }

    // Create default profile
    const defaultProfile: UserLearningProfile = {
      userId,
      currentStreak: 0,
      longestStreak: 0,
      totalCardsLearned: 0,
      totalReviews: 0,
      averageAccuracy: 0,
      dailyGoal: 20,
      learningLanguages: [],
      nativeLanguages: []
    };

    this.saveToStorage(this.PROFILE_KEY, defaultProfile);
    return defaultProfile;
  }

  static async updateUserProfile(userId: string, updates: Partial<UserLearningProfile>): Promise<void> {
    const profile = await this.getUserProfile(userId);
    const updatedProfile = { ...profile, ...updates };
    this.saveToStorage(this.PROFILE_KEY, updatedProfile);
  }

  // Daily statistics
  static async getDailyStats(userId: string, date: Date = new Date()): Promise<DailyStats | null> {
    const stats = this.getFromStorage<DailyStats[]>(this.STATS_KEY) || [];
    const dateStr = date.toISOString().split('T')[0];
    
    return stats.find(stat => 
      stat.date.toString().split('T')[0] === dateStr
    ) || null;
  }

  static async updateDailyStats(userId: string, correct: boolean): Promise<void> {
    const stats = this.getFromStorage<DailyStats[]>(this.STATS_KEY) || [];
    const today = new Date().toISOString().split('T')[0];
    
    let todayStats = stats.find(stat => 
      stat.date.toString().split('T')[0] === today
    );

    if (!todayStats) {
      todayStats = {
        date: new Date(),
        cardsReviewed: 0,
        cardsLearned: 0,
        correctCount: 0,
        streak: 0,
        studyTime: 0
      };
      stats.push(todayStats);
    }

    todayStats.cardsReviewed += 1;
    if (correct) todayStats.correctCount += 1;
    
    this.saveToStorage(this.STATS_KEY, stats);
    
    // Update user profile streak
    const profile = await this.getUserProfile(userId);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (profile.lastStudyDate) {
      const lastStudy = new Date(profile.lastStudyDate);
      const daysSinceLastStudy = Math.floor((new Date().getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastStudy === 1) {
        // Continuing streak
        profile.currentStreak += 1;
      } else if (daysSinceLastStudy > 1) {
        // Broken streak
        profile.currentStreak = 1;
      }
    } else {
      profile.currentStreak = 1;
    }
    
    profile.longestStreak = Math.max(profile.longestStreak, profile.currentStreak);
    profile.lastStudyDate = new Date();
    profile.totalReviews += 1;
    
    await this.updateUserProfile(userId, profile);
  }

  // Quick word save from text selection
  static async quickSaveWord(
    userId: string,
    word: string,
    translation: string,
    targetLanguage: string,
    nativeLanguage: string,
    context?: string,
    contextUrl?: string
  ): Promise<Flashcard> {
    return this.createFlashcard({
      userId,
      word,
      translation,
      targetLanguage,
      nativeLanguage,
      context,
      contextUrl,
      difficulty: 'medium',
      nextReviewAt: new Date()
    });
  }
}