'use client';

import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

import { CarSketch } from '@/features/vehicles/components/car-sketch';
import type { VehicleModel } from '@/features/vehicles/data/brands';

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

/** Drawn, like the brand tiles — the row is recognisable before it is read. */
function ModelRow({ model, onPick }: { model: VehicleModel; onPick: (slug: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onPick(model.slug)}
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
