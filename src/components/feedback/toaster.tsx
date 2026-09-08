'use client';

import { AlertTriangle, CheckCircle2, Info, Loader2, XCircle } from 'lucide-react';
import { Toaster as SonnerToaster } from 'sonner';

/**
 * The single toast surface for the whole app.
 *
 * The palette is the brand's: near-black surface, white copy, red for anything
 * that needs attention. Sonner's stock green/amber states were the only colours
 * on the storefront that belonged to no token.
 *
 * State is carried by the icon rather than by hue — red reads as "look here"
 * for both errors and warnings, and colour alone was never a safe signal for
 * anyone who cannot separate red from green.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      closeButton
      richColors={false}
      // Long enough to read an error, short enough not to linger.
      duration={4500}
      icons={{
        // `!` again: sonner colours its own icon slot, and would otherwise win.
        success: <CheckCircle2 aria-hidden className="!text-foreground size-4.5" />,
        error: <XCircle aria-hidden className="!text-accent-text size-4.5" />,
        warning: <AlertTriangle aria-hidden className="!text-accent-text size-4.5" />,
        info: <Info aria-hidden className="!text-foreground/70 size-4.5" />,
        loading: <Loader2 aria-hidden className="!text-foreground/70 size-4.5 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          // Every colour needs `!`: sonner paints the toast with a `background`
          // shorthand of its own, which would otherwise reset any background
          // set here (an unprefixed `card-surface` renders a white toast).
          toast:
            'group !bg-surface !border !border-border-strong !rounded-2xl !gap-3 !text-foreground !shadow-[0_16px_50px_rgba(0,0,0,0.65)]',
          title: '!text-sm !font-semibold !text-foreground',
          description: '!text-xs !text-muted-foreground',
          actionButton:
            '!bg-accent !text-white !rounded-full !text-xs !font-semibold hover:!bg-accent-hover',
          cancelButton: '!bg-white/5 !text-muted-foreground !rounded-full !text-xs',
          closeButton:
            '!bg-surface-elevated !border-border !text-muted-foreground hover:!text-foreground',
          // Only the state that needs attention takes the brand red.
          error: '!border-accent/45',
          warning: '!border-accent/45',
          success: '!border-border-strong',
        },
      }}
    />
  );
}
