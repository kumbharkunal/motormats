import type { ReactNode } from 'react';

import { FocusedShell } from '@/components/layout/focused-shell';

/**
 * Purchase funnel — cart, checkout and the order receipt. No footer; see
 * FocusedShell. Route groups do not appear in the URL, so `/cart`, `/checkout`
 * and `/orders/:id` are unchanged.
 */
export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return <FocusedShell>{children}</FocusedShell>;
}
