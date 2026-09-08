import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * Transitions enumerate their properties rather than using `transition-all`:
 * these buttons appear inside animating deck panels, and transitioning every
 * property forces needless style recalculation each frame.
 */
const buttonVariants = cva(
  [
    'relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap',
    'font-semibold transition-[transform,box-shadow,border-color,background-color,opacity]',
    'duration-300 ease-(--ease-smooth)',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-text',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-br from-accent-gradient-from to-accent-gradient-to text-white shadow-[0_4px_15px_rgba(225,6,0,0.2)] hover:shadow-[0_8px_25px_rgba(225,6,0,0.4)] hover:-translate-y-0.5 active:translate-y-px active:scale-[0.97]',
        ghost:
          'border border-border-strong bg-white/[0.02] text-foreground hover:border-accent/80 hover:bg-accent/5 hover:-translate-y-0.5 active:translate-y-px active:scale-[0.97]',
        subtle:
          'bg-surface-elevated text-foreground hover:bg-surface-hover active:scale-[0.97]',
        icon: 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground active:scale-95',
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

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
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
          <Loader2 aria-hidden className="size-4 animate-spin" />
          <span className="sr-only">{loadingLabel}</span>
          <span aria-hidden>{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export { buttonVariants };
