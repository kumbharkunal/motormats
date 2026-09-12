import type { ReactNode } from 'react';

import { Breadcrumbs } from '@/components/ui/breadcrumbs';

/**
 * Shared frame for the static marketing and policy routes, so seven pages do
 * not each invent their own heading rhythm and measure.
 */
export function PageShell({
  title,
  intro,
  breadcrumb,
  children,
  wide = false,
}: {
  title: string;
  intro?: string;
  breadcrumb: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={`container-page py-12 md:py-16 ${wide ? '' : 'max-w-3xl'}`}>
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: breadcrumb }]} />

      <h1 className="mt-6 text-h1">{title}</h1>
      {intro ? <p className="mt-4 text-balance text-muted-foreground md:text-lg">{intro}</p> : null}

      <div className="mt-10">{children}</div>
    </div>
  );
}

/** Body copy for the policy pages: readable measure, consistent spacing. */
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6 text-sm leading-relaxed [&_a]:text-accent-text [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-h3 [&_li]:mt-1.5 [&_p]:text-muted-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-muted-foreground">
      {children}
    </div>
  );
}
