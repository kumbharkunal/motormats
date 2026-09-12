import { ExternalLink, MapPin } from 'lucide-react';

import { addressLine, BUSINESS, mapsSearchHref } from '@/features/marketing/business';

/**
 * Where to find us.
 *
 * The iframe is lazy: a Google Maps embed pulls in a few hundred kilobytes of
 * script and tiles, and it sits below the fold on a page whose job is the
 * enquiry form. Nobody should pay for it before scrolling to it.
 *
 * Sized by aspect ratio rather than the 600×450 Google hands you, so it fills
 * its column on a desktop and stays a sensible shape on a phone.
 */
export function LocationMap() {
  return (
    <section aria-labelledby="location-heading" className="mt-14">
      <h2 id="location-heading" className="text-h3">
        Find us
      </h2>
      <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
        <MapPin aria-hidden size={16} className="mt-0.5 shrink-0 text-accent-text" />
        {addressLine}
      </p>

      <div className="mt-5 overflow-hidden rounded-3xl card-surface">
        <iframe
          src={BUSINESS.mapEmbedUrl}
          title={`Map showing ${BUSINESS.name} in ${BUSINESS.address.city}`}
          loading="lazy"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="block aspect-[4/3] w-full border-0 sm:aspect-[16/9] lg:aspect-[21/9]"
        />

        <a
          href={mapsSearchHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-14 items-center justify-center gap-2 border-t border-border text-sm font-medium text-foreground/80 transition-colors duration-200 hover:bg-surface-hover hover:text-foreground"
        >
          <ExternalLink aria-hidden size={16} />
          Open in Google Maps
        </a>
      </div>
    </section>
  );
}
