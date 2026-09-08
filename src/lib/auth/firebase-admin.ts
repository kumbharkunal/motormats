import 'server-only';

import { cert, getApp, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';

import { serverEnv } from '../env.server';

function adminApp(): App {
  const existing = getApps();
  if (existing.length > 0) return getApp();

  return initializeApp({
    credential: cert({
      projectId: serverEnv.FIREBASE_PROJECT_ID,
      clientEmail: serverEnv.FIREBASE_CLIENT_EMAIL,
      privateKey: serverEnv.FIREBASE_PRIVATE_KEY,
    }),
  });
}

// checkRevoked: true costs one network round trip, but this runs only once per sign-in.
export async function verifyFirebaseIdToken(idToken: string): Promise<DecodedIdToken | null> {
  try {
    return await getAuth(adminApp()).verifyIdToken(idToken, true);
  } catch {
    return null;
  }
}

export type FirebaseIdentity = {
  uid: string;
  phone: string | null;
  email: string | null;
  name: string | null;
  signInProvider: string | null;
};

export function toIdentity(decoded: DecodedIdToken): FirebaseIdentity {
  const provider = decoded.firebase?.sign_in_provider ?? null;
  return {
    uid: decoded.uid,
    phone: decoded.phone_number ?? null,
    email: decoded.email ?? null,
    name: typeof decoded.name === 'string' ? decoded.name : null,
    signInProvider: provider,
  };
}
