import { Award, Star, Truck, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

import { DeckPanel } from '@/components/deck/deck-panel';
import { Button } from '@/components/ui/button';
import { HeroBackdrop } from '@/features/home/components/hero-backdrop';

const TRUST_BADGES = [
  { icon: Truck, label: 'Free shipping' },
  { icon: ShieldCheck, label: '1 year warranty' },
  { icon: Star, label: '4.9 rated' },
  { icon: Award, label: 'Precision cut' },
] as const;

export function HeroPanel() {
  return (
    <DeckPanel labelledBy="hero-heading" className="justify-end">
      <HeroBackdrop />

      <div className="container-page relative z-10 w-full pt-20 pb-12 md:pb-24 short:pb-8">
        <h1
          id="hero-heading"
          className="text-display text-foreground/90 max-w-4xl text-center md:text-left short:text-h1"
        >
          Engineered to Drive.
          <br />
          <span className="text-gradient">Tailored for Your Floor.</span>
        </h1>

        <p className="text-muted-foreground mx-auto mt-5 max-w-xl text-center text-[0.9375rem] leading-relaxed text-balance md:mx-0 md:text-left short:mt-3">
          Custom-fit protection and style, precision-cut for your exact vehicle.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center md:justify-start short:mt-5">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/collections">Shop now</Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="w-full sm:w-auto">
            <Link href="/our-story">Our story</Link>
          </Button>
        </div>

        <ul className="mt-10 hidden gap-10 md:flex lg:gap-14 short:hidden">
          {TRUST_BADGES.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3">
              <span className="border-border flex size-10 shrink-0 items-center justify-center rounded-xl border bg-white/5">
                <Icon aria-hidden size={16} strokeWidth={1.5} className="text-accent-text" />
              </span>
              <span className="text-muted-foreground text-xs tracking-[0.15em] uppercase">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </DeckPanel>
  );
}
