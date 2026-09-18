'use client';

import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useMemo, useRef, useState } from 'react';

import { ProductCard, type ProductCardItem } from '@/features/catalog/components/product-card';

/**
 * Below this, render a plain CSS grid.
 *
 * Window virtualisation costs real correctness — absolutely positioned rows, a
 * wrapper whose height is a running estimate, and a measurement pass that has to
 * agree with where the list actually sits on the page. None of that is worth
 * paying for a handful of rows: at four columns this is twelve rows of cards
 * before anything is skipped, and the whole catalogue is currently ten products.
 * The previous threshold was eight, so the live listing took the virtual path to
 * avoid rendering two extra cards.
 */
const VIRTUALIZE_FROM = 48;

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

function columnsForWidth(width: number): number {
  if (width >= 1024) return 4;
  if (width >= 640) return 3;
  return 2;
}

const GRID = 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 md:gap-6';

export function VirtualProductGrid({ products }: { products: ProductCardItem[] }) {
  const [columns, setColumns] = useState(2);
  const listRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);

  useEffect(() => {
    const sync = () => {
      setColumns(columnsForWidth(window.innerWidth));
      /*
       * How far the list starts down the document.
       *
       * `useWindowVirtualizer` measures against the window, so it needs to know
       * where the list begins or it places every row as though the list started
       * at the top of the page. This was hardcoded to 0 while the list sits
       * below a page heading and a filter bar, so the rows were offset by
       * exactly that much and the wrapper's height was wrong with them.
       */
      const top = listRef.current?.getBoundingClientRect().top;
      if (top !== undefined) setScrollMargin(top + window.scrollY);
    };
    sync();
    window.addEventListener('resize', sync, { passive: true });
    return () => window.removeEventListener('resize', sync);
  }, []);

  const rows = useMemo(() => chunk(products, columns), [products, columns]);

  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => 360,
    overscan: 3,
    scrollMargin,
  });

  if (products.length < VIRTUALIZE_FROM) {
    return (
      <ul className={`mt-8 ${GRID}`}>
        {products.map((product, index) => (
          // `h-full` so every card in a row is the height of the tallest: the
          // card stretches to the grid row, and its own `h-full` then fills it.
          <li key={product.publicId} className="h-full">
            <ProductCard product={product} priority={index < 4} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div
      ref={listRef}
      className="relative mt-8 w-full"
      style={{ height: `${virtualizer.getTotalSize()}px` }}
    >
      {virtualizer.getVirtualItems().map((virtualRow) => {
        const rowProducts = rows[virtualRow.index];
        if (!rowProducts) return null;
        const baseIndex = virtualRow.index * columns;
        return (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={virtualizer.measureElement}
            className={`absolute top-0 left-0 w-full ${GRID}`}
            style={{ transform: `translateY(${virtualRow.start - virtualizer.options.scrollMargin}px)` }}
          >
            {rowProducts.map((product, colIndex) => (
              <div key={product.publicId} className="h-full">
                <ProductCard product={product} priority={baseIndex + colIndex < 4} />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
