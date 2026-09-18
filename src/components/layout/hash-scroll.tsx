'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { scrollToElement } from '@/lib/scroll-sync';

/**
 * Makes in-page links actually go to the section they name.
 *
 * Two things were stopping "Find your fit" in the nav from doing anything. The
 * link is `/#find-your-fit`, and when the reader is already on `/` that is a
 * same-document hash change, so Next does not navigate and the browser is left
 * to jump. Lenis is what breaks the jump: it holds its own target scroll
 * position and eases the real one toward it every frame, so a jump the browser
 * makes behind its back is undone on the very next frame — the page twitches and
 * settles exactly where it was. `anchors: false` is already set on the instance
 * for precisely this reason, which leaves nothing at all handling the hash.
 *
 * The second problem is the sticky header: even a working jump puts the target's
 * top edge under it, so the section's own heading is hidden.
 *
 * So the hash is handled here, through `scrollToElement` — which goes through
 * Lenis when Lenis is running and falls back to the native path under reduced
 * motion — offset by the header. One delegated listener, in the same spirit as
 * `TapHaptics`, rather than an onClick on every link that happens to have a
 * fragment in it.
 */

/** A little air under the header, so the heading is not flush against it. */
const BREATHING_ROOM = 16;

function headerOffset(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--header-height');
  const height = Number.parseFloat(raw);
  // The token is in rem; a bare `parseFloat` would read "4rem" as 4px.
  const rootSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const pixels = raw.trim().endsWith('rem') ? height * rootSize : height;
  return (Number.isFinite(pixels) ? pixels : 64) + BREATHING_ROOM;
}

function goToHash(hash: string): boolean {
  const id = decodeURIComponent(hash.replace(/^#/, ''));
  if (!id) return false;

  const target = document.getElementById(id);
  if (!target) return false;

  scrollToElement(target, -headerOffset());
  return true;
}

export function HashScroll() {
  const pathname = usePathname();

  /*
   * Arriving from another route, or on a cold load of a hashed URL.
   *
   * Two things are racing here and neither is worth guessing at: the target
   * section may not be in the document yet when the navigation resolves, and the
   * router does its own scroll restoration afterwards, which will happily undo a
   * scroll that landed too early. So it is attempted a few times over the first
   * half second and the attempts stop as soon as one takes — which also covers
   * the splash, whose exit can move the page under us.
   */
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const timers: number[] = [];
    let settled = false;

    for (const delay of [0, 120, 320, 550]) {
      timers.push(
        window.setTimeout(() => {
          if (settled) return;
          settled = goToHash(hash);
        }, delay),
      );
    }

    return () => {
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      // Let the browser have modified clicks — new tab, new window, download.
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const source = event.target;
      if (!(source instanceof Element)) return;

      const link = source.closest('a[href]');
      if (!(link instanceof HTMLAnchorElement) || link.target === '_blank') return;

      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || !url.hash) return;
      // A fragment on a different route is a real navigation; the effect above
      // finishes the job once that route has mounted.
      if (url.pathname !== window.location.pathname) return;

      const id = decodeURIComponent(url.hash.replace(/^#/, ''));
      const target = id ? document.getElementById(id) : null;
      if (!target) return;

      /*
       * Capture phase, `preventDefault`, and deliberately *not*
       * `stopPropagation`.
       *
       * Capture is needed because Next's `<Link>` binds its own handler to the
       * anchor, which in the bubble phase would run before a document listener
       * and push the route before there was anything left to prevent. But
       * stopping propagation as well was worse: it meant the anchor never saw
       * the click at all, so the mobile drawer's own `onClick={close}` never
       * ran and the panel just sat there over a page that had quietly scrolled
       * underneath it. Next reads `defaultPrevented` *after* calling the
       * element's onClick — so preventing the default is enough to cancel the
       * navigation while every other handler on the link still fires.
       */
      event.preventDefault();
      // Keep the address bar honest without letting the browser scroll.
      history.replaceState(null, '', url.hash);

      /*
       * Deferred, because this same click may be closing the drawer, and the
       * drawer holds Lenis stopped while it is open. Scrolling is also the last
       * thing that should happen: let the panel start leaving first.
       */
      window.setTimeout(() => goToHash(url.hash), 0);
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return null;
}
