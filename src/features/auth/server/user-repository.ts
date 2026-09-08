import 'server-only';

import { eq } from 'drizzle-orm';

import { db } from '@db/client';
import { users, type UserRole } from '@db/schema/identity';

import type { FirebaseIdentity } from '@/lib/auth/firebase-admin';
import { newPublicId } from '@/lib/ids';

export type ProvisionedUser = {
  id: number;
  publicId: string;
  role: UserRole;
  sessionEpoch: number;
};

export async function provisionUserFromFirebase(
  identity: FirebaseIdentity,
): Promise<ProvisionedUser> {
  const [existing] = await db
    .select({
      id: users.id,
      publicId: users.publicId,
      role: users.role,
      sessionEpoch: users.sessionEpoch,
      name: users.name,
      email: users.email,
      phone: users.phone,
      status: users.status,
    })
    .from(users)
    .where(eq(users.firebaseUid, identity.uid))
    .limit(1);

  if (existing) {
    const patch: Partial<typeof users.$inferInsert> = {};
    if (identity.phone && !existing.phone) patch.phone = identity.phone;
    if (identity.email && !existing.email) patch.email = identity.email;
    if (identity.name && !existing.name) patch.name = identity.name;

    if (Object.keys(patch).length > 0) {
      await db.update(users).set(patch).where(eq(users.id, existing.id));
    }

    return {
      id: existing.id,
      publicId: existing.publicId,
      role: existing.role,
      sessionEpoch: existing.sessionEpoch,
    };
  }

  const publicId = newPublicId();
  const [inserted] = await db.insert(users).values({
    publicId,
    firebaseUid: identity.uid,
    phone: identity.phone,
    email: identity.email,
    name: identity.name,
    role: 'customer',
    status: 'active',
  });

  return {
    id: inserted.insertId,
    publicId,
    role: 'customer',
    sessionEpoch: 0,
  };
}
