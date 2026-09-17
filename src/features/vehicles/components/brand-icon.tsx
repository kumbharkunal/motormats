/**
 * Car profile sketches — one drawn silhouette per body style, finished with a
 * lacquered 3D shade.
 *
 * `bodyStyle` belongs to the *model*, not the brand: Creta has to read as an
 * SUV while Verna reads as a sedan, and Thar has to read as a boxy off-roader
 * rather than a generic 4x4. Each profile is a filled body in the brand
 * colour, a separate glass house, and wheels drawn on top — the wheel discs
 * imply the arches, so the body stays a single clean outline.
 *
 * `uid` namespaces the gradient ids. It is a prop rather than `useId()` so the
 * icon still renders inside a server component.
 */

import { cn } from '@/lib/utils';

export type CarBodyStyle =
  | 'hatchback'
  | 'sedan'
  | 'luxury-sedan'
  | 'compact-suv'
  | 'suv'
  | 'coupe-suv'
  | 'off-roader'
  | 'muv';

type BrandIconProps = {
  bodyStyle: CarBodyStyle;
  /** Brand-specific colour used for the body paint. Falls back to `currentColor`. */
  brandColor?: string;
  /** Unique suffix for gradient ids — pass the brand or model slug. */
  uid?: string;
  className?: string;
};

type Profile = {
  body: string;
  /** Windscreen, side lights, and rear quarter as separate panes with pillar gaps. */
  glass: string[];
  /** Wheel centres along x. */
  wheels: [number, number];
  /** Tyre radius — SUVs and off-roaders sit on visibly larger wheels. */
  tyre: number;
};

/** Ground line. Every profile's tyres touch here, so heights read comparably. */
const GROUND = 52;

const PROFILES: Record<CarBodyStyle, Profile> = {
  // Short 2-box: stubby bonnet, tall greenhouse, steeply cut hatch.
  hatchback: {
    body: 'M12 46 V35 C12 32 14 30 17 29 L31 26 C35 19 40 16 46 14 L63 10 C68 9 73 9 78 9 L89 9 C94 9 98 11 101 15 L109 25 C112 28 115 30 118 31 C121 32 122 34 122 37 V46 Z',
    glass: [
      'M36 25 C39 20 43 17 48 15 L63 12 L63 25 Z',
      'M68 12 L87 12 C91 12 94 13 96 16 L102 24 L68 25 Z',
    ],
    wheels: [31, 101],
    tyre: 8,
  },
  // Classic 3-box: long bonnet, low roofline, distinct boot deck.
  sedan: {
    body: 'M8 46 V36 C8 33 10 31 13 30 L31 27 C36 21 42 17 49 15 L67 11 C72 10 77 10 82 10 L93 10 C98 10 102 12 105 16 L111 24 L121 28 C124 29 126 31 126 34 V46 Z',
    glass: [
      'M39 26 C42 21 46 18 51 16 L67 13 L67 26 Z',
      'M72 13 L91 13 C95 13 98 14 100 17 L105 24 L72 26 Z',
    ],
    wheels: [31, 105],
    tyre: 8,
  },
  // Stretched 3-box: longer wheelbase, roofline sweeping into the deck.
  'luxury-sedan': {
    body: 'M6 45 V35 C6 32 8 30 11 29 L30 26 C36 19 43 15 51 13 L70 9 C75 8 81 8 86 8 L96 8 C101 8 105 10 108 14 L116 24 L124 27 C127 28 128 30 128 33 V45 Z',
    glass: [
      'M38 25 C42 19 47 16 53 14 L70 11 L70 25 Z',
      'M75 11 L94 11 C98 11 101 12 103 15 L109 24 L75 25 Z',
    ],
    wheels: [31, 106],
    tyre: 8.5,
  },
  // Crossover: raised sill, short overhangs, upright tail.
  'compact-suv': {
    body: 'M12 45 V33 C12 29 14 27 18 26 L30 23 C34 16 39 13 45 11 L60 8 C65 7 70 7 75 7 L89 7 C94 7 98 9 101 13 L108 22 C111 25 114 27 117 28 C120 29 121 31 121 34 V45 Z',
    glass: [
      'M36 22 C39 16 43 13 48 11 L61 9 L61 22 Z',
      'M66 9 L87 9 C91 9 94 10 96 13 L102 21 L66 22 Z',
    ],
    wheels: [31, 100],
    tyre: 9,
  },
  // Full-size SUV: flat roof carried to the tailgate, three-window glass house.
  suv: {
    body: 'M9 44 V31 C9 27 11 25 15 24 L29 21 C33 14 38 11 44 9 L60 6 C65 5 71 5 77 5 L104 5 C109 5 113 6 115 9 L121 19 C124 23 126 26 126 31 V44 Z',
    glass: [
      'M36 21 C39 15 43 12 48 10 L62 7 L62 21 Z',
      'M67 7 L82 7 L82 21 L67 21 Z',
      'M87 7 L102 7 C106 7 109 8 111 11 L116 20 L87 21 Z',
    ],
    wheels: [31, 103],
    tyre: 9.5,
  },
  // SUV ride height with the roofline dropped away behind the rear door.
  'coupe-suv': {
    body: 'M10 44 V31 C10 27 12 25 16 24 L30 21 C34 14 39 11 45 9 L61 6 C66 5 72 5 78 5 L92 5 C97 5 101 7 103 11 L110 23 C113 27 118 29 121 30 C124 31 125 33 125 36 V44 Z',
    glass: [
      'M37 21 C40 15 44 12 49 10 L63 7 L63 21 Z',
      'M68 7 L90 7 C94 7 97 8 99 11 L105 21 L68 22 Z',
    ],
    wheels: [32, 103],
    tyre: 9.5,
  },
  // Ladder-frame 4x4: flat bonnet, near-vertical screen, slab sides, big tyres.
  'off-roader': {
    body: 'M14 41 V29 C14 26 16 25 19 25 L40 25 L43 10 C43 7 45 6 48 6 L102 6 C106 6 108 8 108 12 L109 41 Z',
    glass: ['M43 24 L45 11 L58 11 L58 24 Z', 'M62 11 L78 11 L78 24 L62 24 Z', 'M82 11 L100 11 L100 24 L82 24 Z'],
    wheels: [33, 92],
    tyre: 11,
  },
  // One-box people carrier: screen blending into the bonnet, long flat roof.
  muv: {
    body: 'M8 45 V34 C8 30 10 28 14 27 L24 24 C28 16 34 11 42 9 L58 6 C64 5 70 5 76 5 L104 5 C109 5 113 6 115 10 L121 22 C124 26 126 29 126 34 V45 Z',
    glass: [
      'M31 24 C34 16 40 12 47 10 L62 7 L62 24 Z',
      'M67 7 L84 7 L84 24 L67 24 Z',
      'M89 7 L103 7 C107 7 110 8 112 11 L117 23 L89 24 Z',
    ],
    wheels: [32, 104],
    tyre: 9,
  },
};

