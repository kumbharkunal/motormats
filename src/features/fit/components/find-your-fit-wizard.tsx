'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';

import { Button } from '@/components/ui/button';
import { COLLECTION_CARDS, collectionPath, type CollectionSlug } from '@/features/catalog/routes';
import { fitCatalogHref, saveFitSelection, type FitSelection } from '@/features/fit/fit-session';
import { VirtualModelList } from '@/features/fit/components/virtual-model-list';
import { yearsForModel } from '@/features/fit/years';
import { BrandMark } from '@/features/vehicles/components/brand-mark';
import { CarSketch } from '@/features/vehicles/components/car-sketch';
import { VEHICLE_BRANDS } from '@/features/vehicles/data/brands';
import { confirmFeedback } from '@/lib/haptics';
import { resyncScroll, scrollToElement } from '@/lib/scroll-sync';
import { cn } from '@/lib/utils';

const STEPS = ['Car', 'Model', 'Year', 'Exact fit', 'Design', 'Buy'] as const;

const MODEL_COUNT = VEHICLE_BRANDS.reduce((n, b) => n + b.models.length, 0);

/** How long the body takes to grow or shrink between steps. */
const RESIZE_MS = 0.32;

type FindYourFitWizardProps = {
  /** Homepage embed uses a tighter layout; full page uses default. */
  variant?: 'home' | 'page';
};

function prefersStillness() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function headerHeightPx() {
  if (typeof window === 'undefined') return 0;
  const root = getComputedStyle(document.documentElement);
  return parseFloat(root.getPropertyValue('--header-height')) * parseFloat(root.fontSize);
}

/**
 * The six-step fit flow.
 *
 * Step one is the same drawn tile as the homepage rail — brand mark over the
 * profile of that brand's best seller — rather than the photograph it used to
 * be. Eight press photographs meant eight backgrounds, eight lighting setups
 * and eight different silver cars at eight different angles, so the grid read
 * as a stock-image sheet. Eighteen line drawings at one stroke weight read as a
 * set, and the brand's own colour is the only thing that changes between them.
 *
 * **Why the body animates its own height.** Picking a brand swapped a six-row
 * grid for a short model list and took ~441px out of the document in a single
 * frame. The browser scroll-anchored to compensate, Lenis's cached limit and
 * every ScrollTrigger start went stale, and the re-measure was debounced 150ms
 * behind it — so for a sixth of a second after the tap the page jumped, settled
 * somewhere else, and read as "the tap did nothing". Tweening the height instead
 * means the document never changes size in one frame, `ScrollTrigger.update`
 * rides along with it, and the re-measure happens once, on purpose, at the end.
 */
