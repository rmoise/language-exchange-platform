import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

// Async thunk for updating onboarding step on server
export const updateOnboardingStep = createAsyncThunk(
  'onboarding/updateStep',
  async (step: number, { rejectWithValue }) => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]

      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/onboarding-step`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ step }),
      })

      if (!response.ok) {
        throw new Error('Failed to update onboarding step')
      }

      return step
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update step')
    }
  }
)

interface OnboardingState {
  currentStep: number
  completedSteps: number[]
  loading: boolean
  error: string | null
}

const initialState: OnboardingState = {
  currentStep: -1, // Use -1 to indicate uninitialized state
  completedSteps: [],
  loading: false,
  error: null,
}

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload
    },
    completeStep: (state, action: PayloadAction<number>) => {
      const step = action.payload
      if (!state.completedSteps.includes(step)) {
        state.completedSteps.push(step)
      }
      // Auto-advance to next step if this was the current step
      if (step === state.currentStep && step < 5) {
        state.currentStep = step + 1
      }
    },
    goToNextStep: (state) => {
      if (state.currentStep < 5) {
        state.currentStep = state.currentStep + 1
      }
    },
    goToPreviousStep: (state) => {
      if (state.currentStep > 0) {
        state.currentStep = state.currentStep - 1
      }
    },
    initializeFromUser: (state, action: PayloadAction<number>) => {
      // Initialize step from user data (server-side source of truth)
      state.currentStep = action.payload
    },
    resetOnboarding: (state) => {
      state.currentStep = 0
      state.completedSteps = []
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateOnboardingStep.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateOnboardingStep.fulfilled, (state, action) => {
        state.loading = false
        state.currentStep = action.payload
        if (!state.completedSteps.includes(action.payload)) {
          state.completedSteps.push(action.payload)
        }
      })
      .addCase(updateOnboardingStep.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const {
  setCurrentStep,
  completeStep,
  goToNextStep,
  goToPreviousStep,
  initializeFromUser,
  resetOnboarding,
} = onboardingSlice.actions

export default onboardingSlice.reducer

// Selectors
export const selectCurrentStep = (state: { onboarding: OnboardingState }) => state.onboarding.currentStep
export const selectCompletedSteps = (state: { onboarding: OnboardingState }) => state.onboarding.completedSteps
export const selectOnboardingLoading = (state: { onboarding: OnboardingState }) => state.onboarding.loading
export const selectOnboardingError = (state: { onboarding: OnboardingState }) => state.onboarding.error
export const selectIsStepCompleted = (step: number) => (state: { onboarding: OnboardingState }) =>
  state.onboarding.completedSteps.includes(step)