import { SHOP_ROUTES } from '@/features/catalog/routes';

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
    poster: '/hero/hero-mobile.webp',
    href: SHOP_ROUTES.instagram,
  },
  {
    id: 'monsoon-tray',
    caption: 'Channelled tray after a monsoon drive — lift, rinse, refit.',
    videoSrc: '/video/hero-desktop.mp4',
    poster: '/hero/hero-desktop.webp',
    href: SHOP_ROUTES.instagram,
  },
  {
    id: 'sedan-install',
    caption: 'Sedan install in under two minutes.',
    videoSrc: '/video/hero-mobile.mp4',
    poster: '/fit/fit-sedan.webp',
    href: SHOP_ROUTES.instagram,
  },
  {
    id: 'suv-lip',
    caption: '7D lip holding mud before it hits carpet.',
    videoSrc: '/video/hero-desktop.mp4',
    poster: '/fit/fit-suv.webp',
    href: SHOP_ROUTES.instagram,
  },
];
