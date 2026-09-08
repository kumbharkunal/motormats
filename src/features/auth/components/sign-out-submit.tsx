'use client';

import { useFormStatus } from 'react-dom';

import { BrandLoader } from '@/components/feedback/brand-loader';
import { Button } from '@/components/ui/button';

/**
 * The sign-out button and its pending state.
 *
 * Split out of `SignOutConfirm` because `useFormStatus` only reports for a form
 * rendered by an ancestor — it has to live inside the `<form>`, in a Client
 * Component. The server action itself stays on the server.
 *
 * The action revokes the refresh token, clears the cookies, writes an audit row
 * and then redirects, which is several round trips. Without this the button sat
 * idle through all of it and the page looked untouched.
 */
export function SignOutSubmit() {
  const { pending } = useFormStatus();

  return (
    <>
      {pending ? <BrandLoader label="Signing you out…" /> : null}

      <Button type="submit" size="lg" className="w-full" disabled={pending} isLoading={pending}>
        Sign out
      </Button>
    </>
  );
}
