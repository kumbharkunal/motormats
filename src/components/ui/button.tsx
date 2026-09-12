import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import type { ComponentPropsWithRef, ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * Transitions enumerate their properties rather than using `transition-all`,
 * which would force a style recalculation on every property each frame.
 *
 * Note `translate` and `scale`, not `transform`: Tailwind v4 compiles
 * `-translate-y-0.5` and `scale-[0.97]` to those standalone properties, so a
 * list naming `transform` animates nothing and the press snaps.
 */
const buttonVariants = cva(
  [
    'relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap',
    'font-semibold transition-[translate,scale,box-shadow,border-color,background-color,opacity]',
    'duration-300 ease-(--ease-smooth)',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    // Desaturated as well as faded: on the dark theme a half-opacity red read
    // as muted, but over white it just reads pink — a colour, not a state.
    'disabled:pointer-events-none disabled:opacity-50 disabled:grayscale',
  ],
  {
    variants: {
      /*
       * Grounds are solid surfaces, not white alphas. A translucent white tint
       * lifts a near-black panel; over a light canvas it is simply invisible.
       * The red glows are tight and offset rather than wide and ambient —
       * on white a broad red halo reads as a printing error.
       */
      variant: {
        primary:
          'bg-gradient-to-br from-accent-gradient-from to-accent-gradient-to text-white shadow-[0_2px_8px_rgba(225,6,0,0.18)] hover:shadow-[0_6px_20px_rgba(225,6,0,0.28)] hover:-translate-y-0.5 active:translate-y-px active:scale-[0.97]',
        ghost:
          'border border-border-strong bg-surface text-foreground hover:border-accent/80 hover:bg-accent/5 hover:-translate-y-0.5 active:translate-y-px active:scale-[0.97]',
        subtle: 'bg-surface-elevated text-foreground hover:bg-surface-hover active:scale-[0.97]',
        icon: 'bg-surface-elevated text-muted-foreground hover:bg-surface-hover hover:text-foreground active:scale-95',
      },
      size: {
        sm: 'h-9 px-4 text-xs',
        md: 'h-12 px-8 text-sm',
        lg: 'h-14 px-10 text-sm uppercase tracking-[0.15em]',
        icon: 'size-11',
      },
      shape: {
        pill: 'rounded-full',
        rounded: 'rounded-lg',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md', shape: 'pill' },
  },
);

type ButtonProps = ComponentPropsWithRef<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    isLoading?: boolean;
    loadingLabel?: string;
    children?: ReactNode;
  };

export function Button({
  className,
  variant,
  size,
  shape,
  asChild = false,
  isLoading = false,
  loadingLabel = 'Working…',
  disabled,
  children,
  ...props
}: ButtonProps) {
  // `asChild` renders into a link or another element, which cannot host a
  // spinner, so the loading affordance is skipped there.
  if (asChild) {
    return (
      <Slot className={cn(buttonVariants({ variant, size, shape }), className)} {...props}>
        {children}
      </Slot>
    );
  }

  return (
    <button
      className={cn(buttonVariants({ variant, size, shape }), className)}
      // `||`, never `??`: with `??` any explicit `disabled={false}` swallowed
      // `isLoading` and left the button live mid-request. On checkout that
      // meant a second click during payment placed a second order, since each
      // attempt mints its own idempotency key. A busy button is never clickable.
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 aria-hidden className="size-4 shrink-0 animate-spin" />
          <span className="sr-only">{loadingLabel}</span>
          {/* Loading content needs its own flex row: the button's own
              inline-flex + items-center + gap-2 now applies to the spinner
              and this wrapper, not to whatever is inside it. An unstyled
              span left an icon child (e.g. GoogleMark) sitting on its
              default baseline against the text beside it instead of
              centred with it. */}
          <span aria-hidden className="inline-flex items-center gap-2">
            {children}
          </span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export { buttonVariants };
