'use client';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100svh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          // Hardcoded rather than tokenised: this replaces <html> when the root
          // layout itself has failed, so globals.css may never have loaded.
          // Keep these in step with --color-background / --color-foreground.
          background: '#F6F7F9',
          color: '#101828',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Motormats is temporarily unavailable</h1>
        <p style={{ color: '#475467', margin: 0 }}>Please refresh the page in a moment.</p>
        {error.digest ? (
          <p style={{ color: '#667085', fontSize: '0.75rem', margin: 0 }}>
            Reference: {error.digest}
          </p>
        ) : null}
      </body>
    </html>
  );
}
