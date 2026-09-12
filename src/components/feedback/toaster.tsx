'use client';

import { AlertTriangle, CheckCircle2, Info, Loader2, XCircle } from 'lucide-react';
import { Toaster as SonnerToaster } from 'sonner';

/**
 * The single toast surface for the whole app.
 *
 * Each state carries its own hue over an opaque tinted ground, so a toast reads
 * at a glance without leaving the brand's palette — sonner's stock `richColors`
 * are far brighter than anything else here, which is why they stay off and the
 * tints are hand-set from our own tokens.
 *
 * Colour is reinforcement, never the signal on its own: every state also ships
 * its own icon, so the meaning survives for anyone who cannot separate the hues.
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
        success: <CheckCircle2 aria-hidden className="size-4.5 !text-success" />,
        error: <XCircle aria-hidden className="size-4.5 !text-danger" />,
        warning: <AlertTriangle aria-hidden className="size-4.5 !text-warning" />,
        info: <Info aria-hidden className="size-4.5 !text-accent-text" />,
        loading: <Loader2 aria-hidden className="size-4.5 animate-spin !text-foreground/70" />,
      }}
      toastOptions={{
        classNames: {
          // Every colour needs `!`: sonner paints the toast with a `background`
          // shorthand of its own, which would otherwise reset any background
          // set here.
          //
          // Ground and border live on the per-state keys below, never here.
          // Two `!important` utilities for the same property are settled by
          // stylesheet order, not by which is more specific — a base
          // `!bg-surface` silently beat `!bg-success/12` and every toast came
          // out the same flat white.
          toast: 'group !border !rounded-2xl !gap-3 !text-foreground !shadow-raised',
          title: '!text-sm !font-semibold !text-foreground',
          description: '!text-xs !text-muted-foreground',
          actionButton:
            '!bg-accent !text-white !rounded-full !text-xs !font-semibold hover:!bg-accent-hover',
          cancelButton: '!bg-surface-elevated !text-muted-foreground !rounded-full !text-xs',
          closeButton:
            '!bg-surface-elevated !border-border !text-muted-foreground hover:!text-foreground',
          // A tint rather than a fill: the copy stays on `--color-foreground`,
          // so contrast is unchanged and only the frame carries the state.
          default: '!bg-surface !border-border-strong',
          loading: '!bg-surface !border-border-strong',
          success: '!bg-toast-success !border-success/40',
          error: '!bg-toast-error !border-danger/45',
          warning: '!bg-toast-warning !border-warning/40',
          info: '!bg-toast-info !border-accent/40',
        },
      }}
    />
  );
}
