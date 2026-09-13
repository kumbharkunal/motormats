'use client';

import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useMemo, useState } from 'react';

import { ProductCard, type ProductCardItem } from '@/features/catalog/components/product-card';

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

export function VirtualProductGrid({ products }: { products: ProductCardItem[] }) {
  const [columns, setColumns] = useState(2);

  useEffect(() => {
    const sync = () => setColumns(columnsForWidth(window.innerWidth));
    sync();
    window.addEventListener('resize', sync, { passive: true });
    return () => window.removeEventListener('resize', sync);
  }, []);

  const rows = useMemo(() => chunk(products, columns), [products, columns]);

  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => 360,
    overscan: 3,
    scrollMargin: 0,
  });

  if (products.length <= 8) {
    return (
      <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 md:gap-6">
        {products.map((product, index) => (
          <li key={product.publicId}>
            <ProductCard product={product} priority={index < 4} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="relative mt-8 w-full" style={{ height: `${virtualizer.getTotalSize()}px` }}>
      {virtualizer.getVirtualItems().map((virtualRow) => {
        const rowProducts = rows[virtualRow.index];
        if (!rowProducts) return null;
        const baseIndex = virtualRow.index * columns;
        return (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={virtualizer.measureElement}
            className="absolute top-0 left-0 grid w-full grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 md:gap-6"
            style={{ transform: `translateY(${virtualRow.start}px)` }}
          >
            {rowProducts.map((product, colIndex) => (
              <div key={product.publicId}>
                <ProductCard product={product} priority={baseIndex + colIndex < 4} />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
