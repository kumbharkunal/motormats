import { Droplets, Layers, Ruler, ShieldCheck } from 'lucide-react';

import { SectionHeading } from '@/features/home/components/section-heading';

const FEATURES = [
  {
    icon: Ruler,
    title: 'Tailored Fit',
    description: "3D laser-scanned to match every contour of your vehicle's floorpan.",
  },
  {
    icon: Droplets,
    title: '100% Waterproof',
    description: 'Multi-layer construction traps liquid, dirt, and debris instantly.',
  },
  {
    icon: Layers,
    title: 'Anti-Skid Base',
    description: 'MAXGRIP™ backing ensures zero slippage during aggressive driving.',
  },
  {
    icon: ShieldCheck,
    title: '1 Year Warranty',
    description: 'Built to outlast. Backed by our uncompromising 1 year guarantee.',
  },
] as const;

export function CraftsmanshipPanel() {
  return (
    <section aria-labelledby="craftsmanship-heading" className="relative bg-surface">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
        // 4%, not the dark theme's 10%. A red wash gains rather than loses
        // weight over a light ground, and at the old alpha the panel read as
        // tinted pink rather than as a bloom behind the heading.
        style={{
          backgroundImage:
            'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(225,6,0,0.04), transparent 70%)',
        }}
      />

      <div className="relative container-page py-section">
        <SectionHeading
          id="craftsmanship-heading"
          eyebrow="How it is made"
          title="Precision, all the way down"
          body="Engineered materials held to aerospace tolerances — complete protection without compromising how the interior looks."
        />

        <ul className="mt-12 grid grid-cols-2 gap-3 md:mt-16 md:gap-8 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <li
              key={title}
              className="group relative flex h-full flex-col items-center overflow-hidden rounded-2xl card-surface p-5 text-center transition-colors duration-500 hover:border-accent/30 md:rounded-3xl md:p-8 lg:p-10 short:p-5"
            >
              {/* Draws in from the left on hover — transform only, so it stays
                  on the compositor. */}
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-accent transition-motion duration-500 ease-(--ease-expo) group-hover:scale-x-100"
              />
              <span className="mb-3 flex size-10 items-center justify-center rounded-xl border border-accent/25 bg-accent/8 md:mb-6 md:size-14 md:rounded-2xl short:mb-3 short:size-10">
                <Icon
                  aria-hidden
                  strokeWidth={1.5}
                  className="size-5 text-accent md:size-7 short:size-5"
                />
              </span>
              <h3 className="text-sm font-semibold md:text-h3 short:text-sm">{title}</h3>
              <p className="mt-1 text-[0.6875rem] leading-snug text-muted-foreground md:mt-3 md:text-sm md:leading-relaxed short:mt-1 short:text-[0.6875rem]">
                {description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
