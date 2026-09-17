'use client';

import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

import { EditorialFrame } from '@/components/media/editorial-frame';
import { HOME_EDITORIAL_STORIES } from '@/features/home/editorial';
import { useEditorialReveal } from '@/hooks/use-scroll-motion';
import { cn } from '@/lib/utils';

export function EditorialDiscoverSection() {
  const scope = useRef<HTMLElement>(null);

  useEditorialReveal(scope);

  return (
    <section ref={scope} aria-labelledby="editorial-heading" className="band-light border-b border-border">
      <div className="container-page py-section">
        {/* Left, like every other band. A centred intro between two
            left-aligned ones reads as a different page. */}
        <div className="max-w-2xl">
          <h2
            id="editorial-heading"
            data-reveal
            className="display-type text-h2 text-foreground"
          >
            Stories from the floorpan
          </h2>
          <p data-reveal className="mt-5 text-[0.9375rem] leading-relaxed text-muted-foreground md:text-base">
            Like a coachbuilder&apos;s portfolio — real ranges, real fit problems solved. Pick a story
            and see how the interior changes.
          </p>
        </div>

        <ul className="mt-12 space-y-5 md:mt-16 md:space-y-6">
          {HOME_EDITORIAL_STORIES.map((story, index) => (
            <li key={story.id}>
              <article
                data-reveal
                className="group relative overflow-hidden "
              >
                <Link href={story.href} className="grid md:grid-cols-12 md:items-stretch">
                  {/* The plate keeps the file's own 2:3 ratio at every width,
                      so the feature photograph is never trimmed to fit a band. */}
                  <EditorialFrame
                    src={story.image}
                    alt={story.imageAlt}
                    ratio="2/3"
                    sizes="(max-width: 767px) 100vw, 42vw"
                    className={cn('md:col-span-5', index % 2 === 1 && 'md:order-2')}
                    imageClassName="transition-motion duration-700 ease-(--ease-smooth) group-hover:scale-[1.03]"
                  >
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"
                    />
                  </EditorialFrame>

                  <div
                    className={cn(
                      'flex flex-col justify-center border-t border-border bg-surface p-6 md:col-span-7 md:border-t-0 md:border-l md:p-10 lg:p-14',
                      index % 2 === 1 && 'md:order-1 md:border-r md:border-l-0',
                    )}
                  >
                    <p className="text-eyebrow font-semibold tracking-[0.2em] text-accent uppercase">
                      {story.kicker}
                    </p>
                    <h3 className="display-type mt-4 text-h3 text-foreground">
                      {story.title}
                    </h3>
                    <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground md:text-[0.9375rem]">
                      {story.body}
                    </p>
                    <span className="caps mt-8 inline-flex min-h-12 w-fit items-center gap-3 border border-border bg-surface px-6 text-label transition-colors duration-300 group-hover:border-accent group-hover:bg-accent/5">
                      {story.cta}
                      <ArrowUpRight
                        aria-hidden
                        className="size-4 transition-motion duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </span>
                  </div>
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
