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
          background: '#0A0A0B',
          color: '#F5F5F4',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Motormats is temporarily unavailable</h1>
        <p style={{ color: '#A1A1AA', margin: 0 }}>Please refresh the page in a moment.</p>
        {error.digest ? (
          <p style={{ color: '#71717A', fontSize: '0.75rem', margin: 0 }}>
            Reference: {error.digest}
          </p>
        ) : null}
      </body>
    </html>
  );
}
