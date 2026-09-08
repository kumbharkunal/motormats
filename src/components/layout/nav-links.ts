export type NavLink = {
  label: string;
  href: string;
};

/** Single source of truth for primary navigation — used by both the desktop bar and the mobile drawer. */
export const NAV_LINKS: readonly NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Collections', href: '/collections' },
  { label: 'Our Story', href: '/our-story' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Contact', href: '/contact' },
];
