import { Award, Star, Truck, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { HeroBackdrop } from '@/features/home/components/hero-backdrop';

const TRUST_BADGES = [
  { icon: Truck, label: 'Free shipping' },
  { icon: ShieldCheck, label: '1 year warranty' },
  { icon: Star, label: '4.9 rated' },
  { icon: Award, label: 'Precision cut' },
] as const;

/**
 * The hero is a deliberate dark island in a light storefront: the type sits on
 * footage, so it is white and carries its own contrast rather than borrowing
 * the page's ink. The alternative — washing the video pale enough for dark text
 * — meant covering the picture with the very thing it was there to show.
 */
export function HeroPanel() {
  return (
    // Pulled up by the header's own height so the footage runs to the top of
    // the viewport and the sticky header floats over it.
    <section
      aria-labelledby="hero-heading"
      className="relative -mt-(--header-height) flex min-h-svh flex-col justify-end overflow-hidden"
    >
      <HeroBackdrop />

      <div className="relative z-10 container-page w-full pt-20 pb-16 md:pb-24 short:pb-8">
        <p className="flex items-center justify-center gap-3 text-eyebrow font-semibold text-white/80 uppercase md:justify-start">
          <span aria-hidden className="h-px w-8 bg-accent" />
          Custom-fit car mats
        </p>

        <h1
          id="hero-heading"
          className="mt-6 max-w-4xl text-center text-display text-white md:text-left short:mt-4 short:text-h1"
        >
          Engineered to drive.
          <br />
          <span className="text-white/70 italic">Tailored for your floor.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-center text-[0.9375rem] leading-relaxed text-balance text-white/70 md:mx-0 md:text-left short:mt-3">
          Custom-fit protection and style, precision-cut for your exact vehicle.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center md:justify-start short:mt-5">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/collections">Shop now</Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="lg"
            className="w-full border-white/35 bg-white/10 text-white hover:border-white hover:bg-white/20 sm:w-auto"
          >
            <Link href="/our-story">Our story</Link>
          </Button>
        </div>

        <ul className="mt-10 hidden gap-10 md:flex lg:gap-14 short:hidden">
          {TRUST_BADGES.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/10">
                <Icon aria-hidden size={16} strokeWidth={1.5} className="text-white" />
              </span>
              <span className="text-xs tracking-[0.15em] text-white/70 uppercase">{label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/*
       * The bottom edge of the hero, published for the header band. It flips
       * from its transparent dark-glass state to the light page band when this
       * crosses the header line — a real element rather than a guessed scroll
       * offset, so the two cannot drift apart.
       */}
      <div aria-hidden data-header-boundary className="absolute inset-x-0 bottom-0 h-px" />
    </section>
  );
}
