'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Mail, MailCheck } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

import { AdminAuthLayout } from './admin-auth-layout';
import { authErrorMessage, sendPasswordReset } from '@/lib/auth/firebase-client';

/** Matches the OTP form's resend delay. A courtesy, not a security control. */
const RESEND_SECONDS = 30;

const SENT_MESSAGE =
  'If an account exists for that address, a reset link is on its way. Check your inbox, and your spam folder.';

export function AdminForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function submit(address: string) {
    setError('');
    setPending(true);
    try {
      await sendPasswordReset(address);
      setSent(true);
      setCooldown(RESEND_SECONDS);
    } catch (cause) {
      setError(authErrorMessage(cause, 'Could not send the reset email. Please try again.', 'password'));
    } finally {
      setPending(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const address = email.trim();
    const nextEmailError = !address
      ? 'Enter the email address for your admin account.'
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)
        ? 'That email address does not look right.'
        : '';

    setEmailError(nextEmailError);
    if (nextEmailError) return;

    await submit(address);
  }

  if (sent) {
    return (
      <AdminAuthLayout
        title="Check your email"
        subtitle="The link opens a secure page where you can set a new password."
        footer={{ href: '/admin/sign-in', label: 'Back to sign in' }}
      >
        <Alert
          icon={<MailCheck size={19} />}
          severity="success"
          role="status"
          sx={{ borderRadius: 2.5, alignItems: 'center' }}
        >
          {SENT_MESSAGE}
        </Alert>

        <Typography
          variant="body2"
          sx={{ mt: 2.5, color: 'text.secondary', wordBreak: 'break-word' }}
        >
          Sent to{' '}
          <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>
            {email.trim()}
          </Box>
        </Typography>

        <Collapse in={Boolean(error)} unmountOnExit>
          <Alert severity="error" role="alert" sx={{ mt: 2.5, borderRadius: 2.5 }}>
            {error}
          </Alert>
        </Collapse>

        <Button
          variant="outlined"
          fullWidth
          disabled={pending || cooldown > 0}
          onClick={() => void submit(email.trim())}
          sx={{ minHeight: 48, fontSize: 14.5, mt: 3 }}
          startIcon={pending ? <CircularProgress size={16} color="inherit" thickness={5} /> : null}
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : pending ? 'Sending…' : 'Resend email'}
        </Button>
      </AdminAuthLayout>
    );
  }

  return (
    <AdminAuthLayout
      title="Reset password"
      subtitle="Enter your admin email and we will send you a link to set a new password."
      footer={{ href: '/admin/sign-in', label: 'Back to sign in' }}
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
            {pending ? 'Sending…' : 'Send reset link'}
          </Button>
        </Stack>
      </form>
    </AdminAuthLayout>
  );
}
