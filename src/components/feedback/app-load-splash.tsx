import Script from 'next/script';

import { BAR_A, BAR_B } from '@/components/feedback/brand-mark-paths';

/**
 * The first-paint splash.
 *
 * A server component with a `beforeInteractive` script, and deliberately not a
 * React state machine. The previous version was `'use client'` and flipped
 * itself on from an effect, which had two consequences: it could not appear
 * until after hydration — so the one thing a splash exists to cover was already
 * over by the time it arrived — and under StrictMode's double-invoked effects
 * the second pass hit the `sessionStorage` guard, returned before scheduling the
 * dismiss timer, and left the overlay up permanently. In development it covered
 * every page of the site.
 *
 * **Nothing here is removed from the DOM.** An earlier pass at this did call
 * `el.remove()`, which deleted a node React had server-rendered and therefore
 * broke hydration for the entire tree. The script only ever *changes an
 * attribute it was rendered with*, and CSS does the hiding — so the markup React
 * hydrates is exactly the markup it sent.
 *
**A veil, not a panel.** The page behind it stays legible under a 3px blur and
 * a quarter tint, so the splash reads as the site arriving rather than as a
 * card put in front of it.
 *
 * It is driven by readiness rather than by a clock: it leaves when the hero
 * image has decoded, or when the window has loaded, whichever lands first, with
 * a 1200ms cap so a slow connection can never hold the page hostage and a 300ms
 * floor so a warm load does not flash.
 */
const SESSION_KEY = 'motormats-splash-seen';

/** Long enough to read as intentional, short enough not to be a delay. */
const FLOOR_MS = 300;
const CAP_MS = 1200;
const EXIT_MS = 280;

const DISMISS = `(function () {
  var seen = false;
  try { seen = sessionStorage.getItem('${SESSION_KEY}') === '1'; } catch (e) {}

  var still = false;
  try { still = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  // Seen this session, or the reader asked for less motion. Marking the root
  // rather than touching the overlay means it never paints at all — and an
  // attribute React did not render is an attribute React will not reconcile.
  if (seen || still) {
    document.documentElement.setAttribute('data-splash', 'off');
    // Announce it anyway. Anything holding content back until the splash is out
    // of the way has to be released on the path where it never arrives, not
    // left to time out.
    document.dispatchEvent(new CustomEvent('motormats:splash-done'));
    return;
  }

  var start = Date.now();
  var done = false;

  function finish() {
    if (done) return;
    done = true;
    try { sessionStorage.setItem('${SESSION_KEY}', '1'); } catch (e) {}

    setTimeout(function () {
      var el = document.getElementById('app-splash');
      if (!el) return;
      el.setAttribute('data-state', 'leaving');
      document.dispatchEvent(new CustomEvent('motormats:splash-done'));
      setTimeout(function () { el.setAttribute('data-state', 'gone'); }, ${EXIT_MS});
    }, Math.max(0, ${FLOOR_MS} - (Date.now() - start)));
  }

  // The hero is the thing the reader is waiting for, so its decode is the
  // honest signal. This script runs in the head, before the hero is parsed.
  function watchHero() {
    var hero = document.querySelector('[data-hero-image]');
    if (hero && hero.decode) hero.decode().then(finish, finish);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watchHero, { once: true });
  } else {
    watchHero();
  }

  if (document.readyState === 'complete') finish();
  else window.addEventListener('load', finish, { once: true });

  setTimeout(finish, ${CAP_MS});
})();`;

export function AppLoadSplash() {
  return (
    <>
      {/*
        `beforeInteractive` is the point: the script has to run before hydration,
        or a repeat visitor sees the splash flash in and back out again. The lint
        rule below predates the App Router and asks for `pages/_document.js`,
        which this app does not have — in the App Router this belongs in the root
        layout's tree, which is where it is.
      */}
      {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
      <Script id="motormats-splash" strategy="beforeInteractive">
        {DISMISS}
      </Script>

      <div
        id="app-splash"
        // Rendered with the attribute the script will change, so the value moves
        // but the shape of the markup never does.
        data-state="idle"
        role="status"
        aria-live="polite"
        aria-busy="true"
        className="fixed inset-0 z-[280] grid min-h-svh place-items-center bg-background/25 backdrop-blur-[3px]"
      >
        <svg viewBox="0 0 148 160" aria-hidden className="h-24 w-auto sm:h-28">
          <defs>
            <clipPath id="splash-mark">
              <path d={BAR_A} />
              <path d={BAR_B} />
            </clipPath>
          </defs>

          <g className="text-accent" fill="currentColor">
            <path d={BAR_A} />
            <path d={BAR_B} />
          </g>

          {/*
            A light pass travelling the mark's own depth, clipped to its
            silhouette. Kept light: it is a full-height veil rather than a thin
            leading edge, so at 0.55 it washed the mark out to pale pink for most
            of the cycle — invisible against a white panel, and against a blurred
            page it read as a rendering fault.
          */}
          <g clipPath="url(#splash-mark)">
            <rect
              x="0"
              y="-160"
              width="148"
              height="160"
              fill="rgba(255,255,255,0.26)"
              className="motion-safe:animate-[mark-scan_1.6s_var(--ease-smooth)_infinite_alternate]"
            />
          </g>
        </svg>

        <span className="sr-only">Loading Motormats</span>
      </div>
    </>
  );
}
