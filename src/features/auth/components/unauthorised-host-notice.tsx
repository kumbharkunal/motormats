'use client';

import { useSyncExternalStore } from 'react';

import { isDevelopment } from '@/lib/build-env';

/**
 * Why sign-in does nothing when the site is opened on a LAN address.
 *
 * Both sign-in paths go through Firebase, and Firebase refuses either one from
 * an origin that is not on its **authorised domains** list: `signInWithPopup`
 * opens a window that closes immediately, and the invisible reCAPTCHA behind the
 * SMS code fails its challenge. The project ships with `localhost` authorised
 * and nothing else, so the moment the dev server is opened from a phone on
 * `http://10.124.72.46:3000` — which is the only way to test any of this on a
 * real device — both buttons stop working, and the error Firebase returns is
 * `auth/unauthorized-domain`, which says nothing a reader could act on.
 *
 * There is no code fix. The host has to be added in the Firebase console, so
 * this says which host and where, instead of leaving it to be rediscovered.
 *
 * **Development only, and belt and braces about it.** `isDevelopment` is a
 * constant the bundler inlines, so the whole component is dead code in a
 * production build; the hostname check then means it stays quiet on localhost
 * even in development. It must never reach a customer — it names infrastructure.
 */

const LOCAL = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

const subscribe = () => () => {};
const readHost = () => window.location.hostname;
const noHost = () => '';

export function UnauthorisedHostNotice() {
  const hostname = useSyncExternalStore(subscribe, readHost, noHost);

  if (!isDevelopment) return null;
  if (!hostname || LOCAL.has(hostname)) return null;

  return (
    <div className="mb-5 border border-warning/40 bg-toast-warning p-4 text-xs leading-relaxed text-foreground">
      <p className="font-semibold">Sign-in will fail on this address.</p>
      <p className="mt-1.5 text-muted-foreground">
        Firebase only accepts sign-in from an authorised domain, and{' '}
        <code className="text-foreground">{hostname}</code> is not one. Add it under{' '}
        <strong className="font-medium text-foreground">
          Firebase console → Authentication → Settings → Authorised domains
        </strong>
        , or use <code className="text-foreground">localhost:3000</code> instead. This notice is
        development-only.
      </p>
    </div>
  );
}
