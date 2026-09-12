'use client';

import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  RecaptchaVerifier,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  type Auth,
  type ConfirmationResult,
} from 'firebase/auth';

import { clientEnv } from '@/lib/env.client';

function app(): FirebaseApp {
  if (getApps().length > 0) return getApp();

  return initializeApp({
    apiKey: clientEnv.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: clientEnv.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: clientEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: clientEnv.NEXT_PUBLIC_FIREBASE_APP_ID,
  });
}

export function firebaseAuth(): Auth {
  const auth = getAuth(app());
  auth.useDeviceLanguage();
  return auth;
}

// One verifier per page — a second one leaves the first registered and breaks challenges.
let verifier: RecaptchaVerifier | null = null;

export function getRecaptchaVerifier(containerId: string): RecaptchaVerifier {
  verifier ??= new RecaptchaVerifier(firebaseAuth(), containerId, { size: 'invisible' });
  return verifier;
}

export function resetRecaptcha(): void {
  verifier?.clear();
  verifier = null;
}

export async function sendOtp(e164Phone: string, containerId: string): Promise<ConfirmationResult> {
  resetRecaptcha();
  return signInWithPhoneNumber(firebaseAuth(), e164Phone, getRecaptchaVerifier(containerId));
}

const AUTH_MESSAGES: Record<string, string> = {
  'auth/popup-closed-by-user': 'Sign-in was cancelled.',
  'auth/cancelled-popup-request': 'Sign-in was cancelled.',
  'auth/user-cancelled': 'Sign-in was cancelled.',
  'auth/popup-blocked':
    'Your browser blocked the sign-in window. Allow pop-ups for this site and try again.',
  'auth/account-exists-with-different-credential':
    'That email is already registered with a different sign-in method.',
  'auth/network-request-failed': 'Network problem. Check your connection and try again.',
  'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
  'auth/billing-not-enabled': 'Sign-in by SMS is unavailable right now. Please use Google instead.',
  'auth/quota-exceeded': 'Sign-in by SMS is unavailable right now. Please use Google instead.',
  'auth/invalid-app-credential':
    'Sign-in by SMS is unavailable right now. Please use Google instead.',
  'auth/operation-not-allowed':
    'Sign-in by SMS is unavailable right now. Please use Google instead.',
  'auth/unauthorized-domain': 'Sign-in by SMS is unavailable right now. Please use Google instead.',
  'auth/captcha-check-failed': 'The security check did not pass. Please try again.',
  'auth/invalid-phone-number': 'That mobile number does not look right.',
  'auth/invalid-verification-code': 'That code is incorrect or has expired. Request a new one.',
  'auth/code-expired': 'That code has expired. Request a new one.',
  'auth/missing-verification-code': 'Enter the six-digit code we sent you.',
  // Deliberately one message for all three: telling them apart would let an
  // attacker enumerate which admin addresses exist.
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/user-not-found': 'Incorrect email or password.',
  'auth/invalid-email': 'That email address does not look right.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/missing-email': 'Enter the email address for your admin account.',
};

export function isCancelledByUser(error: unknown): boolean {
  const code = authErrorCode(error);
  return (
    code === 'auth/popup-closed-by-user' ||
    code === 'auth/cancelled-popup-request' ||
    code === 'auth/user-cancelled'
  );
}

export function authErrorMessage(error: unknown, fallback: string): string {
  const code = authErrorCode(error);
  if (code) console.error('[auth]', code, error);
  return AUTH_MESSAGES[code ?? ''] ?? fallback;
}

function authErrorCode(error: unknown): string | null {
  if (typeof error !== 'object' || error === null || !('code' in error)) return null;
  const { code } = error as { code: unknown };
  return typeof code === 'string' ? code : null;
}

export async function signInWithGoogle(): Promise<string> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const credential = await signInWithPopup(firebaseAuth(), provider);
  return credential.user.getIdToken();
}

export async function signInWithEmailPassword(email: string, password: string): Promise<string> {
  const credential = await signInWithEmailAndPassword(firebaseAuth(), email, password);
  return credential.user.getIdToken();
}

/**
 * Firebase delivers the email and hosts the reset form; this app has no mail
 * transport of its own. Note there is no server hop here, so the app's own rate
 * limiter cannot apply — Firebase's quota is the throttle.
 */
export async function sendPasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(firebaseAuth(), email);
  } catch (error) {
    // An unknown address must behave exactly like a known one, or this page
    // becomes an oracle for which admin emails exist. Every other failure
    // (network, quota, malformed address) still surfaces to the caller.
    if (authErrorCode(error) === 'auth/user-not-found') return;
    throw error;
  }
}

export type EstablishedSession = {
  publicId: string;
  role: string;
  csrfToken: string;
};

export async function establishSession(idToken: string): Promise<EstablishedSession | null> {
  const response = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof body === 'object' && body !== null && 'error' in body
        ? ((body as { error: { message?: string } }).error.message ??
          'We could not sign you in. Please try again.')
        : 'We could not sign you in. Please try again.';
    throw new Error(message);
  }

  await firebaseAuth().signOut();

  // Callers that only need the cookie ignore this; the admin form reads `role`
  // so it can explain a refusal instead of bouncing the visitor silently.
  return typeof body === 'object' && body !== null && 'data' in body
    ? ((body as { data: EstablishedSession }).data ?? null)
    : null;
}

export async function endSession(): Promise<void> {
  await fetch('/api/auth/sign-out', { method: 'POST' }).catch(() => undefined);
}
