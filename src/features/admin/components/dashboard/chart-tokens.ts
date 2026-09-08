import { INK as ADMIN_INK, SERIES as ADMIN_SERIES, LINE, SURFACE } from '../admin-tokens';

/**
 * Chart ink for the admin panel.
 *
 * Colour itself lives in `admin-tokens.ts`; this file is the chart-shaped view
 * of it plus the pieces only charts need.
 */

/** Card surface the charts are drawn on; the palette validator's reference. */
export const CHART_SURFACE = SURFACE.card;

export const INK = {
  primary: ADMIN_INK.primary,
  secondary: ADMIN_INK.secondary,
  muted: ADMIN_INK.muted,
  /** Recessive enough to sit under the data without disappearing on white. */
  grid: '#EAECF0',
  axis: LINE.strong,
} as const;

export const SERIES = ADMIN_SERIES;

/**
 * Order status as *slice fill*, which is a different job from order status as
 * text — see the note on `STATUS` in `admin-tokens.ts`. A filled shape owes 3:1
 * rather than 4.5:1, and spending that headroom is what lets five states stay
 * apart: these clear the validator on all pairs at worst ΔE 8.7 under
 * colour-blind simulation, where the text-grade set collapses to ΔE 8.6 between
 * amber and red.
 *
 * Reserved — never reused as a generic series hue, and always shipped beside a
 * written label so colour never carries meaning alone.
 */
export const STATUS_COLOR: Record<string, string> = {
  paid: '#0A7C4A',
  delivered: '#0A7C4A',
  processing: '#175CD3',
  shipped: '#175CD3',
  pending_payment: '#D97706',
  cancelled: '#E11D48',
  refunded: '#0891B2',
};

export const STATUS_FALLBACK = ADMIN_INK.muted;

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
