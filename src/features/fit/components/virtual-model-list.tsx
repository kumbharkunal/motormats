'use client';

import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

import { CarSketch } from '@/features/vehicles/components/car-sketch';
import type { VehicleModel } from '@/features/vehicles/data/brands';
import { isTap } from '@/lib/gesture';
import { tapFeedback } from '@/lib/haptics';

const ROW_HEIGHT = 64;

export function VirtualModelList({
  models,
  onPick,
}: {
  models: VehicleModel[];
  onPick: (slug: string) => void;
}) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: models.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 6,
  });

  if (models.length <= 10) {
    return (
      <ul className="mt-7 grid gap-px bg-border sm:grid-cols-2">
        {models.map((m) => (
          <li key={m.slug} className="bg-surface">
            <ModelRow model={m} onPick={onPick} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div
      ref={parentRef}
      // Read down, not across, so this one does not take `native-scroll` —
      // that utility is sideways-only and pins `overflow-y: hidden`. This is
      // also the one scroller that genuinely wants Lenis to keep out, which is
      // what `data-native-scroll` asks for.
      className="mt-7 max-h-[min(22rem,50vh)] overflow-y-auto overscroll-y-contain border border-border"
      data-native-scroll
    >
      <ul
        className="relative w-full"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualizer.getVirtualItems().map((item) => {
          const model = models[item.index];
          if (!model) return null;
          return (
            <li
              key={model.slug}
              className="absolute top-0 left-0 w-full"
              style={{ transform: `translateY(${item.start}px)` }}
            >
              <ModelRow model={model} onPick={onPick} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Drawn, like the brand tiles — the row is recognisable before it is read.
 *
 * The press is qualified rather than taken at face value. These rows live inside
 * a momentum scroller, and a flick that happens to end on a row fires its
 * `click` — so a reader scrolling the list would arrive at a model they never
 * chose. Anything that travelled, or that was held, is a scroll and is ignored.
 */
function ModelRow({ model, onPick }: { model: VehicleModel; onPick: (slug: string) => void }) {
  const origin = useRef<{ x: number; y: number; t: number } | null>(null);

  const start = (event: ReactPointerEvent<HTMLButtonElement>) => {
    // No haptic here: a finger lands on a row every time the list is scrolled,
    // and buzzing on each one would make scrolling feel broken. The confirmation
    // belongs to the press that actually chooses something.
    origin.current = { x: event.clientX, y: event.clientY, t: performance.now() };
  };

  const pick = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const from = origin.current;
    origin.current = null;
    if (!from) return;
    if (
      !isTap({
        dx: event.clientX - from.x,
        dy: event.clientY - from.y,
        dt: performance.now() - from.t,
      })
    ) {
      return;
    }
    tapFeedback();
    onPick(model.slug);
  };

  return (
    <button
      type="button"
      onPointerDown={start}
      onPointerUp={pick}
      onPointerCancel={() => {
        origin.current = null;
      }}
      // Keyboard and assistive activation never went through the pointer path,
      // so they still need this. `detail === 0` is what distinguishes them: a
      // pointer-driven click carries a click count and was already decided above.
      onClick={(event) => {
        if (event.detail !== 0) return;
        onPick(model.slug);
      }}
      className="group/row flex h-16 w-full items-center gap-4 px-4 text-left transition-colors duration-300 hover:bg-surface-hover"
    >
      <CarSketch
        bodyStyle={model.bodyStyle}
        {...(model.sketch ? { override: model.sketch } : {})}
        className="w-20 shrink-0 text-border-strong transition-colors duration-300 group-hover/row:text-foreground"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">{model.name}</span>
        {model.yearRange ? (
          <span className="block text-xs text-subtle-foreground">{model.yearRange}</span>
        ) : null}
      </span>
      <span
        aria-hidden
        className="shrink-0 text-xs text-subtle-foreground transition-motion duration-300 group-hover/row:translate-x-0.5 group-hover/row:text-accent-text"
      >
        &rarr;
      </span>
    </button>
  );
}
