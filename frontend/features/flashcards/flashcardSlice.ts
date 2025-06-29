import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SavedFlashcard {
  messageId: string;
  flashcardId: string;
  originalText: string;
  translatedText: string;
  savedAt: string;
}

interface FlashcardState {
  savedFlashcards: Record<string, SavedFlashcard>; // messageId -> flashcard info
  isLoading: boolean;
  error: string | null;
}

const initialState: FlashcardState = {
  savedFlashcards: {},
  isLoading: false,
  error: null,
};

const flashcardSlice = createSlice({
  name: 'flashcards',
  initialState,
  reducers: {
    saveFlashcard: (state, action: PayloadAction<SavedFlashcard>) => {
      state.savedFlashcards[action.payload.messageId] = action.payload;
    },
    removeFlashcard: (state, action: PayloadAction<string>) => {
      delete state.savedFlashcards[action.payload];
    },
    setFlashcards: (state, action: PayloadAction<SavedFlashcard[]>) => {
      state.savedFlashcards = {};
      action.payload.forEach(flashcard => {
        state.savedFlashcards[flashcard.messageId] = flashcard;
      });
    },
    clearFlashcards: (state) => {
      state.savedFlashcards = {};
    },
  },
});

export const { saveFlashcard, removeFlashcard, setFlashcards, clearFlashcards } = flashcardSlice.actions;

// Selectors
export const selectIsMessageSaved = (state: { flashcards: FlashcardState }, messageId: string) => 
  !!state.flashcards.savedFlashcards[messageId];

export const selectSavedFlashcard = (state: { flashcards: FlashcardState }, messageId: string) => 
  state.flashcards.savedFlashcards[messageId];

export const selectAllSavedFlashcards = (state: { flashcards: FlashcardState }) => 
  Object.values(state.flashcards.savedFlashcards);

export default flashcardSlice.reducer;