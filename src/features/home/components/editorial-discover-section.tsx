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
    <section
      ref={scope}
      aria-labelledby="editorial-heading"
      className="screen-section band-light border-b border-border"
    >
      <div className="container-page pt-section pb-8 md:pb-10">
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
      </div>

      {/*
        A rail, not a stack. Set as full-width 2:3 spreads these stories came to
        three and a half screens on their own — a third of the homepage for one
        band. Sideways they keep every one and cost a single screen.

        No `data-native-scroll` here on purpose. That attribute tells Lenis to
        keep away entirely, which is right for a scroller you read *down* and
        wrong for one you read *across*: it left the wheel with nothing to
        scroll and the page froze under the cursor. Lenis runs with
        `allowNestedScroll`, so it already gives a sideways gesture to this rail
        and a vertical one to the page.
      */}
      <ul
        aria-label="Stories from the floorpan"
        className={cn(
          'native-scroll flex snap-x snap-mandatory gap-px bg-border pb-(--gutter-page)',
          '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        )}
      >
        {HOME_EDITORIAL_STORIES.map((story) => (
          <li
            key={story.id}
            data-reveal
            className="w-[82vw] shrink-0 snap-start sm:w-[54vw] lg:w-[33.2vw]"
          >
            <article className="group h-full">
              <Link href={story.href} className="flex h-full flex-col bg-surface">
                <EditorialFrame
                  src={story.image}
                  alt={story.imageAlt}
                  ratio="4/3"
                  sizes="(max-width: 639px) 82vw, (max-width: 1023px) 54vw, 38vw"
                  imageClassName="transition-motion duration-700 ease-(--ease-smooth) group-hover:scale-[1.03]"
                >
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"
                  />
                </EditorialFrame>

                <div className="flex flex-1 flex-col p-6 lg:p-8">
                  <p className="text-eyebrow font-semibold tracking-[0.2em] text-accent uppercase">
                    {story.kicker}
                  </p>
                  <h3 className="display-type mt-3 text-h3 text-foreground">{story.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{story.body}</p>
                  <span className="caps mt-auto inline-flex min-h-12 w-fit items-center gap-3 border border-border bg-surface px-6 text-label transition-colors duration-300 group-hover:border-accent group-hover:bg-accent/5">
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
    </section>
  );
}
