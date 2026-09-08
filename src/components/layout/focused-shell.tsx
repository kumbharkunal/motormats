import type { ReactNode } from 'react';

import { AnnouncementMarquee } from '@/components/layout/announcement-marquee';
import { SiteHeader } from '@/components/layout/site-header';

/**
 * Shell for pages that deliberately have no footer.
 *
 * The cart, checkout, the order receipt and the account pages are all places
 * someone is doing something rather than browsing — a wall of footer links
 * there is an invitation to leave mid-task. Header for escape and identity,
 * nothing else.
 *
 * Shared so the two route groups that need it cannot drift apart.
 */
export function FocusedShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <AnnouncementMarquee />
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
    </div>
  );
}
