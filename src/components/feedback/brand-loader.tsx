import { cn } from '@/lib/utils';

/** The mark from `src/app/icon.svg` — two parallelograms sharing a ~46° slant. */
const BAR_A = 'M66 23V70L120 122V72L66 23Z';
const BAR_B = 'M28 43V91L76 137V87L28 43Z';

/**
 * Full-screen loader for the moments the app commits to a navigation.
 *
 * A browser keeps painting the *old* document until the new one is ready, so
 * without this the visitor who just signed in sits looking at the sign-in form
 * they already submitted. This covers that screen the instant the outcome is
 * decided.
 *
 * Deliberately Tailwind and an inline SVG: it renders on the dark storefront
 * and inside the light admin panel, and MUI is fenced out of everything but the
 * admin paths. The animation is a CSS keyframe rather than Motion, so it costs
 * no JavaScript on routes that carry it.
 *
 * The caller must let this paint before navigating — see the callers' double
 * `requestAnimationFrame`.
 */
export function BrandLoader({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed inset-0 z-[300] grid place-items-center',
        // Above the whole existing ladder: checkout overlay 50, mobile nav
        // 100/101, skip link 200. Opaque, and `inset-0` swallows pointer
        // events so a second submit mid-navigation is impossible.
        'bg-[var(--loader-ground,var(--color-background))]',
        'animate-[overlay-in_200ms_ease-out]',
      )}
    >
      <div className="flex flex-col items-center gap-5 px-6">
        <svg
          aria-hidden
          viewBox="0 0 148 160"
          className="h-16 w-auto sm:h-20"
          fill="var(--color-accent)"
        >
          {/* The mark stays legible through the whole cycle, so the logo never
              looks like it is falling apart between streaks. */}
          <g opacity="0.08">
            <path d={BAR_A} />
            <path d={BAR_B} />
          </g>

          {[BAR_A, BAR_B].map((d, i) => (
            <path
              key={d}
              d={d}
              // globals.css kills every animation under reduced motion with an
              // `!important` duration, which would strand these on frame 0 —
              // off-centre at opacity 0, i.e. an invisible loader. Reset them
              // to the resting mark instead.
              className={cn(
                'animate-[glyph-slipstream_1400ms_var(--ease-quart)_infinite]',
                'motion-reduce:animate-none motion-reduce:opacity-100',
                'motion-reduce:[transform:none]',
              )}
              style={{ animationDelay: `${i * 180}ms` }}
            />
          ))}
        </svg>

        <p className="text-center text-sm text-[var(--loader-ink,var(--color-muted-foreground))]">
          {label}
        </p>
      </div>
    </div>
  );
}
