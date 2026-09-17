'use client';

import { useEffect, useState, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * The sticky band the header pills sit in.
 *
 * **Always on screen.** The band used to retract on scroll down and return on
 * scroll up. It no longer moves at all: on a picture-led page the nav is the
 * only fixed reference the reader has, and a bar that slides in and out over
 * full-bleed photography reads as a glitch rather than as chrome.
 *
 * **Ground.** The homepage pulls its cover up under the header so the picture
 * reaches the top of the viewport, and the band has to stay unpainted for all
 * of it — a ground that faded in after a few pixels just laid a strip across
 * the photograph. But the pills are the only things here with a background of
 * their own, so past the cover, content runs through the gaps between them and
 * collides with the nav. The switch is the cover's own bottom edge, published
 * as `[data-header-boundary]` rather than guessed from an offset.
 *
 * Every other route passes `overlay={false}`: painted from the start.
 */
export function HeaderBand({
  overlay = false,
  children,
}: {
  overlay?: boolean;
  children: ReactNode;
}) {
  const [overHero, setOverHero] = useState(overlay);

  useEffect(() => {
    if (!overlay) return;

    const sync = () => {
      const boundary = document.querySelector<HTMLElement>('[data-header-boundary]');
      if (!boundary) {
        setOverHero(false);
        return;
      }

      const root = getComputedStyle(document.documentElement);
      const headerHeight =
        parseFloat(root.getPropertyValue('--header-height')) * parseFloat(root.fontSize);
      setOverHero(boundary.getBoundingClientRect().top > headerHeight);
    };

    // Deferred a frame rather than run inline: the cover is still being laid
    // out when the effect fires, so measuring here reads a boundary that has
    // not settled yet.
    const first = requestAnimationFrame(sync);

    // Lenis scrolls the real document rather than transforming a wrapper, so
    // the ordinary scroll event is still the right signal.
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);

    return () => {
      cancelAnimationFrame(first);
      window.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, [overlay]);

  return (
    <header
      data-over-hero={overHero ? 'true' : 'false'}
      className={cn(
        'group/header sticky top-0 z-40 w-full shrink-0',
        // The page gutter, so the logo sits on the same left edge as the
        // headline under it. This used to be its own `max(1.25rem, 4vw)`, which
        // put the mark 64px in while the hero type started at 28px.
        'px-(--gutter-page) py-4 md:py-5',
        // No `backdrop-filter` here. The band floats over full-bleed
        // photography, and a real backdrop blur forces the GPU to re-sample a
        // changing backdrop every frame — the jank documented in globals.css.
        'transition-[background-color,border-color] duration-500 ease-expo',
        'motion-reduce:transition-none',
        // Ink once it leaves the cover, not paper: the nav's own type is light
        // and the bands below it alternate, so a ground that matched the paper
        // band left the header invisible over every dark one.
        overHero ? 'border-b border-transparent bg-transparent' : 'border-b border-white/10 bg-ink',
      )}
    >
      {children}
    </header>
  );
}
