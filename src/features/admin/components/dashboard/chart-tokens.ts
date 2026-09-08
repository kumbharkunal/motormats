/**
 * Chart ink for the admin panel.
 *
 * These are not arbitrary picks. The categorical slots were run through the
 * data-viz palette validator against this panel's card surface (#141416) and
 * clear the lightness band, chroma floor, adjacent-pair colour-blind separation
 * (worst ΔE 8.4) and the 3:1 contrast gate. Re-run the validator before
 * changing one — a hue that "looks fine" routinely fails under protanopia.
 */

/** Card surface the charts are drawn on; the validator's reference surface. */
export const CHART_SURFACE = '#141416';

export const INK = {
  primary: '#F5F5F4',
  secondary: '#A1A1AA',
  muted: '#898781',
  grid: 'rgba(255,255,255,0.06)',
  axis: 'rgba(255,255,255,0.12)',
} as const;

/** Brand red, stepped up for the dark surface. The storefront's `accent-text`. */
export const SERIES = {
  revenue: '#FF4438',
  orders: '#3987E5',
  units: '#199E70',
} as const;

/**
 * Order status colours. Reserved — never reused as a generic series hue, and
 * always shipped beside a written label so colour never carries meaning alone.
 */
export const STATUS_COLOR: Record<string, string> = {
  paid: '#0CA30C',
  delivered: '#0CA30C',
  processing: '#3987E5',
  shipped: '#3987E5',
  pending_payment: '#FAB219',
  cancelled: '#D03B3B',
  refunded: '#EC835A',
};

export const STATUS_FALLBACK = '#898781';

export function statusColor(status: string): string {
  return STATUS_COLOR[status] ?? STATUS_FALLBACK;
}

export function statusLabel(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Compact rupees for axis ticks, where the full formatted value will not fit. */
export function compactRupees(paise: number): string {
  const rupees = paise / 100;
  if (rupees >= 10_000_000) return `₹${(rupees / 10_000_000).toFixed(1)}Cr`;
  if (rupees >= 100_000) return `₹${(rupees / 100_000).toFixed(1)}L`;
  if (rupees >= 1_000) return `₹${(rupees / 1_000).toFixed(0)}k`;
  return `₹${Math.round(rupees)}`;
}

/** Axis styling shared by every chart, so they read as one system. */
export const AXIS_STYLE = {
  tickLabelStyle: { fill: INK.muted, fontSize: 11 },
  stroke: INK.axis,
} as const;
