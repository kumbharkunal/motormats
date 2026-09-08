'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useRef, useState } from 'react';

import { cn } from '@/lib/utils';

/**
 * Six-digit code entry.
 *
 * One real input sits invisibly over the boxes rather than six separate ones.
 * Six inputs look the same but fight the platform: iOS fills only the first
 * from an SMS, pasting a code needs hand-written splitting, and a screen reader
 * meets six unlabelled fields instead of one. With a single field, autofill,
 * paste, caret movement and backspace are the browser's job, and the boxes
 * become presentation.
 */
export function OtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  disabled = false,
  label,
}: {
  value: string;
  onChange: (next: string) => void;
  onComplete?: (code: string) => void;
  length?: number;
  disabled?: boolean;
  label: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // The caret sits on the first empty box, or the last one when full.
  const activeIndex = Math.min(value.length, length - 1);

  return (
    <div
      className="relative"
      onPointerDown={(event) => {
        // Keep the tap on the boxes from stealing focus from the real input.
        event.preventDefault();
        input.current?.focus();
      }}
    >
      <input
        ref={input}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        // `pattern` keeps mobile keyboards numeric even where inputMode is ignored.
        pattern="\d*"
        maxLength={length}
        value={value}
        disabled={disabled}
        aria-label={label}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(event) => {
          const digits = event.target.value.replace(/\D/g, '').slice(0, length);
          onChange(digits);
          if (digits.length === length) onComplete?.(digits);
        }}
        className="absolute inset-0 z-10 h-full w-full cursor-default opacity-0"
      />

      <div className="flex justify-between gap-2 sm:gap-3" aria-hidden>
        {Array.from({ length }, (_, index) => {
          const char = value[index] ?? '';
          const isActive = focused && index === activeIndex && !disabled;

          return (
            <motion.div
              key={index}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.04, ease: [0.165, 0.84, 0.44, 1] }}
              className={cn(
                'relative flex h-14 flex-1 items-center justify-center rounded-xl border text-xl font-semibold transition-colors duration-200 sm:h-16 sm:text-2xl',
                disabled && 'opacity-50',
                char
                  ? 'border-border-strong bg-surface-elevated'
                  : 'border-border bg-surface',
                isActive && 'border-accent bg-accent/5',
              )}
            >
              {char ? (
                <motion.span
                  // A little pop on arrival so filling the code feels responsive.
                  initial={prefersReducedMotion ? false : { scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 480, damping: 24 }}
                >
                  {char}
                </motion.span>
              ) : null}

              {isActive && !char ? (
                <span className="bg-accent-text h-6 w-px animate-[caret-blink_1s_steps(1)_infinite] sm:h-7" />
              ) : null}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
