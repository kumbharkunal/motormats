import { SHOP_ROUTES } from '@/features/catalog/routes';
import { DECK } from '@/features/home/deck-assets';

/** Homepage Instagram-style reels — swap `href` / `embedSrc` when real posts go live. */
export type HomeReel = {
  id: string;
  caption: string;
  videoSrc: string;
  poster: string;
  /** Full Instagram reel or profile URL */
  href?: string;
  /** Optional: https://www.instagram.com/reel/{code}/embed */
  embedSrc?: string;
};

export const HOME_INSTAGRAM_REELS: HomeReel[] = [
  {
    id: 'pedal-fit',
    caption: 'Zero gap at the pedals — scanned for this exact trim.',
    videoSrc: '/video/hero-mobile.mp4',
    poster: DECK.reels.pedalFit,
    href: SHOP_ROUTES.instagram,
  },
  {
    id: 'monsoon-tray',
    caption: 'Channelled tray after a monsoon drive — lift, rinse, refit.',
    videoSrc: '/video/hero-desktop.mp4',
    poster: DECK.reels.monsoonTray,
    href: SHOP_ROUTES.instagram,
  },
  {
    id: 'sedan-install',
    caption: 'Sedan install in under two minutes.',
    videoSrc: '/video/hero-mobile.mp4',
    poster: DECK.reels.sedanInstall,
    href: SHOP_ROUTES.instagram,
  },
  {
    id: 'suv-lip',
    caption: '7D lip holding mud before it hits carpet.',
    videoSrc: '/video/hero-desktop.mp4',
    poster: DECK.reels.suvLip,
    href: SHOP_ROUTES.instagram,
  },
  {
    id: 'boot-liner',
    caption: 'Boot liner dropped in without lifting the parcel shelf.',
    videoSrc: '/video/hero-mobile.mp4',
    poster: DECK.reels.bootLiner,
    href: SHOP_ROUTES.instagram,
  },
  {
    id: 'quick-swap',
    caption: 'Old mat out, new set in — the whole swap in one clip.',
    videoSrc: '/video/hero-desktop.mp4',
    poster: DECK.reels.quickSwap,
    href: SHOP_ROUTES.instagram,
  },
];
