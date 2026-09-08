import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export const MAX_QUANTITY_PER_LINE = 10;

export type CartLine = {
  variantPublicId: string;
  quantity: number;
};

export type CartState = {
  lines: CartLine[];
  hydrated: boolean;
};

const initialState: CartState = { lines: [], hydrated: false };

function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 1;
  return Math.min(MAX_QUANTITY_PER_LINE, Math.max(1, Math.trunc(quantity)));
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    cartHydrated(state, action: PayloadAction<CartLine[]>) {
      state.lines = action.payload
        .filter((line) => typeof line.variantPublicId === 'string' && line.variantPublicId.length > 0)
        .map((line) => ({ ...line, quantity: clampQuantity(line.quantity) }));
      state.hydrated = true;
    },

    itemAdded(state, action: PayloadAction<CartLine>) {
      const existing = state.lines.find(
        (line) => line.variantPublicId === action.payload.variantPublicId,
      );
      if (existing) {
        existing.quantity = clampQuantity(existing.quantity + action.payload.quantity);
        return;
      }
      state.lines.push({
        variantPublicId: action.payload.variantPublicId,
        quantity: clampQuantity(action.payload.quantity),
      });
    },

    quantityChanged(state, action: PayloadAction<CartLine>) {
      const existing = state.lines.find(
        (line) => line.variantPublicId === action.payload.variantPublicId,
      );
      if (!existing) return;
      existing.quantity = clampQuantity(action.payload.quantity);
    },

    itemRemoved(state, action: PayloadAction<string>) {
      state.lines = state.lines.filter((line) => line.variantPublicId !== action.payload);
    },

    cartCleared(state) {
      state.lines = [];
    },
  },
});

export const { cartHydrated, itemAdded, quantityChanged, itemRemoved, cartCleared } =
  cartSlice.actions;

export const cartReducer = cartSlice.reducer;
