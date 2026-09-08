import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/** Product slugs the customer saved. Persisted locally like the cart. */
export type WishlistState = {
  slugs: string[];
  hydrated: boolean;
};

const initialState: WishlistState = { slugs: [], hydrated: false };

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    wishlistHydrated(state, action: PayloadAction<string[]>) {
      state.slugs = action.payload.filter((slug) => typeof slug === 'string' && slug.length > 0);
      state.hydrated = true;
    },
    wishlistToggled(state, action: PayloadAction<string>) {
      const index = state.slugs.indexOf(action.payload);
      if (index === -1) state.slugs.push(action.payload);
      else state.slugs.splice(index, 1);
    },
    wishlistCleared(state) {
      state.slugs = [];
    },
  },
});

export const { wishlistHydrated, wishlistToggled, wishlistCleared } = wishlistSlice.actions;
export const wishlistReducer = wishlistSlice.reducer;
