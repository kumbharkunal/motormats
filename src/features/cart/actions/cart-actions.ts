'use server';

import { z } from 'zod';

import {
  resolveCart,
  type ResolvedCart,
  type ResolvedCartLine,
} from '@/features/cart/server/resolve-cart';
import { createAction } from '@/lib/api/action';

export type ClientCartLine = Omit<ResolvedCartLine, 'variantId'>;
export type ClientCart = Omit<ResolvedCart, 'lines'> & { lines: ClientCartLine[] };

const cartLineSchema = z.object({
  variantPublicId: z.string().min(1).max(64),
  quantity: z.number().int().min(1).max(10),
});

const resolveCartSchema = z.object({
  lines: z.array(cartLineSchema).max(50),
});

export const resolveCartAction = createAction({
  input: resolveCartSchema,
  handler: async ({ input }): Promise<ClientCart> => {
    const cart = await resolveCart(input.lines);
    return {
      ...cart,
      lines: cart.lines.map(({ variantId: _variantId, ...line }) => line),
    };
  },
});
