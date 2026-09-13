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
    <section aria-labelledby="reels-heading" className="band-dark border-t border-white/10">
      <div className="container-page py-section">
        <SectionHeading
          id="reels-heading"
          eyebrow="On Instagram"
          title="See installs in motion"
          body="Short clips from real fits — they play muted as you scroll; tap the speaker to unmute. Follow us for new drops and install reels."
          tone="light"
        />

        <InstagramReelsRail reels={HOME_INSTAGRAM_REELS} />

        <p className="mt-10 text-center">
          <Link
            href={SHOP_ROUTES.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-accent-on-dark underline underline-offset-4"
          >
            Follow @motormats.in for more reels
          </Link>
        </p>
      </div>
    </section>
  );
}
