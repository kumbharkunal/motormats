import Link from 'next/link';

import { SectionHeading } from '@/features/home/components/section-heading';
import { InstagramReelsRail } from '@/features/home/components/instagram-reels-rail';
import { SHOP_ROUTES } from '@/features/catalog/routes';
import { HOME_INSTAGRAM_REELS } from '@/features/home/reels';

/**
 * Playable reel rail — sits directly under the floorpan comparison band.
 * Replace entries in `HOME_INSTAGRAM_REELS` with real `embedSrc` URLs when ready.
 */
export function InstagramReelsSection() {
  return (
    <section aria-labelledby="reels-heading" className="screen-section band-light border-y border-border">
      <div className="container-page py-section">
        <SectionHeading
          id="reels-heading"
          align="start"
          eyebrow="On Instagram"
          title="See installs in motion"
          body="Short clips from real fits — they play muted as you scroll; tap the speaker to unmute. Follow us for new drops and install reels."
        />

        <InstagramReelsRail reels={HOME_INSTAGRAM_REELS} />

        <p className="mt-10">
          <Link
            href={SHOP_ROUTES.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-accent underline underline-offset-4"
          >
            Follow @motormats.in for more reels
          </Link>
        </p>
      </div>
    </section>
  );
}
