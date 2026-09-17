/**
 * Line-art car profiles — one drawn sketch per body style.
 *
 * Single-weight outline, no fill, `currentColor` throughout, so the card that
 * hosts a sketch decides the ink: hairline grey at rest, brand colour on hover.
 * A filled, shaded car fights the photography on a picture-led page; a
 * technical line drawing sits beside it the way a spec diagram sits beside a
 * photograph in print.
 *
 * The outlines are generated from real vehicle dimensions rather than drawn by
 * eye. A Thar is 2.17 lengths tall and a Camry is 3.37, and that single ratio
 * is most of what makes a silhouette recognisable — hand-plotted paths drift
 * off it immediately and everything ends up looking like the same estate car.
 * So a spec carries metres for the hard numbers and fractions for the styling
 * lines, and `build()` turns them into a path at a fixed px-per-metre scale.
 *
 * `bodyStyle` belongs to the *model*, not the brand: Creta has to read as an
 * SUV while Verna reads as a sedan.
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

const VIEW_W = 160;
const VIEW_H = 68;
/** px per metre. Tuned so the longest car here (Camry, 4.89m) sits inside `VIEW_W`. */
const SCALE = 30.5;
const GROUND = 60;

type Spec = {
  /** Kerb dimensions in metres. */
  length: number;
  height: number;
  wheelbase: number;
  frontOverhang: number;
  /** Wheel-and-tyre diameter. */
  wheel: number;

  /** Styling lines. `x` fractions run along the length, `y` fractions up the height. */
  /** Bumper top, where the nose stops rising. */
  noseY: number;
  /** Rocker panel — the lowest body line between the wheels. */
  sillY: number;
  /** Bonnet height at the cowl. */
  bonnetY: number;
  /** Window base. */
  beltY: number;
  /** Where the windscreen leaves the bonnet. */
  cowlX: number;
  /** Where the screen meets the roof, and where the roof breaks for the rear glass. */
  roofStartX: number;
  roofEndX: number;
  /** Where the rear panel starts, and its height — 1 is a vertical tailgate, 0.6 a boot deck. */
  tailX: number;
  tailY: number;
  /** Pillars aft of the A-pillar. Two gives a three-window glass house. */
  pillars: 1 | 2 | 3;
};

