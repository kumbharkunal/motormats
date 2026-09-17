import { cn } from '@/lib/utils';

/**
 * The heading block the magazine sections open with.
 *
 * Same three ranks as `SectionIntro` — tracked eyebrow, uppercase display
 * headline, body copy — in a centred single-column arrangement rather than the
 * asymmetric split. Shared rather than repeated so the sections cannot drift
 * apart in spacing or scale, which is most of what makes a long page feel
 * unconsidered.
 *
 * The eyebrow was red with a rule beside it, which was how it carried the brand
 * colour on a page that was otherwise white. The page now has two grounds and
 * one red, reserved for CTAs, so the eyebrow is grey here and the red goes back
 * to the buttons.
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
          'caps text-eyebrow',
          tone === 'light' ? 'text-white/45' : 'text-subtle-foreground',
        )}
      >
        {eyebrow}
      </p>

      <h2
        id={id}
        className={cn('mt-5 overflow-hidden pb-[0.12em] text-h2', tone === 'light' ? 'text-white' : 'text-foreground')}
      >
        <span data-headline className="display-type block">
          {title}
        </span>
      </h2>

      {body ? (
        <p
          className={cn(
            'mt-6 text-body text-balance',
            tone === 'light' ? 'text-white/65' : 'text-muted-foreground',
          )}
        >
          {body}
        </p>
      ) : null}
    </div>
  );
}
