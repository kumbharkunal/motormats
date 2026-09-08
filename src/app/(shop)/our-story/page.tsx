import { Layers, Ruler, ShieldCheck, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { PageShell } from '@/features/marketing/components/page-shell';

export const metadata: Metadata = {
  title: 'Our Story',
  description:
    'Why Motormats laser-scans every floorpan, how our four ranges differ, and what a precision-cut mat actually changes about a car interior.',
  alternates: { canonical: '/our-story' },
};

const PRINCIPLES = [
  {
    icon: Ruler,
    title: 'Measured, not approximated',
    body: 'Every pattern starts from a 3D scan of the actual floorpan. A universal mat leaves gaps at the pedals and rides up under the heel; a scanned one does not.',
  },
  {
    icon: Layers,
    title: 'Built in layers',
    body: 'A wear surface chosen for the range, a dual-density core that keeps the mat flat, and a backing that grips the carpet rather than sliding across it.',
  },
  {
    icon: ShieldCheck,
    title: 'Backed for a year',
    body: 'Every set carries a one year warranty against manufacturing defects. If a mat fails in normal use, it gets replaced.',
  },
  {
    icon: Sparkles,
    title: 'Finished like trim',
    body: 'Bound edges, stitched borders and a badge that sits flush. The mat should look like it left the factory with the car.',
  },
] as const;

const RANGES = [
  {
    name: '7D Luxury',
    href: '/collections/7d-luxury',
    body: 'Deep-dish moulding with a raised lip that contains spills before they reach the carpet.',
  },
  {
    name: 'Carbon Series',
    href: '/collections/carbon',
    body: 'A carbon-weave topsheet with a technical, low-gloss finish that sheds dust instead of trapping it.',
  },
  {
    name: 'Executive Carpet',
    href: '/collections/carpet',
    body: 'Tufted pile over a moulded rubber backing — warmer underfoot, with reinforcement at the heel.',
  },
  {
    name: 'All-Weather',
    href: '/collections/all-weather',
    body: 'Channelled trays for monsoon use. Lift out, rinse down, refit — no drying time.',
  },
] as const;

export default function OurStoryPage() {
  return (
    <PageShell
      breadcrumb="Our Story"
      title="Precision is the whole product"
      intro="A car mat is a simple object that is easy to make badly. Ours exist because the alternative — a rectangle of rubber that slides under the pedals — is still what most cars are sold with."
      wide
    >
      <div className="max-w-3xl space-y-5 text-sm leading-relaxed md:text-base">
        <p className="text-muted-foreground">
          Motormats makes custom-fit mats for the Indian market: monsoon on one side of the year,
          dust on the other, and interiors that owners genuinely care about. Both conditions punish
          a generic mat, and both are solved the same way — by cutting to the exact floorpan rather
          than to a size bracket.
        </p>
        <p className="text-muted-foreground">
          That means a scan per model, a pattern per variant, and a finish chosen for how the car is
          actually used. It is slower than stamping one shape in three sizes. It is also the only
          way the mat sits flat, stays put, and still looks right two years in.
        </p>
      </div>

      <section aria-labelledby="principles-heading" className="mt-14">
        <h2 id="principles-heading" className="text-h3">
          How we build
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {PRINCIPLES.map(({ icon: Icon, title, body }) => (
            <li key={title} className="card-surface rounded-2xl p-6 md:rounded-3xl">
              <span className="border-border mb-4 flex size-11 items-center justify-center rounded-xl border bg-white/5">
                <Icon aria-hidden strokeWidth={1.5} className="text-accent-text size-5" />
              </span>
              <h3 className="text-sm font-semibold md:text-base">{title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="ranges-heading" className="mt-14">
        <h2 id="ranges-heading" className="text-h3">
          Four ranges
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {RANGES.map((range) => (
            <li key={range.name}>
              <Link
                href={range.href}
                className="card-surface hover:border-accent/30 block h-full rounded-2xl p-6 transition-colors duration-300 md:rounded-3xl"
              >
                <h3 className="text-sm font-semibold md:text-base">{range.name}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{range.body}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-14 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/collections">Browse collections</Link>
        </Button>
        <Button asChild variant="ghost" size="lg">
          <Link href="/contact">Ask about your vehicle</Link>
        </Button>
      </div>
    </PageShell>
  );
}
