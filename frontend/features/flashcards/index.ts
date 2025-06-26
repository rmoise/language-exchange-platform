// Components
export { FlashcardDisplay } from './components/FlashcardDisplay';
export { FlashcardReview } from './components/FlashcardReview';
export { LearningDashboard } from './components/LearningDashboard';
export { TextSelectionHandler } from './components/TextSelectionHandler';
export { SidebarLearningWidget } from './components/SidebarLearningWidget';
export { GamificationBadges } from './components/GamificationBadges';

// Service
export { FlashcardService } from './flashcardService';

// Types
export type {
  Flashcard,
  FlashcardReview as FlashcardReviewType,
  DailyStats,
  UserLearningProfile,
  VocabularyList,
  SRSParameters,
  FlashcardDeck
} from './types';