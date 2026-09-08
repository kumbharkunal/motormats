'use client';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { TriangleAlert } from 'lucide-react';
import { useEffect } from 'react';

import { BRAND } from '@/features/admin/components/admin-tokens';

/**
 * Admin's own boundary. Without it a crash here falls through to
 * `src/app/error.tsx`, which is the storefront's dark, Tailwind-styled page —
 * jarring inside the panel and carrying storefront copy an operator cannot act on.
 */
export default function AdminErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The digest correlates to the server log entry; the message itself is
    // never rendered, so internal detail cannot leak to the user.
    console.error('Admin route error', error.digest);
  }, [error]);

  return (
    <Card sx={{ p: { xs: 3, sm: 5 }, maxWidth: 560 }}>
      <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Stack
          aria-hidden
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2.5,
            display: 'grid',
            placeItems: 'center',
            bgcolor: BRAND.wash,
            color: 'primary.main',
          }}
        >
          <TriangleAlert size={20} />
        </Stack>

        <Typography variant="h4" component="h1" sx={{ fontSize: { xs: 22, sm: 26 } }}>
          This screen didn&apos;t load
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Something failed while building the page. Nothing was changed. Try again — if it keeps
          happening, send the reference below to whoever maintains the store.
        </Typography>

        <Button variant="contained" onClick={reset} sx={{ minHeight: 44, px: 3, mt: 1 }}>
          Try again
        </Button>

        {error.digest ? (
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            Reference: {error.digest}
          </Typography>
        ) : null}
      </Stack>
    </Card>
  );
}
