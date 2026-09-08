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
      <p className="text-accent-text mb-4 text-xs font-semibold tracking-[0.2em] uppercase">
        Something went wrong
      </p>
      <h1 className="text-h1 mb-4">We hit a bump</h1>
      <p className="text-body text-muted-foreground mb-10 max-w-md">
        This page couldn&apos;t be loaded. Try again — if it keeps happening, please contact support.
      </p>
      <button
        type="button"
        onClick={reset}
        className="from-accent-gradient-from to-accent-gradient-to inline-flex h-12 items-center rounded-full bg-gradient-to-br px-8 text-sm font-semibold tracking-[0.15em] text-white uppercase"
      >
        Try again
      </button>
      {error.digest ? (
        <p className="text-subtle-foreground mt-6 text-xs">Reference: {error.digest}</p>
      ) : null}
    </main>
  );
}
