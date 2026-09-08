import { Droplets, Layers, Ruler, ShieldCheck } from 'lucide-react';

import { DeckPanel } from '@/components/deck/deck-panel';

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
    <DeckPanel labelledBy="craftsmanship-heading">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(225,6,0,0.10), transparent 70%)',
        }}
      />

      <div className="container-page relative pt-[clamp(6rem,11svh,7.5rem)] pb-[clamp(1.25rem,3svh,2.5rem)]">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="craftsmanship-heading" className="text-h2 short:text-h3">
            Precision Craftsmanship
          </h2>
          <p className="text-muted-foreground mt-4 text-sm leading-relaxed text-balance md:text-base short:mt-2">
            Engineered materials meeting aerospace tolerances, ensuring complete protection without
            compromising aesthetics.
          </p>
        </div>

        <ul className="mt-[clamp(1.25rem,4svh,4rem)] grid grid-cols-2 gap-3 md:gap-8 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <li
              key={title}
              className="card-surface hover:border-accent/30 flex h-full flex-col items-center rounded-2xl p-5 text-center transition-colors duration-500 md:rounded-3xl md:p-8 lg:p-10 short:p-5"
            >
              <span className="border-border mb-3 flex size-10 items-center justify-center rounded-xl border bg-white/5 md:mb-6 md:size-14 md:rounded-2xl short:mb-3 short:size-10">
                <Icon
                  aria-hidden
                  strokeWidth={1.5}
                  className="text-foreground size-5 md:size-7 short:size-5"
                />
              </span>
              <h3 className="text-sm font-semibold md:text-h3 short:text-sm">{title}</h3>
              <p className="text-muted-foreground mt-1 text-[0.6875rem] leading-snug md:mt-3 md:text-sm md:leading-relaxed short:mt-1 short:text-[0.6875rem]">
                {description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </DeckPanel>
  );
}
