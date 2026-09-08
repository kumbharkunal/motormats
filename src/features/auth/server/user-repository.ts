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

const identityColumns = {
  id: users.id,
  publicId: users.publicId,
  role: users.role,
  sessionEpoch: users.sessionEpoch,
  firebaseUid: users.firebaseUid,
  name: users.name,
  email: users.email,
  phone: users.phone,
  status: users.status,
};

export async function provisionUserFromFirebase(
  identity: FirebaseIdentity,
): Promise<ProvisionedUser> {
  const [byUid] = await db
    .select(identityColumns)
    .from(users)
    .where(eq(users.firebaseUid, identity.uid))
    .limit(1);

  /**
   * A Firebase account that was deleted and remade returns with a new uid but
   * the same phone number. `phone` is unique, so falling through to the insert
   * fails the constraint and the whole sign-in 500s. Match on the number and
   * re-link instead: Firebase only mints a phone-provider token after the OTP
   * succeeds, so the number is proven to belong to whoever is signing in.
   */
  const [byPhone] = byUid || !identity.phone
    ? []
    : await db.select(identityColumns).from(users).where(eq(users.phone, identity.phone)).limit(1);

  const existing = byUid ?? byPhone;

  if (existing) {
    const relinking = existing.firebaseUid !== identity.uid;

    const patch: Partial<typeof users.$inferInsert> = {};
    if (relinking) patch.firebaseUid = identity.uid;
    if (identity.phone && !existing.phone) patch.phone = identity.phone;
    if (identity.email && !existing.email) patch.email = identity.email;
    if (identity.name && !existing.name) patch.name = identity.name;

    // The account is being attached to a different Firebase identity, so any
    // session issued against the old one must stop verifying immediately.
    const sessionEpoch = relinking ? existing.sessionEpoch + 1 : existing.sessionEpoch;
    if (relinking) patch.sessionEpoch = sessionEpoch;

    if (Object.keys(patch).length > 0) {
      await db.update(users).set(patch).where(eq(users.id, existing.id));
    }

    return {
      id: existing.id,
      publicId: existing.publicId,
      role: existing.role,
      sessionEpoch,
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