export function BrandIcon({ bodyStyle, brandColor, uid = bodyStyle, className }: BrandIconProps) {
  const profile = PROFILES[bodyStyle];
  const paint = brandColor ?? 'currentColor';
  const sheen = `sheen-${uid}`;
  const pane = `pane-${uid}`;
  const hub = `hub-${uid}`;
  const contact = `contact-${uid}`;

  return (
    <svg aria-hidden viewBox="0 0 132 60" className={cn('h-12 w-full', className)}>
      <defs>
        {/* Paint shade: specular roof, shadowed sill. Does the 3D lift. */}
        <linearGradient id={sheen} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="0.34" stopColor="#ffffff" stopOpacity="0.14" />
          <stop offset="0.54" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.34" />
        </linearGradient>
        <linearGradient id={pane} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#f8fafc" stopOpacity="0.95" />
          <stop offset="1" stopColor="#cbd5e1" stopOpacity="0.62" />
        </linearGradient>
        <linearGradient id={hub} x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#f1f5f9" />
          <stop offset="1" stopColor="#94a3b8" />
        </linearGradient>
        <radialGradient id={contact}>
          <stop offset="0" stopColor="#0f172a" stopOpacity="0.34" />
          <stop offset="1" stopColor="#0f172a" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="67" cy={GROUND + 1.5} rx="58" ry="3.4" fill={`url(#${contact})`} />

      <path d={profile.body} fill={paint} />
      <path d={profile.body} fill={`url(#${sheen})`} />
      <path
        d={profile.body}
        fill="none"
        stroke="#0f172a"
        strokeOpacity="0.35"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />

      {profile.glass.map((pane_, index) => (
        <path key={index} d={pane_} fill={`url(#${pane})`} stroke="#0f172a" strokeOpacity="0.18" strokeWidth="0.8" />
      ))}

      {profile.wheels.map((x) => (
        <g key={x}>
          <circle cx={x} cy={GROUND - profile.tyre} r={profile.tyre} fill="#111827" />
          <circle
            cx={x}
            cy={GROUND - profile.tyre}
            r={profile.tyre * 0.48}
            fill={`url(#${hub})`}
            stroke="#0f172a"
            strokeOpacity="0.4"
            strokeWidth="0.7"
          />
        </g>
      ))}
    </svg>
  );
}
