'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

import { Button } from '@/components/ui/button';
import { SHOP_ROUTES } from '@/features/catalog/routes';
import { HOME_MAKING_STEPS } from '@/features/home/editorial';

export function ScanToShipSection() {
  return (
    <section aria-labelledby="making-heading" className="band-light relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent"
      />
      <div className="container-page py-section">
        <div className="mx-auto max-w-2xl text-center">
          <p className="flex items-center justify-center gap-3 text-eyebrow font-semibold text-accent uppercase">
            <span aria-hidden className="h-px w-6 bg-accent" />
            Design to delivery
          </p>
          <h2 id="making-heading" className="mt-5 text-h2">
            From scan to your driveway
          </h2>
          <p className="mt-5 text-[0.9375rem] leading-relaxed text-muted-foreground md:text-base">
            Coachbuilders talk about visualization before leather is cut. We work the same way — measure
            first, then produce one set for your car.
          </p>
        </div>

        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-5">
          {HOME_MAKING_STEPS.map((item, index) => (
            <motion.li
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-5%' }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="relative flex h-full flex-col rounded-2xl border border-border bg-surface p-6 md:rounded-3xl md:p-8"
            >
              <span
                aria-hidden
                className="text-[3rem] font-bold leading-none text-accent/20 md:text-[3.5rem]"
              >
                {item.step}
              </span>
              <h3 className="mt-4 text-base font-semibold md:text-lg">{item.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              {index === HOME_MAKING_STEPS.length - 1 ? (
                <span aria-hidden className="mt-4 h-0.5 w-8 bg-accent" />
              ) : null}
            </motion.li>
          ))}
        </ol>

        <div className="mt-12 flex flex-col items-center gap-3 sm:flex-row sm:justify-center md:mt-14">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href={SHOP_ROUTES.collections}>Find mats for your car</Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="w-full border border-border sm:w-auto">
            <Link href={SHOP_ROUTES.ourStory}>How we work</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
