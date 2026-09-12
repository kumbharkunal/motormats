'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useEffect } from 'react';

/**
 * The moment the order lands.
 *
 * The chime is synthesised with the Web Audio API rather than shipped as an
 * asset — two oscillator notes cost nothing to download, and the repo does not
 * gain a media file for half a second of sound.
 *
 * Browsers block audio without a user gesture. Reaching this screen always
 * follows a click, and the client-side navigation keeps that gesture's document
 * alive, so the context is normally already unlocked; when it is not, the
 * failure is swallowed and the animation carries the moment on its own.
 */
function playChime() {
  try {
    const AudioContextCtor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;

    const context = new AudioContextCtor();
    void context.resume().catch(() => undefined);

    // A rising perfect fifth: reads as resolved rather than as an alert.
    const notes = [
      { frequency: 587.33, at: 0, duration: 0.22 },
      { frequency: 880, at: 0.1, duration: 0.42 },
    ];

    for (const note of notes) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.value = note.frequency;

      const start = context.currentTime + note.at;
      // Ramped, never stepped: an instant gain change is an audible click.
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + note.duration);

      oscillator.connect(gain).connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + note.duration + 0.05);
    }

    window.setTimeout(() => void context.close().catch(() => undefined), 1200);
  } catch {
    // Audio is decoration; never let it break the confirmation screen.
  }
}

const PARTICLES = Array.from({ length: 14 }, (_, index) => {
  const angle = (index / 14) * Math.PI * 2;
  return {
    id: index,
    x: Math.cos(angle) * (70 + (index % 3) * 26),
    y: Math.sin(angle) * (70 + (index % 3) * 26),
    delay: 0.18 + (index % 5) * 0.03,
    accent: index % 3 === 0,
  };
});

export function OrderPlacedCelebration({ orderNumber }: { orderNumber: string }) {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    playChime();
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div className="flex flex-col items-center text-center">
        <span className="flex size-20 items-center justify-center rounded-full border border-accent/40 bg-accent/10">
          <CheckMark animate={false} />
        </span>
        <Copy orderNumber={orderNumber} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative flex size-20 items-center justify-center">
        {/* Expanding ring, opacity+transform only so it stays on the compositor. */}
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full border border-accent"
          initial={{ scale: 0.6, opacity: 0.9 }}
          animate={{ scale: 2.1, opacity: 0 }}
          transition={{ duration: 1.1, ease: 'easeOut', delay: 0.1 }}
        />

        {PARTICLES.map((particle) => (
          <motion.span
            key={particle.id}
            aria-hidden
            className={
              particle.accent
                ? 'absolute size-1.5 rounded-full bg-accent'
                : 'absolute size-1 rounded-full bg-foreground/70'
            }
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
            animate={{ x: particle.x, y: particle.y, opacity: [0, 1, 0], scale: 1 }}
            transition={{ duration: 0.9, ease: 'easeOut', delay: particle.delay }}
          />
        ))}

        <motion.span
          className="relative flex size-20 items-center justify-center rounded-full border border-accent/40 bg-accent/10"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 14 }}
        >
          <CheckMark animate />
        </motion.span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35, ease: [0.165, 0.84, 0.44, 1] }}
      >
        <Copy orderNumber={orderNumber} />
      </motion.div>
    </div>
  );
}

function CheckMark({ animate }: { animate: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-9 text-accent-text" aria-hidden>
      <motion.path
        d="M4.5 12.5 L10 18 L19.5 6.5"
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={animate ? { pathLength: 0 } : false}
        animate={animate ? { pathLength: 1 } : undefined}
        transition={{ duration: 0.45, delay: 0.18, ease: 'easeOut' }}
      />
    </svg>
  );
}

function Copy({ orderNumber }: { orderNumber: string }) {
  return (
    <>
      <h1 className="mt-6 text-h1">Order placed</h1>
      <p className="mt-3 text-balance text-muted-foreground">
        Payment received and your order is confirmed. A receipt is on its way.
      </p>
      <p className="mt-4 text-xs tracking-[0.2em] text-muted-foreground uppercase">
        Order {orderNumber}
      </p>
    </>
  );
}
