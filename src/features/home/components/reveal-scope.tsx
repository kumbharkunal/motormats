'use client';

import { useRef, type ReactNode } from 'react';

import { useEditorialReveal } from '@/hooks/use-scroll-motion';

/**
 * A reveal scope for a band that is otherwise a server component.
 *
 * `useEditorialReveal` needs a client component to own the ref, which used to
 * mean any band wanting a reveal had to become `'use client'` in full — and with
 * it every product card, every image and every icon underneath it. This is the
 * smallest possible client boundary: it renders a div, holds a ref, and its
 * children stay on the server.
 */
export function RevealScope({ children, className }: { children: ReactNode; className?: string }) {
  const scope = useRef<HTMLDivElement>(null);
  useEditorialReveal(scope);

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}
