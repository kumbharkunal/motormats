import { Suspense } from 'react';
import type { ReactNode } from 'react';

import { FocusedShell } from '@/components/layout/focused-shell';
import { CheckoutSteps } from '@/features/checkout/components/checkout-steps';

/**
 * Purchase funnel — cart, checkout and the order receipt. No footer; see
 * FocusedShell. Route groups do not appear in the URL, so `/cart`, `/checkout`
 * and `/orders/:id` are unchanged.
 *
 * The stepper sits here rather than in `FocusedShell` because the `(account)`
 * group shares that shell and has no checkout to report progress through.
 */
export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return (
    <FocusedShell>
      {/* `useSearchParams` inside would otherwise opt every route in this group
          out of static rendering. */}
      <Suspense fallback={null}>
        <CheckoutSteps />
      </Suspense>
      {children}
    </FocusedShell>
  );
}
