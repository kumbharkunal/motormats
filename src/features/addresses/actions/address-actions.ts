'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { addressInputSchema } from '@/features/addresses/schemas';
import {
  archiveAddress,
  createAddress,
  listAddresses,
  type SavedAddress,
} from '@/features/addresses/server/address-repository';
import { createAction } from '@/lib/api/action';

export const createAddressAction = createAction({
  input: addressInputSchema,
  auth: true,
  handler: async ({ input, user }): Promise<{ publicId: string }> => {
    const publicId = await createAddress(user.id, input);
    revalidatePath('/checkout');
    revalidatePath('/account/addresses');
    return { publicId };
  },
});

export const listAddressesAction = createAction({
  auth: true,
  handler: async ({ user }): Promise<SavedAddress[]> => listAddresses(user.id),
});

export const deleteAddressAction = createAction({
  input: z.object({ publicId: z.string().min(1).max(64) }),
  auth: true,
  handler: async ({ input, user }): Promise<{ deleted: boolean }> => {
    const deleted = await archiveAddress(user.id, input.publicId);
    revalidatePath('/checkout');
    revalidatePath('/account/addresses');
    return { deleted };
  },
});
