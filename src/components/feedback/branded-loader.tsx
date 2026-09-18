import { BAR_A, BAR_B } from '@/components/feedback/brand-mark-paths';
import { cn } from '@/lib/utils';

/**
 * The full-screen loader.
 *
 * **A scan, because that is what the product is.** Every pattern here starts
 * from a 3D scan of a real floorpan — it is the first line of the fit copy, and
 * it was this loader's own quote before the quote was dropped. So the mark is
 * neither drawn nor spun: a beam passes down it and leaves brand red behind,
 * the way the scanner passes down a car.
 *
 * **It loops, which the last one did not.** That version drew its outline and
 * filled it over about 1.2s with `forwards`, then held. A loader that finishes
 * animating while the page is still working reads as a hung screenshot rather
 * than as progress, and the slower the route, the worse the lie. This has no
 * end state.
 *
 *
 * **A veil, not a panel.** The page stays legible underneath — the wait should
 * read as this page working, not as a screen put in front of it. The blur is
 * 3px and the tint a quarter, which is enough to push the page back a step
 * without obscuring it; at the 24px it started on, a product grid turned into
 * a milky wash.
 *
 * `globals.css` bans `backdrop-filter` on the header because that floats over a
 * hero whose pixels change every frame and the GPU re-samples a moving backdrop.
 * The ban is explicitly lifted for overlays that sit still, which this does, and
 * 3px costs a fraction of what 24 did.
 *
 * It still blocks input: `fixed inset-0` does that at any opacity, which is the
 * part that actually matters while a route is committing.
 * **One cue.** The mark carries both the brand and the "still working" signal —
 * the scan never stops, so there is nothing a second indicator underneath it
 * could add. A hairline progress rule used to sit below it and only made the
 * loader look like a form that was submitting something.
 *
 * Transform and opacity only, so the whole thing composites and costs nothing
 * while the route it covers does real work. Under `prefers-reduced-motion`
 * nothing moves: the mark sits there solid and the rule fills.
 *
 * **One loader, one ground.** There used to be a second full-screen loader with
 * its own visual language, its own z-index and the same two path constants,
 * used for navigation commits. It is now this one with `showLabel`, because two
 * loaders meant the same wait looked like two different products depending on
 * which part of the app you were waiting on.
 *
 * Paper, not ink: the site is light, and an ink loader meant every slow route
 * flashed black and then back again.
 *
 * Deliberately not a client component — it holds no state and handles no
 * events, so it server-renders inside `loading.tsx`.
 */
export function BrandedLoader({
  label = 'Loading',
  showLabel = false,
  className,
}: {
  label?: string;
  /** Render the label visibly, for a wait the reader chose to start. */
  showLabel?: boolean;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        // `grid place-items-center` rather than a flex column: with one child
        // there is nothing to stack, and this centres on both axes without
        // depending on the child's own sizing.
        'fixed inset-0 z-[280] grid min-h-svh place-items-center',
        'bg-background/25 backdrop-blur-[3px]',
        className,
      )}
    >
      <svg aria-hidden viewBox="0 0 148 160" className="col-start-1 row-start-1 h-28 w-auto sm:h-36">
        <defs>
          {/*
            The mark's own silhouette, used to keep the beam inside the
            artwork. Unclipped, the beam is a full-width rule sticking out
            either side of a mark that is only 92 units across — which read as
            a stray line, not as light crossing a surface.
          */}
          <clipPath id="loader-mark">
            <path d={BAR_A} />
            <path d={BAR_B} />
          </clipPath>

          {/*
            The window the scan fills through. It is a full-height rect parked
            directly above the box, so translating it down uncovers the mark
            from the top edge to the bottom rather than lighting a thin band —
            the mark gains red as the pass descends instead of being dark for
            most of the cycle. `clipPath` defaults to `userSpaceOnUse`, so this
            shares units with the paths and the 160 in `mark-scan`.
          */}
          <clipPath id="loader-reveal">
            <rect
              x="0"
              y="-160"
              width="148"
              height="160"
              className="motion-safe:animate-[mark-scan_1.6s_var(--ease-smooth)_infinite_alternate]"
            />
          </clipPath>
        </defs>

        {/* Always present, so the shape still reads at the top of a pass. */}
        <g className="text-foreground/10">
          <path d={BAR_A} fill="currentColor" />
          <path d={BAR_B} fill="currentColor" />
        </g>

        {/* What the pass has covered so far. */}
        <g clipPath="url(#loader-reveal)" className="text-accent motion-reduce:hidden">
          <path d={BAR_A} fill="currentColor" />
          <path d={BAR_B} fill="currentColor" />
        </g>

        {/* The beam, on the leading edge of that window and only where it
            actually crosses the mark. White rather than red so it reads as
            light against the red it is laying down. */}
        <g clipPath="url(#loader-mark)" className="motion-reduce:hidden">
          <rect
            x="0"
            y="-3"
            width="148"
            height="3"
            fill="#ffffff"
            opacity="0.85"
            className="motion-safe:animate-[mark-scan_1.6s_var(--ease-smooth)_infinite_alternate]"
          />
        </g>

        {/* Reduced motion gets the finished mark and no movement at all. */}
        <g className="hidden text-accent motion-reduce:block">
          <path d={BAR_A} fill="currentColor" />
          <path d={BAR_B} fill="currentColor" />
        </g>
      </svg>

      {showLabel ? (
        <p className="col-start-1 row-start-1 self-end pb-16 text-center caps text-eyebrow text-muted-foreground">
          {label}
        </p>
      ) : (
        <span className="sr-only">{label}</span>
      )}
    </div>
  );
}
