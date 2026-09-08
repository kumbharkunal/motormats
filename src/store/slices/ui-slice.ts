import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/**
 * Cross-feature UI state — things several unrelated components need to agree
 * on. Anything only one component cares about stays in that component.
 */
export type UiState = {
  cartDrawerOpen: boolean;
};

const initialState: UiState = { cartDrawerOpen: false };

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    cartDrawerToggled(state, action: PayloadAction<boolean | undefined>) {
      state.cartDrawerOpen = action.payload ?? !state.cartDrawerOpen;
    },
  },
});

export const { cartDrawerToggled } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
