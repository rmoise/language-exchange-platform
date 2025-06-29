import { configureStore, combineReducers } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import authReducer from '@/features/auth/authSlice'
import userReducer from '@/features/user/userSlice'
import onboardingReducer from '@/features/onboarding/onboardingSlice'
import gamificationReducer from '@/features/gamification/gamificationSlice'
import flashcardReducer from '@/features/flashcards/flashcardSlice'
import { apiSlice } from '@/features/api/apiSlice'

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  onboarding: onboardingReducer,
  gamification: gamificationReducer,
  flashcards: flashcardReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
})

const persistConfig = {
  key: 'root',
  version: 3, // Increment version to trigger migration
  storage,
  whitelist: ['flashcards'], // Persist flashcards state
  blacklist: ['api'], // Don't persist RTK Query cache
  migrate: (state: any, version: number) => {
    if (version < 2) {
      // Remove theme key from persisted state
      const { theme, ...newState } = state || {}
      return Promise.resolve(newState)
    }
    if (version < 3) {
      // Add flashcards state if not present
      return Promise.resolve({
        ...state,
        flashcards: { savedFlashcards: {}, isLoading: false, error: null }
      })
    }
    return Promise.resolve(state)
  },
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const makeStore = () => {
  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }).concat(apiSlice.middleware),
  })
  
  return store
}

export const makePersistor = (store: AppStore) => persistStore(store)

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']