const SPECS: Record<CarBodyStyle, Spec> = {
  // Swift. Compact 2-box: cab-forward screen, tall greenhouse, cut-off hatch.
  hatchback: {
    length: 3.86,
    height: 1.53,
    wheelbase: 2.45,
    frontOverhang: 0.76,
    wheel: 0.64,
    noseY: 0.42,
    sillY: 0.2,
    bonnetY: 0.56,
    beltY: 0.62,
    cowlX: 0.24,
    roofStartX: 0.42,
    roofEndX: 0.74,
    tailX: 0.95,
    tailY: 0.72,
    pillars: 2,
  },

  // City. Classic 3-box: long bonnet, low roof, separate boot deck.
  sedan: {
    length: 4.55,
    height: 1.49,
    wheelbase: 2.6,
    frontOverhang: 0.87,
    wheel: 0.65,
    noseY: 0.4,
    sillY: 0.19,
    bonnetY: 0.54,
    beltY: 0.6,
    cowlX: 0.3,
    roofStartX: 0.46,
    roofEndX: 0.68,
    tailX: 0.88,
    tailY: 0.62,
    pillars: 2,
  },

  // Camry. Stretched 3-box: longer wheelbase, roofline sweeping into the deck.
  'luxury-sedan': {
    length: 4.89,
    height: 1.45,
    wheelbase: 2.82,
    frontOverhang: 0.93,
    wheel: 0.68,
    noseY: 0.38,
    sillY: 0.18,
    bonnetY: 0.52,
    beltY: 0.58,
    cowlX: 0.31,
    roofStartX: 0.47,
    roofEndX: 0.65,
    tailX: 0.89,
    tailY: 0.6,
    pillars: 2,
  },

  // Venue. Crossover: raised sill, short overhangs, upright tail.
  'compact-suv': {
    length: 3.99,
    height: 1.62,
    wheelbase: 2.5,
    frontOverhang: 0.78,
    wheel: 0.68,
    noseY: 0.46,
    sillY: 0.23,
    bonnetY: 0.59,
    beltY: 0.64,
    cowlX: 0.26,
    roofStartX: 0.42,
    roofEndX: 0.83,
    tailX: 0.95,
    tailY: 0.88,
    pillars: 2,
  },

  // Creta. Full-size SUV: flat roof carried to the tailgate, three-window house.
  suv: {
    length: 4.33,
    height: 1.64,
    wheelbase: 2.61,
    frontOverhang: 0.85,
    wheel: 0.7,
    noseY: 0.46,
    sillY: 0.23,
    bonnetY: 0.58,
    beltY: 0.63,
    cowlX: 0.26,
    roofStartX: 0.41,
    roofEndX: 0.85,
    tailX: 0.96,
    tailY: 0.9,
    pillars: 2,
  },

  // Nexon. SUV ride height with the roofline dropped away behind the rear door.
  'coupe-suv': {
    length: 3.99,
    height: 1.62,
    wheelbase: 2.5,
    frontOverhang: 0.8,
    wheel: 0.68,
    noseY: 0.46,
    sillY: 0.23,
    bonnetY: 0.58,
    beltY: 0.63,
    cowlX: 0.26,
    roofStartX: 0.42,
    roofEndX: 0.7,
    tailX: 0.94,
    tailY: 0.76,
    pillars: 2,
  },

  // Thar. Ladder-frame 4x4: flat bonnet, near-vertical screen, slab sides.
  'off-roader': {
    length: 3.99,
    height: 1.84,
    wheelbase: 2.45,
    frontOverhang: 0.72,
    wheel: 0.75,
    noseY: 0.5,
    sillY: 0.27,
    bonnetY: 0.6,
    beltY: 0.63,
    cowlX: 0.3,
    roofStartX: 0.36,
    roofEndX: 0.9,
    tailX: 0.97,
    tailY: 0.96,
    pillars: 2,
  },

  // Innova. One-box people carrier: screen blending into the nose, long roof.
  muv: {
    length: 4.74,
    height: 1.79,
    wheelbase: 2.75,
    frontOverhang: 0.87,
    wheel: 0.7,
    noseY: 0.44,
    sillY: 0.21,
    bonnetY: 0.52,
    beltY: 0.6,
    cowlX: 0.16,
    roofStartX: 0.36,
    roofEndX: 0.82,
    tailX: 0.96,
    tailY: 0.88,
    pillars: 2,
  },
};

type Drawing = {
  body: string;
  window: string;
  pillars: string;
  door: string;
  wheels: { cx: number; cy: number; r: number }[];
};

const n = (value: number) => Math.round(value * 10) / 10;

