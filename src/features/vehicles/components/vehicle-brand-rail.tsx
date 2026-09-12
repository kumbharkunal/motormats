'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { BrandIcon } from '@/features/vehicles/components/brand-icon';
import { VEHICLE_BRANDS, type VehicleBrand } from '@/features/vehicles/data/brands';
import { cn } from '@/lib/utils';

/**
 * Car brand navigation rail — displayed below the hero on the homepage.
 *
 * Each tile shows a car silhouette + brand name. Hovering opens a dropdown
 * listing that brand's models; clicking a model navigates to `/collections`
 * with brand/model query params.
 *
 * **Desktop (lg+):** hover to open, mouse-leave to close, dropdown floats
 * absolutely under the tile. The `<ul>` is `overflow-visible` so the panel
 * is not clipped.
 *
 * **Mobile (<lg):** tap to toggle. The model list renders **below** the
 * scroll rail as a full-width panel so it is never clipped by the rail's
 * `overflow-x-auto`.
 */
export function VehicleBrandRail() {
  const [openBrand, setOpenBrand] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const railRef = useRef<HTMLDivElement>(null);

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimerRef.current = setTimeout(() => {
      setOpenBrand(null);
    }, 120);
  }, [cancelClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenBrand(null);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Close on click outside the rail
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (railRef.current && !railRef.current.contains(e.target as Node)) {
        setOpenBrand(null);
      }
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, []);

  const activeBrand = openBrand
    ? VEHICLE_BRANDS.find((b) => b.slug === openBrand) ?? null
    : null;

  return (
    <section aria-label="Shop by car brand" className="relative border-b border-border bg-surface">
      {/* Accent line at the top edge */}
      <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-accent/15" />

      <div ref={railRef} className="container-page">
        {/* ── Brand tiles ── */}
        <ul
          className={cn(
            'flex items-stretch gap-1',
            // Mobile: horizontal scroll, hidden scrollbar
            'overflow-x-auto scroll-smooth snap-x snap-mandatory',
            '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            // Desktop: evenly spaced, overflow visible so dropdown floats out
            'lg:justify-between lg:gap-0 lg:overflow-x-visible',
          )}
          role="menubar"
          aria-label="Car brands"
        >
          {VEHICLE_BRANDS.map((brand) => (
            <BrandTile
              key={brand.slug}
              brand={brand}
              isOpen={openBrand === brand.slug}
              onOpen={() => {
                cancelClose();
                setOpenBrand(brand.slug);
              }}
              onClose={scheduleClose}
              onCancelClose={cancelClose}
              onToggle={() =>
                setOpenBrand((prev) => (prev === brand.slug ? null : brand.slug))
              }
            />
          ))}
        </ul>

        {/* ── Mobile dropdown panel ──
            Rendered outside the scroll container so it's never clipped.
            Hidden on lg+ where the dropdown floats inside the <li>. */}
        <div className="lg:hidden">
          <AnimatePresence>
            {activeBrand ? (
              <MobileModelPanel
                key={activeBrand.slug}
                brand={activeBrand}
              />
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────── */

function BrandTile({
  brand,
  isOpen,
  onOpen,
  onClose,
  onCancelClose,
  onToggle,
}: {
  brand: VehicleBrand;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onCancelClose: () => void;
  onToggle: () => void;
}) {
  return (
    <li
      className="relative shrink-0 snap-start lg:flex-1 lg:shrink"
      role="none"
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
    >
      <button
        type="button"
        role="menuitem"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={onToggle}
        onFocus={onOpen}
        className={cn(
          'group/tile flex w-full flex-col items-center gap-1.5 px-4 py-4 transition-colors duration-200 md:px-2 md:py-6',
          isOpen
            ? 'text-foreground'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <BrandIcon
          bodyStyle={brand.bodyStyle}
          className={cn(
            'transition-colors duration-200',
            isOpen ? 'text-foreground' : 'text-subtle-foreground group-hover/tile:text-foreground',
          )}
        />

        <span className="flex items-center gap-1">
          <span className="text-[0.6875rem] font-semibold tracking-[0.08em] uppercase">
            {brand.name}
          </span>
          <ChevronDown
            aria-hidden
            size={12}
            strokeWidth={2}
            className={cn(
              'shrink-0 transition-motion duration-200',
              isOpen && 'rotate-180',
            )}
          />
        </span>

        {/* Active indicator bar */}
        <span
          aria-hidden
          className={cn(
            'absolute inset-x-0 bottom-0 h-0.5 origin-center bg-accent transition-motion duration-300',
            isOpen ? 'scale-x-100' : 'scale-x-0',
          )}
        />
      </button>

      {/* Desktop-only floating dropdown — hidden on mobile where the panel
          renders outside the scroll container instead. */}
      <div className="hidden lg:block">
        <AnimatePresence>
          {isOpen ? (
            <DesktopModelDropdown
              brand={brand}
              onCancelClose={onCancelClose}
              onClose={onClose}
            />
          ) : null}
        </AnimatePresence>
      </div>
    </li>
  );
}

/* ─────────────────────────────────────────────────────────────────── */

/** Desktop: absolute-positioned dropdown below the tile. */
function DesktopModelDropdown({
  brand,
  onCancelClose,
  onClose,
}: {
  brand: VehicleBrand;
  onCancelClose: () => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
      onMouseEnter={onCancelClose}
      onMouseLeave={onClose}
      role="menu"
      aria-label={`${brand.name} models`}
      className={cn(
        'absolute left-1/2 top-full z-30 -translate-x-1/2',
        'min-w-[15rem] overflow-hidden rounded-xl',
        'bg-surface border border-border shadow-raised',
      )}
    >
      <ModelList brand={brand} />
    </motion.div>
  );
}

/** Mobile: full-width panel that slides in below the scroll rail. */
function MobileModelPanel({ brand }: { brand: VehicleBrand }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="overflow-hidden border-t border-border"
      role="menu"
      aria-label={`${brand.name} models`}
    >
      <ModelList brand={brand} />
    </motion.div>
  );
}

/** Shared model list used by both desktop dropdown and mobile panel. */
function ModelList({ brand }: { brand: VehicleBrand }) {
  return (
    <>
      <div className="py-1.5">
        {brand.models.map((model) => (
          <Link
            key={model.slug}
            href={`/collections?brand=${brand.slug}&model=${model.slug}`}
            role="menuitem"
            className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm text-foreground transition-colors duration-150 hover:bg-surface-hover hover:text-accent"
          >
            <span className="font-medium">{model.name}</span>
            {model.yearRange ? (
              <span className="text-xs text-muted-foreground">{model.yearRange}</span>
            ) : null}
          </Link>
        ))}
      </div>

      <div className="border-t border-border">
        <Link
          href={`/collections?brand=${brand.slug}`}
          className="group/all flex items-center justify-between gap-3 px-4 py-3 text-[0.8125rem] font-semibold text-accent transition-colors duration-150 hover:bg-accent/5"
        >
          View all {brand.name} mats
          <ArrowRight
            aria-hidden
            size={14}
            className="shrink-0 transition-motion duration-200 group-hover/all:translate-x-0.5"
          />
        </Link>
      </div>
    </>
  );
}
