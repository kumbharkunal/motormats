'use client';

import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

import { EditorialFrame } from '@/components/media/editorial-frame';
import { HOME_EDITORIAL_STORIES } from '@/features/home/editorial';
import { PHOTOS, type Photo } from '@/features/home/photo-assets';
import { useEditorialReveal, useHeadlineReveal, useParallaxPlates } from '@/hooks/use-scroll-motion';

/**
 * The photography band.
 *
 * One band in place of five. `cover-story`, `photo-essay`, `interior-spread`,
 * `real-conditions` and `editorial-discover` were five separate screens of the
 * same material — a plate, a caption, a rule — and reading them in sequence was
 * the single biggest reason the page felt long without feeling full.
 *
 * Ink, because it is the only band on the page that is all photograph. Six
 * frames on paper compete with the product cards above them for the same
 * attention; on ink they read as a plate section in a magazine, and the page
 * gets a pulse between the two light halves.
 *
 * Plates move, pictures do not: `data-parallax` translates the frame, and the
 * hook sits out below 768px entirely, where a composite per frame is the most
 * expensive thing on the page.
 */

/**
 * The three frames that carry no caption — the shoot, not the argument.
 *
 * The guard is not ceremony: `PHOTOS.essay` is a `Photo[]`, so under
 * `noUncheckedIndexedAccess` an index into it is possibly undefined, and a cast
 * here would be a lie the day someone shortens the list.
 */
const PLATES: Photo[] = [PHOTOS.essay[0], PHOTOS.essay[3], PHOTOS.interiors.wide].filter(
  (plate): plate is Photo => plate !== undefined,
);

export function InTheWildSection() {
  const scope = useRef<HTMLElement>(null);

  useEditorialReveal(scope);
  useHeadlineReveal(scope);
  useParallaxPlates(scope);

  return (
    <section
      ref={scope}
      aria-labelledby="wild-heading"
      className="band-dark border-b border-border"
    >
      <div className="container-page py-section">
        <div data-reveal className="max-w-2xl">
          <p className="caps text-eyebrow text-subtle-foreground">In the wild</p>
          <h2 id="wild-heading" className="mt-5 overflow-hidden pb-[0.12em] text-h2 text-foreground">
            <span data-headline className="display-type block">
              Stories from the floorpan
            </span>
          </h2>
          <p className="mt-5 text-body text-muted-foreground">
            Real ranges, real fit problems solved. Pick a story and see how the interior changes.
          </p>
        </div>

        {/* The three ranges, each as one tall plate. */}
        <ul className="mt-12 grid gap-px bg-border md:mt-16 md:grid-cols-3">
          {HOME_EDITORIAL_STORIES.map((story, index) => (
            <li key={story.id} data-reveal className="bg-ink">
              <Link
                href={story.href}
                className="group/story block h-full"
              >
                <div data-parallax={index === 1 ? '2' : '1'}>
                  <EditorialFrame
                    src={story.image}
                    alt={story.imageAlt}
                    ratio="2/3"
                    sizes="(max-width: 767px) 92vw, 32vw"
                    imageClassName="transition-motion duration-700 ease-expo group-hover/story:scale-[1.03]"
                  />
                </div>

                <div className="p-6 md:p-7">
                  <p className="caps text-eyebrow text-accent-text">{story.kicker}</p>
                  <h3 className="display-type mt-4 text-h3 text-foreground">{story.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{story.body}</p>
                  <span className="caps mt-6 inline-flex items-center gap-2 text-eyebrow text-foreground">
                    {story.cta}
                    <ArrowUpRight
                      aria-hidden
                      className="size-3.5 transition-motion duration-300 group-hover/story:translate-x-0.5 group-hover/story:-translate-y-0.5"
                    />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {/* A plate strip with no argument attached to it. The shoot is the
            reason to keep scrolling; captions here would only repeat the three
            stories above. */}
        <ul className="plate-gap mt-px grid grid-cols-2 gap-px bg-border md:grid-cols-3">
          {PLATES.map((plate, index) => (
            <li
              key={plate.src}
              data-reveal
              className={index === 2 ? 'col-span-2 md:col-span-1' : undefined}
            >
              <div data-parallax={index === 1 ? '3' : '1'}>
                <EditorialFrame
                  src={plate.src}
                  alt={plate.alt}
                  ratio="2/3"
                  sizes="(max-width: 767px) 48vw, 32vw"
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
