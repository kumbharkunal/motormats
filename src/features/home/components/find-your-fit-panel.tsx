import Link from 'next/link';

import { SHOP_ROUTES } from '@/features/catalog/routes';
import { FitFlowSteps } from '@/features/fit/components/fit-flow-steps';
import { FindYourFitWizard } from '@/features/fit/components/find-your-fit-wizard';

/** Primary fit funnel — replaces brand-rail-as-navigation on the homepage. */
export function FindYourFitPanel() {
  return (
    <section aria-labelledby="fit-heading" className="band-light border-b border-border">
      <div className="container-page py-section">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-eyebrow font-semibold tracking-[0.22em] text-accent uppercase">
            Find your perfect fit
          </p>
          <h2 id="fit-heading" className="mt-4 text-h2 font-semibold tracking-tight text-balance">
            Mats cut for your exact car
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            Six quick steps — same flow we use on Instagram — from your make and model to checkout.
          </p>
          <div className="mt-8">
            <FitFlowSteps />
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-4xl">
          <FindYourFitWizard variant="home" />
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already know your range?{' '}
          <Link href={SHOP_ROUTES.collections} className="font-semibold text-foreground underline underline-offset-4">
            Skip to all collections
          </Link>
        </p>
      </div>
    </section>
  );
}
