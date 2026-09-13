import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { SHOP_ROUTES } from '@/features/catalog/routes';
import { MatsFloorCompare } from '@/features/home/components/mats-floor-compare';

/** Floorpan compare — drag divider; Motormats lockup on premium side. */
export function MatsComparisonPanel() {
  return (
    <section aria-labelledby="compare-heading" className="band-light border-t border-border">
      <div className="container-page flex flex-col items-center py-section text-center">
        <h2 id="compare-heading" className="max-w-2xl text-h2 text-foreground">
          See the difference on your floorpan
        </h2>
        <p className="mt-5 max-w-xl text-balance text-[0.9375rem] leading-relaxed text-muted-foreground md:text-base">
          Top-down sedan floorplan with all four mat zones — generic fit on the left, Motormats
          premium on the right. Drag the divider to compare side by side.
        </p>

        <Button asChild className="mt-8 min-w-[10rem] uppercase tracking-wide md:mt-10" size="lg">
          <Link href={SHOP_ROUTES.collections}>View all</Link>
        </Button>

        <div className="mt-10 w-full md:mt-14">
          <MatsFloorCompare />
        </div>
      </div>
    </section>
  );
}
