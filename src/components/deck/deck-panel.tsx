import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export function DeckPanel({
  children,
  className,
  labelledBy,
}: {
  children: ReactNode;
  className?: string;
  labelledBy?: string;
}) {
  return (
    <section
      aria-labelledby={labelledBy}
      className={cn(
        'deck-panel bg-background relative flex w-full flex-col justify-center overflow-hidden',
        className,
      )}
    >
      {children}
    </section>
  );
}
