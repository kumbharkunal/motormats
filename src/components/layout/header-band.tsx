import type { ReactNode } from 'react';

/**
 * The sticky band the header sits in.
 *
 * **Always on screen, and always painted.** The band used to be transparent
 * while it floated over the hero and to switch to ink once past it, driven by a
 * listener measuring the cover's bottom edge. That bought one effect — a cover
 * reaching the top of the viewport — at the cost of a client component on every
 * route and a whole class of measurement bugs when the boundary moved or never
 * rendered. The hero starts below the band instead, and this file needs no
 * state, no effect and no `'use client'` at all.
 *
 * **It is `band-dark`, not just a dark colour.** That utility re-points
 * `--color-foreground`, `--color-muted-foreground`, `--color-border` and
 * `--color-accent-text` for everything inside it, so the nav links, the cart
 * icon, the account menu and the drawer trigger all read their light-on-dark
 * values from the tokens they already used. Nothing in here hardcodes white.
 *
 * No `backdrop-filter`: it sits above full-bleed photography, and a real
 * backdrop blur forces the GPU to re-sample a changing backdrop every frame —
 * the jank documented in globals.css.
 *
 * No bottom rule either. Ink against paper needs no help separating itself, and
 * against the cover a hairline drew a seam across the top of the photograph.
 */
export function HeaderBand({ children }: { children: ReactNode }) {
  return (
    <header className="group/header band-dark sticky top-0 z-40 w-full shrink-0 px-(--gutter-page) py-2 md:py-2.5">
      {children}
    </header>
  );
}