function build(spec: Spec): Drawing {
  const length = spec.length * SCALE;
  const height = spec.height * SCALE;
  const x0 = (VIEW_W - length) / 2;
  const x1 = x0 + length;

  /** `f` along the length, from the front bumper. */
  const px = (f: number) => x0 + length * f;
  /** `f` up the height, from the ground. */
  const py = (f: number) => GROUND - height * f;

  const r = (spec.wheel / 2) * SCALE;
  const axleF = x0 + spec.frontOverhang * SCALE;
  const axleR = axleF + spec.wheelbase * SCALE;
  // The arch clears the tyre so the wheel nests inside the body rather than
  // cutting through it.
  const arch = r + 1.6;

  const sill = py(spec.sillY);
  const nose = py(spec.noseY);
  const bonnet = py(spec.bonnetY);
  const belt = py(spec.beltY);
  const roof = py(1);
  const tail = py(spec.tailY);

  const cowl = px(spec.cowlX);
  const roofA = px(spec.roofStartX);
  const roofB = px(spec.roofEndX);
  const tailA = px(spec.tailX);

  const body = [
    // Front bumper face, rising from the sill to the nose.
    `M${n(x0 + 1)} ${n(sill)}`,
    `C${n(x0 - 1)} ${n(sill)} ${n(x0)} ${n(nose + 2)} ${n(x0 + 2)} ${n(nose)}`,
    // Bonnet.
    `L${n(cowl)} ${n(bonnet)}`,
    // Windscreen. Control point biased up the rake so the screen stays convex.
    `Q${n(cowl + (roofA - cowl) * 0.62)} ${n(bonnet - (bonnet - roof) * 0.74)} ${n(roofA)} ${n(roof)}`,
    // Roof.
    `L${n(roofB)} ${n(roof)}`,
    // Rear glass.
    `Q${n(roofB + (tailA - roofB) * 0.58)} ${n(roof)} ${n(tailA)} ${n(tail)}`,
    // Deck, then the rear face down to the sill.
    `L${n(x1 - 2)} ${n(tail)}`,
    `C${n(x1)} ${n(tail)} ${n(x1)} ${n(sill)} ${n(x1 - 1)} ${n(sill)}`,
    // Underside, right to left, lifted over each wheel.
    `L${n(axleR + arch)} ${n(sill)}`,
    `A${n(arch)} ${n(arch)} 0 0 0 ${n(axleR - arch)} ${n(sill)}`,
    `L${n(axleF + arch)} ${n(sill)}`,
    `A${n(arch)} ${n(arch)} 0 0 0 ${n(axleF - arch)} ${n(sill)}`,
    'Z',
  ].join(' ');

  // Glass house, inset off the outline so the pillars read as pillars.
  const glassRoof = roof + 2.6;
  const window = [
    `M${n(cowl + 5)} ${n(belt)}`,
    `L${n(roofA + 3)} ${n(glassRoof)}`,
    `L${n(roofB - 2)} ${n(glassRoof)}`,
    `L${n(tailA - 4)} ${n(belt)}`,
    'Z',
  ].join(' ');

  const first = roofA + 4;
  const last = tailA - 5;
  const step = (last - first) / (spec.pillars + 1);
  const pillarXs = Array.from({ length: spec.pillars }, (_, i) => first + step * (i + 1));
  const pillars = pillarXs
    .map((x) => `M${n(x)} ${n(belt)} L${n(x)} ${n(glassRoof + (x - first) * 0.02)}`)
    .join(' ');

  // One shut line, at the B-pillar, carried down to the sill.
  const door = pillarXs[0] ? `M${n(pillarXs[0])} ${n(belt)} L${n(pillarXs[0])} ${n(sill - 1)}` : '';

  return {
    body,
    window,
    pillars,
    door,
    wheels: [
      { cx: n(axleF), cy: n(GROUND - r), r: n(r) },
      { cx: n(axleR), cy: n(GROUND - r), r: n(r) },
    ],
  };
}

const DRAWINGS = Object.fromEntries(
  Object.entries(SPECS).map(([style, spec]) => [style, build(spec)]),
) as Record<CarBodyStyle, Drawing>;

/**
 * Per-model deviation from the archetype.
 *
 * The archetypes cover the whole range, but three of the eight brands lead with
 * an SUV, and drawing Creta, Seltos and Hector identically made the rail look
 * like a rendering bug rather than a set. Anything given here is real kerb data
 * or a real styling difference, so a model only needs an override where the
 * archetype is genuinely not specific enough.
 */
export type CarSketchOverride = Partial<
  Pick<Spec, 'length' | 'height' | 'wheelbase' | 'roofEndX' | 'tailY' | 'beltY'>
>;

export function CarSketch({
  bodyStyle,
  override,
  className,
}: {
  bodyStyle: CarBodyStyle;
  override?: CarSketchOverride;
  className?: string;
}) {
  // `build` is pure arithmetic and string concatenation, so an override is
  // cheaper to recompute than to cache and invalidate.
  const car = override ? build({ ...SPECS[bodyStyle], ...override }) : DRAWINGS[bodyStyle];

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-auto w-full', className)}
    >
      <path d={car.body} strokeWidth={1.4} />
      <path d={car.window} strokeWidth={1} />
      <path d={car.pillars} strokeWidth={1} />
      <path d={car.door} strokeWidth={0.8} opacity={0.5} />
      {car.wheels.map((wheel) => (
        <g key={wheel.cx}>
          <circle cx={wheel.cx} cy={wheel.cy} r={wheel.r} strokeWidth={1.4} />
          <circle cx={wheel.cx} cy={wheel.cy} r={n(wheel.r * 0.44)} strokeWidth={1} />
        </g>
      ))}
    </svg>
  );
}
