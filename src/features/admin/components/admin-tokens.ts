/**
 * Admin panel colour — the single source of truth.
 *
 * The storefront is dark and stays dark; this panel is light. Two inversions
 * come with that, and are the reason these values are named here rather than
 * inlined at each use:
 *
 * - **The brand red flips.** On the near-black storefront `#FF4438` was the
 *   accessible ink (5.8:1) and `#E10600` failed body copy (3.98:1). On white it
 *   is exactly the other way round: `#E10600` reaches 4.97:1, `#FF4438` drops to
 *   3.42:1. So `tint` is decoration only here — never text.
 * - **Elevation flips.** A dark surface rises by getting lighter; a light one
 *   rises by getting whiter and casting a real but very small shadow.
 *
 * Ratios in the comments are against `SURFACE.card`.
 */

export const SURFACE = {
  /** App canvas and sidebar — the plane cards sit on. */
  canvas: '#F6F7F9',
  /** Cards, the sticky header and menus — what sits on top of the canvas. */
  card: '#FFFFFF',
  /** Recessed strips inside a card, i.e. the table head. */
  sunken: '#F9FAFB',
} as const;

export const INK = {
  primary: '#101828', // 17.8:1 — near-black slate; pure black is harsh on white
  secondary: '#475467', // 7.7:1 — body copy and captions
  muted: '#667085', // 5.0:1 — axis ticks, tertiary labels
  disabled: '#98A2B3',
} as const;

export const LINE = {
  /** Solid, not rgba: a translucent line muddies over the tinted canvas. */
  hairline: '#E4E7EC',
  strong: '#D0D5DD',
} as const;

export const BRAND = {
  main: '#E10600', // 4.97:1 — surfaces, CTAs and, on this ground, ink
  dark: '#B00400', // 7.3:1 — hover and links
  tint: '#FF4438', // 3.42:1 — decoration only
  contrast: '#FFFFFF',
  /** Red washes, much weaker than the dark panel's — red reads heavier on white. */
  wash: 'rgba(225,6,0,0.08)',
  washHover: 'rgba(225,6,0,0.12)',
  washBorder: 'rgba(225,6,0,0.25)',
} as const;

/**
 * Status as *ink* — chips, the low-stock figure, the delta badges. These carry
 * text, so they are held to 4.5:1 and are consequently dark.
 *
 * The donut's slice colours are a separate, lighter set in `chart-tokens.ts`:
 * a filled shape only owes 3:1, and forcing these text-grade values into five
 * adjacent slices puts amber and red 8.6 ΔE apart, which is indistinguishable.
 * The two sets are meant to differ — do not unify them.
 */
export const STATUS = {
  success: '#15803D', // 5.0:1 — the dark panel's #0CA30C is only 3.4:1 here
  warning: '#B45309', // 5.0:1 — #FAB219 is 1.8:1 here, effectively unreadable
  error: '#B42318', // 6.6:1
  info: '#175CD3', // 6.0:1
} as const;

/**
 * Categorical chart slots — the measures: revenue, orders, units, customers.
 *
 * Validated against `SURFACE.card` with the data-viz palette validator across
 * *all* pairs, not just adjacent ones, because the four stat-card dots are read
 * together: worst colour-blind separation ΔE 8.7, worst normal-vision ΔE 21.1,
 * every slot over 3:1. Re-run that validator before changing one — separation
 * on white is not the same as separation on the storefront's near-black, and
 * the obvious violet for `customers` fails against `orders` at ΔE 10.4.
 */
export const SERIES = {
  revenue: BRAND.main,
  orders: STATUS.info,
  units: '#0A7C4A',
  customers: '#B5179E',
} as const;

export const SHADOW = {
  card: '0 1px 2px rgba(16,24,40,0.05)',
  raised: '0 4px 12px rgba(16,24,40,0.08)',
} as const;

/**
 * The sign-in brand panel is a deliberate dark island in a light theme, so the
 * theme's own ink and divider would disappear on it. It carries its own values.
 */
export const BRAND_PANEL = {
  ink: '#F5F5F4',
  inkMuted: 'rgba(245,245,244,0.72)',
  border: 'rgba(255,255,255,0.08)',
} as const;
