import { cn } from '@/lib/utils';

/**
 * The heading block every homepage section opens with.
 *
 * Three ranks doing three jobs: a small red eyebrow in the UI face to place the
 * section and carry the brand colour into a page that is otherwise mostly
 * white; the serif heading; and optional supporting copy. Shared rather than
 * repeated so the sections cannot drift apart in spacing or scale — which is
 * most of what makes a long page feel unconsidered.
 */
export function SectionHeading({
  id,
  eyebrow,
  title,
  body,
  align = 'center',
  tone = 'ink',
  className,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  body?: string;
  align?: 'center' | 'start';
  /** `light` for the dark bands, where the ink palette would disappear. */
  tone?: 'ink' | 'light';
  className?: string;
}) {
  const centered = align === 'center';

  return (
    <div className={cn('max-w-2xl', centered && 'mx-auto text-center', className)}>
      <p
        className={cn(
          'flex items-center gap-3 text-eyebrow font-semibold uppercase',
          centered && 'justify-center',
          tone === 'light' ? 'text-accent-on-dark' : 'text-accent',
        )}
      >
        <span aria-hidden className="h-px w-6 bg-accent" />
        {eyebrow}
      </p>

      <h2
        id={id}
        className={cn('mt-5 text-h2', tone === 'light' ? 'text-white' : 'text-foreground')}
      >
        {title}
      </h2>

      {body ? (
        <p
          className={cn(
            'mt-5 text-[0.9375rem] leading-relaxed text-balance md:text-base',
            tone === 'light' ? 'text-white/65' : 'text-muted-foreground',
          )}
        >
          {body}
        </p>
      ) : null}
    </div>
  );
}
