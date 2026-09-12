import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge, taught about our custom type scale.
 *
 * `@theme` adds font sizes named `display`, `h1`…`h3`, `body` and `eyebrow`.
 * tailwind-merge cannot see the stylesheet, so out of the box it reads
 * `text-h2` as a *colour* — putting it in the same conflict group as
 * `text-white`, and silently dropping whichever came first. Every heading built
 * with `cn('text-h2', 'text-white')` therefore rendered at the inherited 16px
 * with no error anywhere.
 *
 * Registering them as font-size keeps the two groups apart, so a size and a
 * colour can coexist on one element.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['display', 'h1', 'h2', 'h3', 'body', 'eyebrow'] }],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
