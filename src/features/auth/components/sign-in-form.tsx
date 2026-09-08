'use client';

import type { ConfirmationResult } from 'firebase/auth';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

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

  async function verifyOtp() {
    if (code.length !== OTP_LENGTH || !confirmation.current) return;

    setBusy(true);
    try {
      const credential = await confirmation.current.confirm(code);
      await establishSession(await credential.user.getIdToken());
      leaveForDestination();
    } catch (error) {
      toast.error(
        authErrorMessage(error, 'That code is incorrect or has expired. Request a new one.'),
      );
      setCode('');
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
    window.location.replace(next);
  }

  return (
    <div className="card-surface rounded-3xl p-6 sm:p-8">
      {step === 'phone' ? (
        <>
          <h1 className="text-h2">Sign in</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            We will text you a one-time code. No password to remember.
          </p>

          <div className="mt-6">
            <label
              htmlFor="phone"
              className="text-muted-foreground mb-1.5 block text-xs font-medium tracking-wide uppercase"
            >
              Mobile number
            </label>

            <div className="flex gap-2">
              {/* Its own box, as asked. Static rather than a picker: sign-in
                  validates Indian numbers and Firebase is handed +91, so an
                  editable country field would promise a choice that does not
                  exist yet. */}
              <div className="border-border bg-surface-elevated text-foreground flex h-12 shrink-0 items-center gap-1.5 rounded-xl border px-3.5 text-sm font-medium">
                <span aria-hidden>🇮🇳</span>
                +91
                <span className="sr-only">Country code for India</span>
              </div>

              <div
                className={cn(
                  'bg-surface flex h-12 flex-1 items-center rounded-xl border px-4 transition-colors duration-200',
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
                  <Check aria-hidden size={16} className="text-accent-text shrink-0" />
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
            <span className="bg-border h-px flex-1" />
            <span className="text-muted-foreground text-xs uppercase">or</span>
            <span className="bg-border h-px flex-1" />
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
            className="text-muted-foreground hover:text-foreground -ml-2 mb-4 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm"
          >
            <ArrowLeft aria-hidden size={16} />
            Change number
          </button>

          <h1 className="text-h2">Enter the code</h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
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
  );
}
