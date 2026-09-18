'use client';

import { useRef } from 'react';

import { SectionIntro } from '@/components/editorial/section-intro';
import { FindYourFitWizard } from '@/features/fit/components/find-your-fit-wizard';
import { useEditorialReveal, useHeadlineReveal } from '@/hooks/use-scroll-motion';

/**
 * The fit funnel, in full, on the homepage.
 *
 * The whole six-step flow runs here rather than on a route of its own. A
 * separate `/find-your-fit` page meant the homepage carried a *different*
 * selector to the one it sent you to — two controls for one job, and a
 * navigation away from the page that was doing the selling. The route now
 * redirects to this section, so every "find your fit" call to action in the
 * header, hero, tables and closing band lands on the module itself.
 *
 * Step one is the drawn brand grid, so the choice is still made by recognition
 * rather than recall — that was the point of the rail this replaced, and the
 * wizard's first step is the same set of tiles.
 */
export function FindYourFitPanel() {
  const scope = useRef<HTMLElement>(null);
  useEditorialReveal(scope);
  useHeadlineReveal(scope);

  return (
    <section
      ref={scope}
      id="find-your-fit"
      aria-labelledby="fit-heading"
      // The header is fixed, so an anchored jump has to clear its real height.
      className="screen-section band-light scroll-mt-[calc(var(--header-height)+1.5rem)] border-b border-border"
    >
      <div className="container-page py-section">
        <div data-reveal>
          <SectionIntro
            eyebrow="Find your fit"
            titleId="fit-heading"
            title={
              <>
                Same car.
                <br />
                A better floor.
              </>
            }
            body="Custom-fit woven mats for 120+ car models. Because a great fit changes everything."
          />
        </div>

        {/*
          Not `data-reveal`. The wizard is the control surface, and a wrapper
          carrying a transform for 900ms is what made its brand tiles miss taps
          on iOS. The heading above still reveals; the thing you press does not
          move before you press it.
        */}
        <div data-no-reveal className="mt-8 md:mt-10">
          <FindYourFitWizard variant="home" />
        </div>
      </div>
    </section>
  );
}
