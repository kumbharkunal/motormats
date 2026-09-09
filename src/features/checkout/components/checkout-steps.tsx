'use client';

import { Check } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';

import { cn } from '@/lib/utils';

const STEPS = [
  { label: 'Cart', match: (path: string) => path === '/cart' },
  { label: 'Checkout', match: (path: string) => path === '/checkout' },
  { label: 'Confirmation', match: (path: string) => path.startsWith('/orders/') },
] as const;

/**
 * Where you are in placing an order.
 *
 * Lives in the `(checkout)` layout rather than `FocusedShell`, which the
 * `(account)` group also renders — a checkout stepper has no business on the
 * account pages.
 *
 * It also hides itself on an order page that was not just reached by paying:
 * `/orders/:id` doubles as the receipt for any past order, and opening one from
 * "My orders" months later should not claim you are mid-checkout.
 */
export function CheckoutSteps() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const current = STEPS.findIndex((step) => step.match(pathname));
  if (current === -1) return null;

  const isReceipt = pathname.startsWith('/orders/');
  if (isReceipt && searchParams.get('placed') !== '1') return null;

  return (
    <nav
      aria-label="Checkout progress"
      // Sticks directly below the header, and declares an exact height so
      // anything stacking under it can offset by the same variable.
      className="sticky top-[var(--header-height)] z-30 h-[var(--checkout-steps-height)] border-b border-border bg-background"
    >
      <ol className="container-page flex h-full items-center gap-2 sm:gap-3">
        {STEPS.map((step, index) => {
          const done = index < current;
          const active = index === current;

          return (
            <li
              key={step.label}
              className="flex min-w-0 flex-1 items-center gap-2 last:flex-none sm:gap-3"
              aria-current={active ? 'step' : undefined}
            >
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full text-[0.6875rem] font-bold transition-colors duration-300',
                  done && 'bg-accent text-white',
                  active && 'border-2 border-accent text-accent-text',
                  !done && !active && 'border border-border text-subtle-foreground',
                )}
              >
                {done ? <Check aria-hidden size={13} strokeWidth={3} /> : index + 1}
              </span>

              <span
                className={cn(
                  'truncate text-xs font-medium tracking-wide transition-colors duration-300 sm:text-sm',
                  active ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {step.label}
                {done ? <span className="sr-only"> (completed)</span> : null}
              </span>

              {/* The connector fills the gap to the next step, so progress reads
                  left to right even when the labels truncate on a phone. */}
              {index < STEPS.length - 1 ? (
                <span
                  aria-hidden
                  className={cn(
                    'ml-1 h-px min-w-3 flex-1 transition-colors duration-300',
                    done ? 'bg-accent' : 'bg-border',
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
