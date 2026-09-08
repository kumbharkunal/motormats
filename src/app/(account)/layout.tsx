import type { ReactNode } from 'react';

import { FocusedShell } from '@/components/layout/focused-shell';

/**
 * Account area. No footer — see FocusedShell. Route groups do not appear in the
 * URL, so `/account` and `/account/orders` are unchanged.
 */
export default function AccountLayout({ children }: { children: ReactNode }) {
  return <FocusedShell>{children}</FocusedShell>;
}
