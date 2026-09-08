'use client';

import type { ConfirmationResult } from 'firebase/auth';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { BrandLoader } from '@/components/feedback/brand-loader';
import { Button } from '@/components/ui/button';
import { GoogleMark } from '@/features/auth/components/google-mark';
import { OtpInput } from '@/features/auth/components/otp-input';
import { cn } from '@/lib/utils';
import {
  authErrorMessage,
  establishSession,
  isCancelledByUser,
  resetRecaptcha,
  sendOtp,
  signInWithGoogle,
} from '@/lib/auth/firebase-client';

const RECAPTCHA_CONTAINER = 'recaptcha-container';
const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

/**
 * Phone-first sign-in, with Google as the alternative.
 *
 * Firebase authenticates; the app then issues its own session cookie. Errors
 * are deliberately generic — "that code is incorrect or has expired" — because
 * distinguishing "wrong code" from "unknown number" tells an attacker which
 * numbers are registered.
 */
export function SignInForm({ next }: { next: string }) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  /** Set once sign-in has succeeded and the document is on its way out. */
  const [leaving, setLeaving] = useState(false);
  /** True while the SMS is still being requested behind the code screen. */
  const [sending, setSending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const confirmation = useRef<ConfirmationResult | null>(null);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  // The verifier is bound to a DOM node, so it must not outlive this screen.
  useEffect(() => resetRecaptcha, []);

  const digits = phone.replace(/\D/g, '');
  const phoneValid = /^[6-9]\d{9}$/.test(digits);

  async function requestOtp() {
    if (!phoneValid) {
      toast.error('Enter a valid 10-digit mobile number.');
      return;
    }

    setBusy(true);
    setSending(true);
    // Move to the code screen before the network call, not after. Sending an
    // SMS involves a reCAPTCHA round trip, and waiting on it left the button
    // spinning on a screen that gave no sign anything had happened. The verify
    // control below stays disabled until the confirmation actually arrives.
    setStep('otp');
    setCode('');

    try {
      confirmation.current = await sendOtp('+91' + digits, RECAPTCHA_CONTAINER);
      setSecondsLeft(RESEND_SECONDS);
      toast.success('Code sent to +91 ' + digits);
    } catch (error) {
      // Nothing is on its way, so do not leave them staring at a code field.
      setStep('phone');
      confirmation.current = null;
      // Firebase surfaces quota and configuration detail that is not the
      // customer's problem, so only the codes they can act on are shown.
      resetRecaptcha();
      toast.error(
        authErrorMessage(error, 'We could not send the code. Please try again in a moment.'),
      );
    } finally {
      setBusy(false);
      setSending(false);
    }
  }

  /**
   * Two failures with two different causes, so two catches.
   *
   * Firebase checking the code and this app issuing its own session are
   * separate steps. Reporting both as "that code is incorrect" sends someone to
   * request a new code when the code was never the problem — and hides a server
   * outage behind a message that blames the customer.
   */
  async function verifyOtp() {
    if (code.length !== OTP_LENGTH || !confirmation.current) return;

    setBusy(true);

    let idToken: string;
    try {
      const credential = await confirmation.current.confirm(code);
      idToken = await credential.user.getIdToken();
    } catch (error) {
      // Deliberately generic: distinguishing "wrong code" from "unknown number"
      // tells an attacker which numbers are registered.
      toast.error(
        authErrorMessage(error, 'That code is incorrect or has expired. Request a new one.'),
      );
      setCode('');
      setBusy(false);
      return;
    }

    try {
      await establishSession(idToken);
      leaveForDestination();
    } catch (error) {
      // The code was right; this is our side failing. `establishSession` throws
      // with the server's own mapped message, so surface that.
      toast.error(authErrorMessage(error, 'We could not complete your sign-in. Please try again.'));
      // The confirmation is spent, so verifying again cannot work — clear the
      // cooldown to make "Resend code" the immediate way out.
      setCode('');
      setSecondsLeft(0);
      setBusy(false);
    }
  }

  async function googleSignIn() {
    setBusy(true);
    try {
      await establishSession(await signInWithGoogle());
      leaveForDestination();
    } catch (error) {
      // Closing the popup is a choice, not a failure worth shouting about.
      if (!isCancelledByUser(error)) {
        toast.error(authErrorMessage(error, 'Google sign-in did not complete.'));
      }
      setBusy(false);
    }
  }

  /**
   * A full document load, not `router.replace`.
   *
   * The session cookie only exists as of the fetch that just returned, and the
   * App Router still holds the RSC payload it cached for `next` while the
   * visitor was signed out — that payload is the redirect back to this page. A
   * soft navigation replays it, `proxy.ts` bounces to /sign-in, and the two
   * pages redirect at each other behind a blank screen. Reloading discards the
   * router cache and re-runs the proxy with the cookie present.
   *
   * `busy` is deliberately left set: the document is on its way out, and
   * re-enabling the button invites a second submission mid-navigation.
   */
  function leaveForDestination() {
    setLeaving(true);
    // Commit the overlay to the screen before asking for the new document.
    // Navigating in the same tick races React’s paint against the unload;
    // two frames put the paint first, so it cannot be lost to that race.
    requestAnimationFrame(() => requestAnimationFrame(() => window.location.replace(next)));
  }

  return (
    <>
      {leaving ? <BrandLoader label="Signing you in…" /> : null}

      <div className="rounded-3xl card-surface p-6 sm:p-8">
        {step === 'phone' ? (
          <>
            <h1 className="text-h2">Sign in</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We will text you a one-time code. No password to remember.
            </p>

            <div className="mt-6">
              <label
                htmlFor="phone"
                className="mb-1.5 block text-xs font-medium tracking-wide text-muted-foreground uppercase"
              >
                Mobile number
              </label>

              <div className="flex gap-2">
                {/* Its own box, as asked. Static rather than a picker: sign-in
                  validates Indian numbers and Firebase is handed +91, so an
                  editable country field would promise a choice that does not
                  exist yet. */}
                <div className="flex h-12 shrink-0 items-center gap-1.5 rounded-xl border border-border bg-surface-elevated px-3.5 text-sm font-medium text-foreground">
                  <span aria-hidden>🇮🇳</span>
                  +91
                  <span className="sr-only">Country code for India</span>
                </div>

                <div
                  className={cn(
                    'flex h-12 flex-1 items-center rounded-xl border bg-surface px-4 transition-colors duration-200',
                    phoneFocused ? 'border-accent bg-accent/5' : 'border-border',
                  )}
                >
                  <input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={10}
                    value={digits}
                    onFocus={() => setPhoneFocused(true)}
                    onBlur={() => setPhoneFocused(false)}
                    onChange={(event) => setPhone(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') void requestOtp();
                    }}
                    placeholder="98765 43210"
                    className="w-full bg-transparent text-sm tracking-wide outline-none"
                  />
                  {phoneValid ? (
                    <Check aria-hidden size={16} className="shrink-0 text-accent-text" />
                  ) : null}
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="mt-5 w-full"
              onClick={() => void requestOtp()}
              isLoading={busy}
              disabled={!phoneValid}
            >
              Send code
            </Button>

            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground uppercase">or</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <Button
              variant="ghost"
              size="lg"
              className="w-full gap-3 tracking-normal normal-case"
              onClick={() => void googleSignIn()}
              disabled={busy}
            >
              <GoogleMark size={18} />
              Continue with Google
            </Button>
          </>
        ) : (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: [0.165, 0.84, 0.44, 1] }}
          >
            <button
              type="button"
              onClick={() => {
                // The old confirmation belongs to the previous number; keeping it
                // would let a code for that number verify against this screen.
                confirmation.current = null;
                resetRecaptcha();
                setStep('phone');
                setCode('');
                setSecondsLeft(0);
              }}
              className="mb-4 -ml-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft aria-hidden size={16} />
              Change number
            </button>

            <h1 className="text-h2">Enter the code</h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              {sending ? (
                <>
                  <Loader2 aria-hidden size={14} className="animate-spin" />
                  Sending a code to +91 {digits}…
                </>
              ) : (
                <>Sent to +91 {digits}. It expires shortly.</>
              )}
            </p>

            <div className="mt-6">
              <OtpInput
                label="One-time code"
                value={code}
                onChange={setCode}
                length={OTP_LENGTH}
                disabled={sending}
                // Six digits in means they are done; make them press nothing.
                onComplete={() => void verifyOtp()}
              />
            </div>

            <Button
              size="lg"
              className="mt-5 w-full"
              onClick={() => void verifyOtp()}
              isLoading={busy && !sending}
              disabled={code.length !== OTP_LENGTH || sending}
            >
              Verify and continue
            </Button>

            <Button
              variant="ghost"
              className="mt-3 w-full"
              onClick={() => void requestOtp()}
              disabled={busy || secondsLeft > 0}
            >
              {secondsLeft > 0 ? 'Resend in ' + secondsLeft + 's' : 'Resend code'}
            </Button>
          </motion.div>
        )}

        {/* Invisible reCAPTCHA mounts here; Firebase requires a real element. */}
        <div id={RECAPTCHA_CONTAINER} />
      </div>
    </>
  );
}
