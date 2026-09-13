'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { useState } from 'react';

import { finishSwatchHref, HOME_FINISH_SWATCHES } from '@/features/home/editorial';
import { cn } from '@/lib/utils';

function SwatchTexture({ texture, accent }: { texture: string; accent: string }) {
  if (texture === 'weave') {
    return (
      <svg className="size-full" aria-hidden viewBox="0 0 80 80">
        <defs>
          <pattern id="weave" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M0 0 L8 8 M8 0 L0 8" stroke={accent} strokeWidth="0.75" opacity={0.5} />
          </pattern>
        </defs>
        <rect width="80" height="80" fill="url(#weave)" />
      </svg>
    );
  }
  if (texture === 'pile') {
    return (
      <div
        className="size-full opacity-80"
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, ${accent}22 0 2px, transparent 2px 5px)`,
        }}
      />
    );
  }
  if (texture === 'channels') {
    return (
      <svg className="size-full" aria-hidden viewBox="0 0 80 80">
        {[18, 34, 50, 66].map((y) => (
          <path key={y} d={`M8 ${y} Q40 ${y - 4} 72 ${y}`} fill="none" stroke={accent} strokeWidth="2" opacity={0.45} />
        ))}
      </svg>
    );
  }
  return (
    <div
      className="size-full rounded-[inherit] border-2 border-dashed"
      style={{ borderColor: `${accent}66` }}
    />
  );
}

export function FinishStudioSection() {
  const [active, setActive] = useState(0);
  const swatch = HOME_FINISH_SWATCHES[active] ?? HOME_FINISH_SWATCHES[0];

  return (
    <section aria-labelledby="finish-studio-heading" className="band-dark border-y border-white/10">
      <div className="container-page py-section">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <p className="flex items-center gap-3 text-eyebrow font-semibold text-accent-on-dark uppercase">
              <span aria-hidden className="h-px w-6 bg-accent" />
              Material studio
            </p>
            <h2 id="finish-studio-heading" className="mt-5 text-h2 font-semibold tracking-tight text-white">
              Pick the surface. Same laser fit.
            </h2>
            <p className="mt-5 max-w-lg text-[0.9375rem] leading-relaxed text-white/65 md:text-base">
              CarBone builds interiors around texture and craft — we do the same for the floor. Every
              range shares one scanned pattern; you choose how it looks and feels underfoot.
            </p>

            <ul className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Mat finishes">
              {HOME_FINISH_SWATCHES.map((item, index) => (
                <li key={item.id} role="presentation">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={active === index}
                    onClick={() => setActive(index)}
                    className={cn(
                      'rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-300',
                      active === index
                        ? 'border-accent bg-accent text-white'
                        : 'border-white/20 bg-white/5 text-white/85 hover:border-white/40',
                    )}
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>

            <motion.div
              key={swatch.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="mt-8"
            >
              <p className="text-lg font-semibold text-white">{swatch.name}</p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-white/65">{swatch.blurb}</p>
              <Link
                href={finishSwatchHref(swatch)}
                className="group mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent-on-dark"
              >
                Shop {swatch.name}
                <ArrowRight
                  aria-hidden
                  size={16}
                  className="transition-motion duration-300 group-hover:translate-x-1"
                />
              </Link>
            </motion.div>
          </div>

          <Link
            href={finishSwatchHref(swatch)}
            className="relative block aspect-square overflow-hidden rounded-3xl border border-border bg-background shadow-raised transition-shadow duration-300 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.2)]"
          >
            <motion.div layout className="absolute inset-0">
            <motion.div
              key={swatch.id}
              initial={{ opacity: 0.6, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-6 rounded-2xl md:inset-8"
              style={{ backgroundColor: swatch.hue }}
            >
              <SwatchTexture texture={swatch.texture} accent={swatch.accent} />
            </motion.div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-6 pt-16">
              <p className="text-eyebrow font-semibold text-accent-on-dark uppercase">Preview</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{swatch.name}</p>
              <p className="mt-2 text-sm font-medium text-white/80">Tap to open range →</p>
            </div>
            </motion.div>
          </Link>
        </div>
      </div>
    </section>
  );
}
