'use client';

import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';

import { HOME_EDITORIAL_STORIES } from '@/features/home/editorial';
import { cn } from '@/lib/utils';

export function EditorialDiscoverSection() {
  return (
    <section aria-labelledby="editorial-heading" className="band-dark section-defer">
      <div className="container-page py-section">
        <div className="mx-auto max-w-2xl text-center">
          <p className="flex items-center justify-center gap-3 text-eyebrow font-semibold text-accent-on-dark uppercase">
            <span aria-hidden className="h-px w-6 bg-accent-on-dark" />
            In the cabin
          </p>
          <h2 id="editorial-heading" className="mt-5 text-h2 font-semibold tracking-tight text-white">
            Stories from the floorpan
          </h2>
          <p className="mt-5 text-[0.9375rem] leading-relaxed text-white/65 md:text-base">
            Like a coachbuilder&apos;s portfolio — real ranges, real fit problems solved. Pick a story
            and see how the interior changes.
          </p>
        </div>

        <ul className="mt-12 space-y-5 md:mt-16 md:space-y-6">
          {HOME_EDITORIAL_STORIES.map((story, index) => (
            <li key={story.id}>
              <motion.article
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-8%' }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: index * 0.06 }}
                className="group relative overflow-hidden rounded-2xl md:rounded-3xl"
              >
                <Link href={story.href} className="grid md:grid-cols-12 md:items-stretch">
                  <div
                    className={cn(
                      'relative aspect-[16/10] md:aspect-auto md:min-h-[22rem]',
                      index % 2 === 1 ? 'md:col-span-7 md:order-2' : 'md:col-span-7',
                    )}
                  >
                    <Image
                      src={story.image}
                      alt={story.imageAlt}
                      fill
                      sizes="(max-width: 767px) 100vw, 58vw"
                      className="object-cover transition-motion duration-700 ease-(--ease-smooth) group-hover:scale-[1.03]"
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent md:bg-gradient-to-r md:from-black/40 md:via-transparent md:to-transparent"
                    />
                  </div>

                  <div
                    className={cn(
                      'flex flex-col justify-center bg-white/[0.04] p-6 md:p-10 lg:p-12',
                      index % 2 === 1 ? 'md:col-span-5 md:order-1' : 'md:col-span-5',
                    )}
                  >
                    <p className="text-eyebrow font-semibold tracking-[0.2em] text-accent-on-dark uppercase">
                      {story.kicker}
                    </p>
                    <h3 className="mt-4 text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-tight tracking-tight text-white">
                      {story.title}
                    </h3>
                    <p className="mt-4 max-w-md text-sm leading-relaxed text-white/65 md:text-[0.9375rem]">
                      {story.body}
                    </p>
                    <span className="mt-8 inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-white/25 bg-white/5 px-5 text-sm font-semibold transition-colors duration-300 group-hover:border-accent-on-dark group-hover:bg-accent/20">
                      {story.cta}
                      <ArrowUpRight
                        aria-hidden
                        className="size-4 transition-motion duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </span>
                  </div>
                </Link>
              </motion.article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
