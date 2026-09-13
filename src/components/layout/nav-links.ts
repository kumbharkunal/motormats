export type NavLink = {
  label: string;
  href: string;
};

/** Single source of truth for primary navigation — used by both the desktop bar and the mobile drawer. */
import { SHOP_ROUTES } from '@/features/catalog/routes';

export const NAV_LINKS: readonly NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Find your fit', href: SHOP_ROUTES.findYourFit },
  { label: 'Collections', href: SHOP_ROUTES.collections },
  { label: 'Our Story', href: '/our-story' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Contact', href: '/contact' },
];
