'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';

import { BrandLoader } from '@/components/feedback/brand-loader';

import { AdminAuthLayout, QUIET_LINK } from './admin-auth-layout';
import {
  authErrorMessage,
  endSession,
  establishSession,
  signInWithEmailPassword,
} from '@/lib/auth/firebase-client';
import { isAdminRole, isUserRole } from '@/lib/auth/rbac';

const PROVIDER_ERROR =
  'That session was created with a different sign-in method. Use your admin email and password.';

export function AdminSignInForm({ next, initialError }: { next: string; initialError?: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  /** Set once the session is confirmed and the document is on its way out. */
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState(initialError === 'provider' ? PROVIDER_ERROR : '');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  function validate(): boolean {
    const nextEmailError = !email.trim()
      ? 'Enter your admin email.'
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
        ? 'That email address does not look right.'
        : '';
    const nextPasswordError = password ? '' : 'Enter your password.';

    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    return !nextEmailError && !nextPasswordError;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setError('');
    if (!validate()) return;

    setPending(true);
    try {
      const idToken = await signInWithEmailPassword(email.trim(), password);
      const session = await establishSession(idToken);

      // The layout would refuse them anyway, but bouncing to the storefront with
      // no explanation reads as a broken page. Say why, and leave no session behind.
      if (!session || !isUserRole(session.role) || !isAdminRole(session.role)) {
        await endSession();
        setPassword('');
        setError('This account does not have admin access.');
        return;
      }

      // A full document load, not `router.replace`: the App Router still holds
      // the RSC payload it cached for `next` while signed out, which is the
      // redirect back to this page.
      setLeaving(true);
      // Commit the overlay to the screen before asking for the new document.
      // Navigating in the same tick races React’s paint against the unload;
      // two frames put the paint first, so it cannot be lost to that race.
      requestAnimationFrame(() => requestAnimationFrame(() => window.location.replace(next)));
    } catch (cause) {
      setPassword('');
      setError(
        cause instanceof Error && !('code' in cause)
          ? cause.message
          : authErrorMessage(cause, 'Sign-in failed. Please try again.'),
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      {leaving ? <BrandLoader label="Opening the admin panel…" /> : null}

      <AdminAuthLayout
        title="Sign in"
        subtitle="Use the email and password issued for your admin account."
        footer={{ href: '/', label: 'Back to store' }}
      >
        <Collapse in={Boolean(error)} unmountOnExit>
          <Alert severity="error" role="alert" sx={{ mb: 2.5, borderRadius: 2.5 }}>
            {error}
          </Alert>
        </Collapse>

        <form
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
          noValidate
        >
          <Stack spacing={2.25}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={Boolean(emailError)}
              helperText={emailError}
              autoComplete="email"
              autoFocus
              fullWidth
              disabled={pending}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={17} aria-hidden />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              error={Boolean(passwordError)}
              helperText={passwordError}
              autoComplete="current-password"
              fullWidth
              disabled={pending}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={17} aria-hidden />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((value) => !value)}
                        edge="end"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        sx={{ width: 44, height: 44 }}
                      >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -0.5, ...QUIET_LINK }}>
              <Link href="/admin/forgot-password">Forgot password?</Link>
            </Box>

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={pending}
              sx={{ minHeight: 48, fontSize: 15 }}
              startIcon={
                pending ? <CircularProgress size={16} color="inherit" thickness={5} /> : null
              }
            >
              {pending ? 'Signing in…' : 'Sign in'}
            </Button>
          </Stack>
        </form>
      </AdminAuthLayout>
    </>
  );
}
