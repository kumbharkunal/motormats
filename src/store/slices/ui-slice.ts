import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/**
 * Cross-feature UI state — things several unrelated components need to agree
 * on. Anything only one component cares about stays in that component.
 */
export type UiState = {
  cartDrawerOpen: boolean;
  /** Bumped on each add-to-cart for header microinteraction. */
  cartNudgeAt: number;
};

const initialState: UiState = { cartDrawerOpen: false, cartNudgeAt: 0 };

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    cartDrawerToggled(state, action: PayloadAction<boolean | undefined>) {
      state.cartDrawerOpen = action.payload ?? !state.cartDrawerOpen;
    },
    cartNudgeTriggered(state) {
      state.cartNudgeAt = Date.now();
    },
  },
});

export const { cartDrawerToggled, cartNudgeTriggered } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
