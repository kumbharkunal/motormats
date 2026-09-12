'use client';

import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The digest correlates to the server log entry; the message itself is
    // never rendered, so internal detail cannot leak to the user.
    console.error('Route error', error.digest);
  }, [error]);

  return (
    <main
      id="main"
      className="container-page flex min-h-svh flex-col items-center justify-center text-center"
    >
      <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-accent-text uppercase">
        Something went wrong
      </p>
      <h1 className="mb-4 text-h1">We hit a bump</h1>
      <p className="mb-10 max-w-md text-body text-muted-foreground">
        This page couldn&apos;t be loaded. Try again — if it keeps happening, please contact
        support.
      </p>
      <button
        type="button"
        onClick={reset}
        className="inline-flex h-12 items-center rounded-full bg-gradient-to-br from-accent-gradient-from to-accent-gradient-to px-8 text-sm font-semibold tracking-[0.15em] text-white uppercase"
      >
        Try again
      </button>
      {error.digest ? (
        <p className="mt-6 text-xs text-subtle-foreground">Reference: {error.digest}</p>
      ) : null}
    </main>
  );
}
