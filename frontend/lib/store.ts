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
import themeReducer from '@/features/theme/themeSlice'
import { apiSlice } from '@/features/api/apiSlice'

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  onboarding: onboardingReducer,
  theme: themeReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
})

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['theme'], // Only persist theme state
  blacklist: ['api'], // Don't persist RTK Query cache
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