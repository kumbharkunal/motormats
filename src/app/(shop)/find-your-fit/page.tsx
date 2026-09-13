import type { Metadata } from 'next';

import { FitFlowSteps } from '@/features/fit/components/fit-flow-steps';
import { FindYourFitWizard } from '@/features/fit/components/find-your-fit-wizard';

export const metadata: Metadata = {
  title: 'Find Your Perfect Fit',
  description:
    'Choose your car, model and year, confirm exact fit, pick a material, and shop Motormats cut for your floorpan.',
  alternates: { canonical: '/find-your-fit' },
};

export default function FindYourFitPage() {
  return (
    <div className="band-light min-h-[70vh]">
      <div className="container-page py-12 md:py-16">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-eyebrow font-semibold tracking-[0.22em] text-accent uppercase">
            Find your perfect fit
          </p>
          <h1 className="mt-4 text-h1 font-semibold tracking-tight text-balance">Built for your exact car</h1>
          <p className="mt-4 text-muted-foreground">
            No size charts. Pick your vehicle, confirm the floorpan, choose a material, and shop.
          </p>
          <div className="mt-8">
            <FitFlowSteps />
          </div>
        </header>

        <div className="mx-auto mt-10 max-w-4xl">
          <FindYourFitWizard variant="page" />
        </div>
      </div>
    </div>
  );
}
