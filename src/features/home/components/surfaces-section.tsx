'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { ArrowLink } from '@/components/editorial/arrow-link';
import { SectionIntro } from '@/components/editorial/section-intro';
import { EditorialFrame } from '@/components/media/editorial-frame';
import { SHOP_ROUTES } from '@/features/catalog/routes';
import { SURFACES } from '@/features/home/surfaces';
import { useEditorialReveal, useHeadlineReveal } from '@/hooks/use-scroll-motion';
import { cn } from '@/lib/utils';

/**
 * The nine surfaces, as a carousel.
 *
 * Nine cards will not sit in a grid on this page without either shrinking the
 * photographs past the point where two weaves look different, or running to
 * three rows and turning a choice into a catalogue. A rail keeps every card at
 * a size where the topsheet is legible and makes the length of the range the
 * first thing you notice.
 *
 * It is a scroll-snap scroller, not a transform carousel: swipe, trackpad,
 * arrows, tab and the scrollbar all drive the same one property, so there is no
 * second source of truth about which card is showing. Lenis sorts the two axes
 * out itself through `allowNestedScroll` — the rail must *not* carry
 * `data-native-scroll`, which shuts Lenis off here and froze the page under the
 * cursor.
 *
 * The cards are figures rather than links. Surfaces are not catalogue routes —
 * the collections are cut by construction, not by weave — and a card that
 * navigates somewhere unrelated to its own name is worse than a card that does
 * not navigate. The section's one link stays in the intro.
 */
export function SurfacesSection() {
  const scope = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEditorialReveal(scope);
  useHeadlineReveal(scope);

  const syncEdges = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    // A pixel of slack: fractional layout widths mean scrollLeft rarely lands
    // exactly on the maximum, and the arrow would never disable.
    setAtStart(rail.scrollLeft <= 1);
    setAtEnd(rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 1);
  }, []);

  useEffect(() => {
    syncEdges();
    const rail = railRef.current;
    if (!rail) return;
    rail.addEventListener('scroll', syncEdges, { passive: true });
    window.addEventListener('resize', syncEdges);
    return () => {
      rail.removeEventListener('scroll', syncEdges);
      window.removeEventListener('resize', syncEdges);
    };
  }, [syncEdges]);

  const step = useCallback((direction: 1 | -1) => {
    const rail = railRef.current;
    const card = rail?.firstElementChild;
    if (!rail || !card) return;
    // One card plus the hairline gap, measured rather than assumed, so the
    // arrows land on a snap point at every breakpoint.
    const gap = Number.parseFloat(getComputedStyle(rail).columnGap || '0') || 0;
    rail.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: 'smooth' });
  }, []);

  return (
    <section
      ref={scope}
      aria-labelledby="surfaces-heading"
      // Paper. The page carries its ink in three deliberate places — the cover,
      // the photography band and the close — and a fourth here broke the rhythm
      // by putting two dark screens either side of the comparison.
      className="band-light border-b border-border"
    >
      <div className="container-page pt-section pb-6 md:pb-8">
        <div data-reveal>
          <SectionIntro
            eyebrow="Our surfaces"
            titleId="surfaces-heading"
            title={
              <>
                Nine ways
                <br />
                to finish your interior.
              </>
            }
            body={
              <>
                Same precision fit.
                <br />
                Different material experience.
              </>
            }
            action={
              /*
                One row, not a stack.

                The link and the arrows used to sit one above the other in the
                intro's right-hand column, which made that column three blocks
                tall against a two-line headline on the left \u2014 so the band opened
                with a wide strip of empty paper between them before the
                photography could start. Side by side they are one 44px row, and
                the header gives roughly 90px back to the rail below it.
              */
              <div className="flex items-center gap-5 lg:justify-end">
                <ArrowLink href={SHOP_ROUTES.collections}>Explore all</ArrowLink>

                {/* Square, hairline. Hidden on touch widths, where the swipe is
                    the control and an arrow is just something to mis-tap. */}
                <div className="hidden items-center gap-px bg-border md:flex">
                  {([-1, 1] as const).map((direction) => (
                    <button
                      key={direction}
                      type="button"
                      onClick={() => step(direction)}
                      disabled={direction === -1 ? atStart : atEnd}
                      aria-label={direction === -1 ? 'Previous surfaces' : 'Next surfaces'}
                      className="grid size-11 place-items-center bg-ink text-white transition-colors duration-300 hover:bg-accent disabled:pointer-events-none disabled:text-white/25"
                    >
                      <span aria-hidden>{direction === -1 ? '\u2190' : '\u2192'}</span>
                    </button>
                  ))}
                </div>
              </div>
            }
          />
        </div>
      </div>

      <ul
        ref={railRef}
        aria-label="The nine Motormats surfaces"
        className={cn(
          'native-scroll flex snap-x snap-mandatory gap-px bg-border',
          '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        )}
      >
        {SURFACES.map((surfaceItem, index) => (
          <li
            key={surfaceItem.src}
            data-reveal
            // Wider than it was at xl: the band is a screen tall and the intro
            // only needs a third of it, so the rest belongs to the photography
            // rather than to empty ground under the headline. Width is what
            // sets the plate's height at a fixed 4:3.
            className="group flex w-[78vw] shrink-0 snap-start flex-col bg-surface sm:w-[46vw] lg:w-[34vw] xl:w-[28rem]"
          >
            <EditorialFrame
              src={surfaceItem.src}
              alt={surfaceItem.alt}
              ratio="4/3"
              sizes="(max-width: 639px) 78vw, (max-width: 1023px) 46vw, 34vw"
              quality={82}
              imageClassName="transition-motion duration-[1200ms] group-hover:scale-[1.04]"
            />

            <div className="flex flex-1 flex-col gap-5 p-5 md:p-6">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="display-type text-h3 text-foreground">{surfaceItem.name}</h3>
                <span aria-hidden className="caps text-eyebrow text-subtle-foreground">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground">{surfaceItem.body}</p>

              <p className="mt-auto text-sm text-foreground">{surfaceItem.tagline}</p>

              <p className="caps border-t border-border pt-4 text-eyebrow text-subtle-foreground">
                {surfaceItem.colors.join(' · ')}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
