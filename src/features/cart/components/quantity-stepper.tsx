'use client';

import { Minus, Plus } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * Quantity control for a cart line.
 *
 * Replaces a native `<select>`, which the browser renders with its own OS
 * chrome — a white popup list with a blue selected row, immovable by CSS and
 * badly out of place on a dark storefront. Two buttons and a readout are also
 * fewer interactions than open-scroll-pick for the one-to-ten range that
 * actually occurs.
 */
export function QuantityStepper({
  value,
  max,
  onChange,
  label,
}: {
  value: number;
  max: number;
  onChange: (next: number) => void;
  label: string;
}) {
  const canDecrease = value > 1;
  const canIncrease = value < max;

  function step(next: number) {
    if (next < 1 || next > max) return;
    // Same confirmation the quick-add button gives; absent on iOS Safari.
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(10);
    onChange(next);
  }

  return (
    <div
      className="border-border bg-surface inline-flex h-11 items-center rounded-full border"
      role="group"
      aria-label={label}
    >
      <StepButton
        onClick={() => step(value - 1)}
        disabled={!canDecrease}
        label={`Decrease quantity of ${label}`}
      >
        <Minus aria-hidden size={15} />
      </StepButton>

      {/* aria-live so a screen reader hears the new count without refocusing. */}
      <span
        aria-live="polite"
        aria-atomic
        className="min-w-9 text-center text-sm font-semibold tabular-nums"
      >
        {value}
        <span className="sr-only"> of {max} available</span>
      </span>

      <StepButton
        onClick={() => step(value + 1)}
        disabled={!canIncrease}
        label={`Increase quantity of ${label}`}
      >
        <Plus aria-hidden size={15} />
      </StepButton>
    </div>
  );
}

function StepButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        'flex size-11 shrink-0 items-center justify-center rounded-full transition-colors duration-200',
        disabled
          ? 'text-subtle-foreground cursor-not-allowed'
          : 'text-muted-foreground hover:text-foreground hover:bg-white/8 active:scale-90',
      )}
    >
      {children}
    </button>
  );
}
