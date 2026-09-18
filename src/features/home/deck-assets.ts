/**
 * What is left of the PowerPoint deck export in `public/deck`.
 *
 * The HD shoot in `photo-assets.ts` is now the site's photography. These
 * frames survive because they are 1080x1920, and the reels rail needs a 9:16
 * story poster that the shoot does not contain — every frame of it is portrait
 * 2:3, which would letterbox in a phone-shaped card.
 *
 * Every frame in this range is a campaign slide with its own baked-in
 * headline, not a clean product shot — there is no untouched 9:16 photograph
 * in the deck export. That is a non-issue here: `<video poster>` is a
 * fallback painted before the first frame decodes, and with the clip already
 * cached and `autoplay` set, a visitor on a normal connection never sees it.
 * Picked for the least text in frame, not for being clean — none are.
 */
export const DECK = {
  reels: {
    pedalFit: '/deck/image38.webp',
    monsoonTray: '/deck/image44.webp',
    sedanInstall: '/deck/image45.webp',
    suvLip: '/deck/image46.webp',
    bootLiner: '/deck/image51.webp',
    quickSwap: '/deck/image62.webp',
  },
} as const;
