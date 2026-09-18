import { redirect } from 'next/navigation';

/**
 * The fit flow is a homepage section now, not a page of its own.
 *
 * This route stays as a redirect rather than being removed: it was linked from
 * the header, the hero, the comparison table and the closing band, it is in the
 * sitemap, and it is the kind of URL people bookmark. A 404 for all of that is
 * a worse answer than a hop to the section.
 */
export default function FindYourFitPage() {
  redirect('/#find-your-fit');
}