export function FindYourFitWizard({ variant = 'page' }: FindYourFitWizardProps) {
  const [step, setStep] = useState(0);
  const [brandSlug, setBrandSlug] = useState<string | null>(null);
  const [modelSlug, setModelSlug] = useState<string | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [materialSlug, setMaterialSlug] = useState<CollectionSlug | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const measuredHeight = useRef<number | null>(null);
  const hasStepped = useRef(false);

  const brand = VEHICLE_BRANDS.find((b) => b.slug === brandSlug) ?? null;
  const model = brand?.models.find((m) => m.slug === modelSlug) ?? null;
  const years = yearsForModel(model?.yearRange);

  const selection: FitSelection | null =
    brand && model && year && materialSlug
      ? {
          brandSlug: brand.slug,
          brandName: brand.name,
          modelSlug: model.slug,
          modelName: model.name,
          year,
          materialSlug,
        }
      : null;

  const buyHref = selection ? fitCatalogHref(selection) : null;

  /**
   * Record the height the body has *now*, before React swaps the step.
   * Every transition goes through here, so nothing can change step without
   * giving the tween somewhere to start.
   */
  const goToStep = useCallback((next: number) => {
    measuredHeight.current = bodyRef.current?.offsetHeight ?? null;
    hasStepped.current = true;
    setStep(Math.min(Math.max(next, 0), STEPS.length - 1));
  }, []);

  useLayoutEffect(() => {
    const body = bodyRef.current;
    const from = measuredHeight.current;
    measuredHeight.current = null;
    if (!body) return;

    const settle = () => {
      body.style.height = '';
      resyncScroll();

      // Put the reader in front of the step they just opened. Only when it is
      // actually out of the frame — scrolling a wizard that is already fully
      // visible is its own kind of jolt.
      const root = rootRef.current;
      if (!root || !hasStepped.current) return;
      const rect = root.getBoundingClientRect();
      const header = headerHeightPx();
      if (rect.top < header || rect.bottom > window.innerHeight) {
        scrollToElement(root, -(header + 24));
      }

      root.querySelector<HTMLElement>('[data-step-heading]')?.focus();
    };

    if (from == null) return;

    const to = body.offsetHeight;
    if (Math.abs(to - from) < 2 || prefersStillness()) {
      settle();
      return;
    }

    const tween = gsap.fromTo(
      body,
      { height: from },
      {
        height: to,
        duration: RESIZE_MS,
        ease: 'power2.inOut',
        overwrite: true,
        // The document is changing size every frame of this, so the triggers
        // reading it have to move with it rather than after it.
        onUpdate: () => ScrollTrigger.update(),
        onComplete: settle,
      },
    );

    return () => {
      tween.kill();
    };
  }, [step]);

  function pickBrand(slug: string) {
    setBrandSlug(slug);
    setModelSlug(null);
    setYear(null);
    setMaterialSlug(null);
    goToStep(1);
  }

  function pickModel(slug: string) {
    setModelSlug(slug);
    setYear(null);
    setMaterialSlug(null);
    goToStep(2);
  }

  function pickYear(y: number) {
    setYear(y);
    setMaterialSlug(null);
    goToStep(3);
  }

  function pickMaterial(slug: CollectionSlug) {
    setMaterialSlug(slug);
    if (brand && model && year) {
      // The end of the flow, and the only thing here that is written down and
      // carried to another page — a heavier pulse than the taps that got here.
      confirmFeedback();
      saveFitSelection({
        brandSlug: brand.slug,
        brandName: brand.name,
        modelSlug: model.slug,
        modelName: model.name,
        year,
        materialSlug: slug,
      });
    }
    goToStep(5);
  }

  const isHome = variant === 'home';

  return (
    <div
      ref={rootRef}
      className={cn('border border-border bg-surface', isHome ? 'p-5 md:p-8' : 'p-6 md:p-10')}
    >
      <div className="mb-10">
        <div className="flex items-baseline justify-between gap-3">
          <p className="caps text-eyebrow text-subtle-foreground">
            Step {step + 1} / {STEPS.length}
          </p>
          <p className="caps text-eyebrow text-foreground">{STEPS[step]}</p>
        </div>
        {/* Square, and a hairline track rather than a rounded bar. */}
        <div className="mt-3 h-px bg-border">
          <div
            className="h-px bg-accent transition-[width] duration-500 ease-(--ease-expo)"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Sighted readers get the progress bar; this is the same news, spoken. */}
      <p aria-live="polite" className="sr-only">
        Step {step + 1} of {STEPS.length}: {STEPS[step]}
      </p>

      <div ref={bodyRef} className="overflow-hidden">
        {step === 0 ? (
          <div>
            <div className="flex items-baseline justify-between gap-4">
              <StepTitle>Select your car brand</StepTitle>
              <p className="caps hidden text-eyebrow text-subtle-foreground sm:block">
                {VEHICLE_BRANDS.length} marques &middot; {MODEL_COUNT} models
              </p>
            </div>

            <BrandGrid
              activeSlug={brandSlug}
              isHome={isHome}
              onPick={pickBrand}
            />
          </div>
        ) : null}

        {step === 1 && brand ? (
          <div>
            <StepTitle>{brand.name} model</StepTitle>
            <VirtualModelList models={[...brand.models]} onPick={pickModel} />
          </div>
        ) : null}

        {step === 2 && model ? (
          <div>
            <StepTitle>Which year is your {model.name}?</StepTitle>

            {/* The chosen model, drawn — so the year step still shows what is
                being configured rather than dropping to a bare list of numbers. */}
            <div className="mt-7 flex items-center gap-6 border border-border p-5">
              <CarSketch
                bodyStyle={model.bodyStyle}
                {...(model.sketch ? { override: model.sketch } : {})}
                className="w-32 shrink-0 text-border-strong"
              />
              <div>
                <p className="caps text-eyebrow text-subtle-foreground">{brand?.name}</p>
                <p className="display-type mt-2 text-h3 text-foreground">{model.name}</p>
              </div>
            </div>

            <ul className="mt-7 flex flex-wrap gap-2">
              {years.map((y) => (
                <li key={y}>
                  <button
                    type="button"
                    onClick={() => pickYear(y)}
                    className={cn(
                      'caps min-h-11 min-w-[5rem] border px-4 py-3 text-label transition-colors duration-300',
                      'active:scale-[0.97]',
                      year === y
                        ? 'border-accent bg-accent text-white'
                        : 'border-border text-foreground hover:border-foreground',
                    )}
                  >
                    {y}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {step === 3 && brand && model && year ? (
          <div className="max-w-lg">
            <StepTitle>Exact fit confirmed</StepTitle>
            <p className="mt-5 text-body text-muted-foreground">
              We laser-cut for{' '}
              <strong className="font-semibold text-foreground">
                {brand.name} {model.name} ({year})
              </strong>
              . Pedal box, tunnel and anchor points included. No universal sizing.
            </p>

            <ul className="mt-7 space-y-3">
              {[
                'Pattern matched to this generation',
                'RHD footwells — driver & passenger wells aligned',
                'Cut after you order — made for your VIN trim',
              ].map((claim) => (
                <li key={claim} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Check aria-hidden className="mt-0.5 size-3.5 shrink-0 text-accent-text" />
                  {claim}
                </li>
              ))}
            </ul>

            <Button
              type="button"
              variant="flat"
              size="caps"
              shape="square"
              className="mt-9"
              onClick={() => goToStep(step + 1)}
            >
              Continue to design <span aria-hidden>&rarr;</span>
            </Button>
          </div>
        ) : null}

        {step === 4 && brand && model && year ? (
          <div>
            <StepTitle>Choose your design</StepTitle>
            <p className="mt-4 text-body text-muted-foreground">
              Same exact fit — pick the surface you want underfoot.
            </p>

            <ul className="mt-7 grid gap-px bg-border sm:grid-cols-2">
              {COLLECTION_CARDS.map((card) => (
                <li key={card.slug}>
                  <button
                    type="button"
                    onClick={() => pickMaterial(card.slug)}
                    className={cn(
                      'h-full w-full p-5 text-left transition-colors duration-300 active:scale-[0.99]',
                      materialSlug === card.slug
                        ? 'bg-surface-hover'
                        : 'bg-surface hover:bg-surface-hover',
                    )}
                  >
                    <p className="caps text-eyebrow text-subtle-foreground">{card.tagline}</p>
                    <p className="display-type mt-3 text-h3 text-foreground">{card.name}</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{card.body}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {step === 5 && selection && buyHref ? (
          <div className="max-w-lg">
            <p className="caps text-eyebrow text-accent-text">Your fit is ready</p>
            <h3 data-step-heading tabIndex={-1} className="display-type mt-4 text-h2 text-foreground outline-none">
              {selection.brandName} {selection.modelName}
            </h3>
            <p className="caps mt-3 text-eyebrow text-subtle-foreground">
              {selection.year} &middot;{' '}
              {COLLECTION_CARDS.find((c) => c.slug === selection.materialSlug)?.name}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="flat" size="caps" shape="square">
                <Link href={buyHref}>
                  Shop this fit <span aria-hidden>&rarr;</span>
                </Link>
              </Button>
              <Button asChild variant="hairline" size="caps" shape="square">
                <Link href={collectionPath(selection.materialSlug)}>Browse the range</Link>
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-10 flex items-center justify-between gap-3 border-t border-border pt-6">
        <button
          type="button"
          onClick={() => goToStep(step - 1)}
          disabled={step === 0}
          className="caps flex min-h-11 items-center gap-2 text-eyebrow text-muted-foreground transition-colors duration-300 hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          <ArrowLeft aria-hidden className="size-3.5" />
          Back
        </button>

        {step > 0 && step < 3 && brandSlug ? (
          <button
            type="button"
              onClick={() => goToStep(step + 1)}
            disabled={step === 1 && !modelSlug}
            className="caps flex min-h-11 items-center gap-2 text-eyebrow text-foreground transition-colors duration-300 hover:text-accent-text disabled:pointer-events-none disabled:opacity-40"
          >
            Next
            <ArrowRight aria-hidden className="size-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

/**
 * The brand tiles, as a radio group.
 *
 * Eighteen tiles in a grid is one control, not eighteen tab stops: arrow keys
 * move between them and Tab leaves the group, which is what a radio group does
 * everywhere else. Roving `tabIndex` is what makes that true for a screen reader
 * and a keyboard alike.
 */
function BrandGrid({
  activeSlug,
  isHome,
  onPick,
}: {
  activeSlug: string | null;
  isHome: boolean;
  onPick: (slug: string) => void;
}) {
  const [focusIndex, setFocusIndex] = useState(0);
  const tiles = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (event: ReactKeyboardEvent<HTMLUListElement>) => {
    const last = VEHICLE_BRANDS.length - 1;
    // The grid is three up below `lg` and six up above it, so the vertical step
    // is read from the layout rather than assumed.
    const columns = window.matchMedia('(min-width: 1024px)').matches ? 6 : 3;

    let next = focusIndex;
    switch (event.key) {
      case 'ArrowRight':
        next += 1;
        break;
      case 'ArrowLeft':
        next -= 1;
        break;
      case 'ArrowDown':
        next += columns;
        break;
      case 'ArrowUp':
        next -= columns;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = last;
        break;
      default:
        return;
    }

    event.preventDefault();
    next = Math.min(Math.max(next, 0), last);
    setFocusIndex(next);
    tiles.current[next]?.focus();
  };

  return (
    <ul
      role="radiogroup"
      aria-label="Car brand"
      onKeyDown={move}
      // Three up, then six. Eighteen brands divide evenly into both, so the last
      // row is never half-empty at either end of the range.
      className="mt-7 grid grid-cols-3 gap-px bg-border lg:grid-cols-6"
    >
      {VEHICLE_BRANDS.map((b, index) => {
        const top = b.models[0];
        const active = activeSlug === b.slug;

        return (
          <li key={b.slug} role="presentation">
            <button
              ref={(node) => {
                tiles.current[index] = node;
              }}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={index === focusIndex ? 0 : -1}
              // Fired on press rather than on click: the confirmation should
              // arrive before the layout moves, not after it.
              // The buzz comes from the delegated listener; this is only
              // the pressed state, which `:active` does not do reliably on iOS.
              onPointerDown={(event) => event.currentTarget.setAttribute('data-pressed', 'true')}
              onPointerUp={(event) => event.currentTarget.removeAttribute('data-pressed')}
              onPointerCancel={(event) => event.currentTarget.removeAttribute('data-pressed')}
              onPointerLeave={(event) => event.currentTarget.removeAttribute('data-pressed')}
              onFocus={() => setFocusIndex(index)}
              onClick={() => onPick(b.slug)}
              style={{ ['--brand' as string]: b.brandColor }}
              className={cn(
                'group/tile relative flex h-full w-full flex-col items-center px-2.5 transition-colors duration-500 sm:px-4',
                // A thumb needs a target, and three rows of tiles multiply any
                // padding here by three in the band's height.
                'min-h-28',
                isHome ? 'gap-2 py-3.5' : 'gap-3 py-5',
                // `:active` is unreliable on iOS, so the pressed state is an
                // attribute we set ourselves.
                'transition-motion data-[pressed=true]:scale-[0.97]',
                active
                  ? 'bg-surface-hover text-(--brand)'
                  : 'bg-surface text-muted-foreground hover:text-(--brand)',
              )}
            >
              <BrandMark brand={b.slug} className="w-6 shrink-0" />

              {top ? (
                <CarSketch
                  bodyStyle={top.bodyStyle}
                  {...(top.sketch ? { override: top.sketch } : {})}
                  className={cn(
                    'w-full max-w-26 transition-motion duration-700 ease-(--ease-smooth)',
                    active ? '-translate-y-0.5' : 'group-hover/tile:-translate-y-0.5',
                  )}
                />
              ) : null}

              <span className="flex flex-col items-center gap-1.5">
                <span
                  className={cn(
                    'caps text-center text-[0.5625rem] leading-[1.3] tracking-[0.16em] transition-colors duration-500',
                    active ? 'text-foreground' : 'text-subtle-foreground',
                  )}
                >
                  {b.name}
                </span>

                {/* Rule that draws itself under the chosen name — the only
                    filled colour in the grid. It sits inside the tile rather
                    than along its top edge, where it read as an underline on
                    the tile above. */}
                <span
                  aria-hidden
                  className={cn(
                    'h-px w-5 origin-center bg-accent transition-transform duration-500 ease-(--ease-expo)',
                    active ? 'scale-x-100' : 'scale-x-0',
                  )}
                />
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function StepTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 data-step-heading tabIndex={-1} className="display-type text-h3 text-foreground outline-none">
      {children}
    </h3>
  );
}
