/**
 * What is left of the PowerPoint deck export in `public/deck`.
 *
 * The HD shoot in `photo-assets.ts` is now the site's photography. These four
 * frames survive because they are 1080x1920, and the reels rail needs a 9:16
 * story poster that the shoot does not contain — every frame of it is portrait
 * 2:3, which would letterbox in a phone-shaped card.
 */
export const DECK = {
  reels: {
    pedalFit: '/deck/image38.webp',
    monsoonTray: '/deck/image44.webp',
    sedanInstall: '/deck/image45.webp',
    suvLip: '/deck/image46.webp',
  },
} as const;
