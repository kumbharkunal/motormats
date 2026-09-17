import type { VEHICLE_BRANDS } from '@/features/vehicles/data/brands';
import { cn } from '@/lib/utils';

/**
 * Line-art marks for every brand, in the same hand as `CarSketch`.
 *
 * Outline only, single weight, `currentColor` throughout, so a brand tile
 * inks its mark and its car from one colour — hairline grey at rest, the brand
 * colour on hover. The manufacturers' own marks are flat filled shapes in their
 * own brand colours; dropping eighteen of those onto the page would put
 * eighteen competing logos and half a dozen reds on it. Drawn as single-weight
 * outlines they read as one set that belongs to this page.
 *
 * These are interpretations for a fitment selector, not reproductions: the
 * geometry that makes each mark recognisable — Hyundai's slanted H in an
 * ellipse, Toyota's three ellipses, Honda's H in a trapezoid — carried at one
 * stroke weight. Nothing here is traced from an official asset.
 *
 * Drawn on a 48x48 grid with the mark inside 8..40, so every mark has the same
 * optical weight in a tile regardless of its shape.
 */

type Brand = (typeof VEHICLE_BRANDS)[number]['slug'];

const MARKS: Record<Brand, React.ReactNode> = {
  // Suzuki's S, as a geometric stroke rather than the angular ribbon.
  'maruti-suzuki': (
    <path d="M33 17q0-6-9-6t-9 7q0 6 9 6t9 7q0 7-9 7t-9-6" strokeWidth={2.2} />
  ),

  // The slanted H in an ellipse. The real strokes bow outward; these are
  // straight, because a bowed stroke at this size closes its own counter.
  hyundai: (
    <>
      <ellipse cx={24} cy={24} rx={19} ry={11.5} strokeWidth={1.6} />
      <path d="M16.5 32 21 16M27 32l4.5-16M18.6 25.2l10.8-1.4" strokeWidth={2} />
    </>
  ),

  // The T inside its circle.
  tata: (
    <>
      <circle cx={24} cy={24} r={16} strokeWidth={1.6} />
      <path d="M15 19h18M24 19v13" strokeWidth={2.2} />
    </>
  ),

  // Twin rising peaks — the mark reads as movement before it reads as an M.
  mahindra: <path d="M10 34l8-21 6 13 6-13 8 21" strokeWidth={2.2} />,

  // KIA, slightly italic, as three stroked letters.
  kia: (
    <>
      <path d="M11 16v16M11 25l8-9M11 25l9 7" strokeWidth={2} />
      <path d="M25.5 16 23 32" strokeWidth={2} />
      <path d="M30 32 36 16l5 16M31.8 26.5h7.4" strokeWidth={2} />
    </>
  ),

  // Three ellipses: the surround, the upright, and the crossbar.
  toyota: (
    <>
      <ellipse cx={24} cy={24} rx={19} ry={12.5} strokeWidth={1.6} />
      <ellipse cx={24} cy={19.5} rx={7} ry={10.5} strokeWidth={1.6} />
      <ellipse cx={24} cy={27} rx={12.5} ry={6} strokeWidth={1.6} />
    </>
  ),

  // The H in its trapezoid.
  honda: (
    <>
      <path d="M8 13h32l-4 22H12Z" strokeWidth={1.6} />
      <path d="M18 18v12M30 18v12M18 24h12" strokeWidth={2.2} />
    </>
  ),

  // MG in the octagon.
  mg: (
    <>
      <path d="M17 8h14l7 7v14l-7 7H17l-7-7V15Z" strokeWidth={1.6} />
      <path d="M15 30V19l4.5 6 4.5-6v11" strokeWidth={2} />
      <path d="M33 21.5a5.5 5.5 0 1 0 0 8v-3.5h-3" strokeWidth={2} />
    </>
  ),

  // V over W in the roundel. The two letters interlock in the real mark; at
  // this size the crossing fills in, so they are stacked clear of each other.
  volkswagen: (
    <>
      <circle cx={24} cy={24} r={17} strokeWidth={1.6} />
      <path d="M18 13.5l6 9 6-9" strokeWidth={2} />
      <path d="M14 26l4 8.5 6-8.5 6 8.5 4-8.5" strokeWidth={2} />
    </>
  ),

  // The winged arrow, with its eye.
  skoda: (
    <>
      <circle cx={24} cy={24} r={16} strokeWidth={1.6} />
      <path d="M13.5 31c3.5-9.5 11.5-14 21.5-14" strokeWidth={2} />
      <path d="M29.5 12.5 36 17l-6.5 4.5" strokeWidth={2} />
      <circle cx={19} cy={27.5} r={1.7} strokeWidth={1.6} />
    </>
  ),

  // The lozenge, drawn as two nested diamonds.
  renault: (
    <>
      <path d="M24 7 38 24 24 41 10 24Z" strokeWidth={1.6} />
      <path d="M24 15.5 31 24l-7 8.5L17 24Z" strokeWidth={1.8} />
    </>
  ),

  // Circle crossed by the nameplate bar.
  nissan: (
    <>
      <circle cx={24} cy={24} r={16} strokeWidth={1.6} />
      <path d="M7 20h34v8H7z" strokeWidth={1.8} />
    </>
  ),

  // Slots and lamps. Three slots, not the grille's seven: the marks render at
  // 24px, and seven strokes a pixel apart fill in as a grey block.
  jeep: (
    <>
      <path d="M18 14v20M24 14v20M30 14v20" strokeWidth={2.2} />
      <circle cx={9.5} cy={24} r={4} strokeWidth={1.8} />
      <circle cx={38.5} cy={24} r={4} strokeWidth={1.8} />
    </>
  ),

  // The double chevron.
  citroen: (
    <>
      <path d="M11 17.5 24 26l13-8.5" strokeWidth={2.2} />
      <path d="M11 27 24 35.5 37 27" strokeWidth={2.2} />
    </>
  ),

  // The three-pointed star in its ring.
  'mercedes-benz': (
    <>
      <circle cx={24} cy={24} r={16} strokeWidth={1.6} />
      <path d="M24 24V9M24 24 11.5 31.5M24 24l12.5 7.5" strokeWidth={2} />
    </>
  ),

  // The roundel and its quartering.
  bmw: (
    <>
      <circle cx={24} cy={24} r={16} strokeWidth={1.6} />
      <circle cx={24} cy={24} r={11} strokeWidth={1.6} />
      <path d="M24 13v22M13 24h22" strokeWidth={1.8} />
    </>
  ),

  // Four rings.
  audi: (
    <>
      <circle cx={11} cy={24} r={7} strokeWidth={1.7} />
      <circle cx={19.5} cy={24} r={7} strokeWidth={1.7} />
      <circle cx={28.5} cy={24} r={7} strokeWidth={1.7} />
      <circle cx={37} cy={24} r={7} strokeWidth={1.7} />
    </>
  ),

  // The oval, with the script reduced to an F.
  ford: (
    <>
      <ellipse cx={24} cy={24} rx={19} ry={12} strokeWidth={1.6} />
      <path d="M17 31V18h11M17 24.5h8" strokeWidth={2} />
    </>
  ),
};

export function BrandMark({ brand, className }: { brand: Brand; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-auto w-full', className)}
    >
      {MARKS[brand]}
    </svg>
  );
}
