'use client';

import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

import type { VehicleModel } from '@/features/vehicles/data/brands';

const ROW_HEIGHT = 52;

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
      <ul className="mt-5 grid gap-2 sm:grid-cols-2">
        {models.map((m) => (
          <li key={m.slug}>
            <ModelRow model={m} onPick={onPick} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div
      ref={parentRef}
      className="native-scroll mt-5 max-h-[min(22rem,50vh)] rounded-xl border border-border"
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
              className="absolute top-0 left-0 w-full px-2"
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

function ModelRow({ model, onPick }: { model: VehicleModel; onPick: (slug: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onPick(model.slug)}
      className="flex w-full items-center justify-between rounded-lg border border-transparent px-3 py-2.5 text-left text-sm font-medium transition-colors hover:border-border hover:bg-surface-elevated"
    >
      {model.name}
      {model.yearRange ? (
        <span className="text-xs text-muted-foreground">{model.yearRange}</span>
      ) : null}
    </button>
  );
}
