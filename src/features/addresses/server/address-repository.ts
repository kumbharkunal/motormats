import 'server-only';

import { and, eq, isNull } from 'drizzle-orm';

import { db } from '@db/client';
import { addresses } from '@db/schema/commerce';

import type { AddressInput } from '@/features/addresses/schemas';
import { affectedRows } from '@/lib/db-result';
import { newPublicId } from '@/lib/ids';

export type SavedAddress = {
  publicId: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
};

export async function listAddresses(userId: number): Promise<SavedAddress[]> {
  return db
    .select({
      publicId: addresses.publicId,
      fullName: addresses.fullName,
      phone: addresses.phone,
      line1: addresses.line1,
      line2: addresses.line2,
      city: addresses.city,
      state: addresses.state,
      postalCode: addresses.postalCode,
      isDefault: addresses.isDefault,
    })
    .from(addresses)
    .where(and(eq(addresses.userId, userId), isNull(addresses.archivedAt)))
    .orderBy(addresses.isDefault, addresses.id);
}

export async function createAddress(userId: number, input: AddressInput): Promise<string> {
  const publicId = newPublicId();

  await db.transaction(async (tx) => {
    // Exactly one default per user.
    if (input.isDefault) {
      await tx.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, userId));
    }

    const existing = await tx
      .select({ id: addresses.id })
      .from(addresses)
      .where(and(eq(addresses.userId, userId), isNull(addresses.archivedAt)))
      .limit(1);

    await tx.insert(addresses).values({
      publicId,
      userId,
      fullName: input.fullName,
      phone: input.phone,
      line1: input.line1,
      line2: input.line2 || null,
      city: input.city,
      state: input.state,
      postalCode: input.postalCode,
      // The first address a customer saves becomes their default.
      isDefault: input.isDefault ?? existing.length === 0,
    });
  });

  return publicId;
}

export async function archiveAddress(userId: number, publicId: string): Promise<boolean> {
  const result = await db
    .update(addresses)
    .set({ archivedAt: new Date() })
    .where(and(eq(addresses.publicId, publicId), eq(addresses.userId, userId)));

  return affectedRows(result) > 0;
}
