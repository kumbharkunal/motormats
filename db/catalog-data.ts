/**
 * The catalogue, as data.
 *
 * Split out of `seed.ts` because there are now two writers: the seed, which
 * clears the catalogue tables and rebuilds them for a fresh environment, and
 * `scripts/add-mat-products.ts`, which only inserts what is missing. Both have
 * to agree on what the catalogue *is*, and the way to guarantee that is for
 * there to be one list.
 *
 * Ten products, one per cutout in `motormats/mats/`. `imageBase` is the plate
 * slug emitted by `scripts/optimize-mat-cutouts.mjs`; the `-960` suffix added
 * below is its widest width, and `src/features/catalog/mat-cutouts.ts` maps that
 * id back to the full `srcSet` so a card serves the width it needs.
 */

export type SeedVariant = {
  sku: string;
  name: string;
  options: Record<string, string>;
  pricePaise?: number;
  stockQuantity: number;
};

export type SeedProduct = {
  slug: string;
  name: string;
  summary: string;
  description: string;
  brand: string;
  basePricePaise: number;
  compareAtPricePaise?: number;
  isFeatured?: boolean;
  imageBase: string;
  variants: SeedVariant[];
};

export type SeedCategory = {
  category: { slug: string; name: string; description: string };
  items: SeedProduct[];
};

/**
 * The shot every product carries, derived from one base slug.
 *
 * `width`/`height` are deliberately left null: nothing lays out from them (the
 * gallery and cards size their own frame), and the old hardcoded 600x600 was
 * simply wrong.
 */
export function buildImages(base: string, name: string) {
  return [
    {
      assetId: `/products/${base}-960.webp`,
      // The sources are transparent cutouts, not flat-lays on white — the card
      // plate supplies the ground.
      alt: `A ${name.toLowerCase()}, photographed flat`,
    },
  ];
}

const FITS = [
  { key: 'Hatchback', delta: 0, stock: 40 },
  { key: 'Sedan', delta: 40_000, stock: 32 },
  { key: 'SUV', delta: 90_000, stock: 18 },
] as const;

export function buildVariants(
  skuPrefix: string,
  basePricePaise: number,
  colours: readonly string[],
): SeedVariant[] {
  const variants: SeedVariant[] = [];
  for (const fit of FITS) {
    for (const colour of colours) {
      variants.push({
        sku: `${skuPrefix}-${fit.key.slice(0, 3).toUpperCase()}-${colour.slice(0, 3).toUpperCase()}`,
        name: `${fit.key} · ${colour}`,
        options: { fit: fit.key, colour },
        pricePaise: basePricePaise + fit.delta,
        // Deliberately varied so low-stock and out-of-stock states are reachable.
        stockQuantity: colour === 'Red' ? 0 : fit.stock,
      });
    }
  }
  return variants;
}

export const CATALOG: SeedCategory[] = [
  {
    category: {
      slug: '7d-luxury',
      name: '7D Luxury',
      description: 'Deep-dish moulded mats with raised edges that contain every spill.',
    },
    items: [
      {
        slug: '7d-sport-luxury-mat',
        name: '7D Sport Luxury Mat',
        summary: 'Deep-dish performance fit with a raised containment lip.',
        description:
          'Laser-scanned to your vehicle floorpan and moulded in a single piece, the 7D Sport holds spills, grit and monsoon water inside a raised lip rather than letting them reach the carpet underneath. A dual-density base keeps the mat flat under hard cornering.',
        brand: 'Motormats',
        basePricePaise: 449_900,
        compareAtPricePaise: 599_900,
        isFeatured: true,
        imageBase: 'mat-01-tan-diamond',
        variants: buildVariants('7DS', 449_900, ['Black', 'Tan', 'Red']),
      },
      {
        slug: 'onyx-honeycomb-mat',
        name: 'Onyx Honeycomb Mat',
        summary: 'A dense honeycomb weave in onyx and sand.',
        description:
          'The tightest weave in the range. Grit drops into the honeycomb cells instead of sitting on the surface, so the mat keeps looking clean between washes, and the two-tone yarn hides the dust a flat black mat shows immediately.',
        brand: 'Motormats',
        basePricePaise: 479_900,
        compareAtPricePaise: 599_900,
        imageBase: 'mat-06-onyx-honeycomb',
        variants: buildVariants('ONX', 479_900, ['Onyx', 'Sand']),
      },
    ],
  },
  {
    category: {
      slug: 'carbon',
      name: 'Carbon Series',
      description: 'Carbon-weave surface with a technical, low-gloss finish.',
    },
    items: [
      {
        slug: 'carbon-series-mat',
        name: 'Carbon Series Mat',
        summary: 'Carbon-weave surface over a dual-density anti-skid base.',
        description:
          'A woven carbon-effect topsheet bonded to a closed-cell base. The surface sheds dust rather than trapping it, so a wipe restores the finish without shampooing.',
        brand: 'Motormats',
        basePricePaise: 529_900,
        compareAtPricePaise: 649_900,
        isFeatured: true,
        imageBase: 'mat-02-blue-plaid',
        variants: buildVariants('CBS', 529_900, ['Black', 'Graphite']),
      },
      {
        slug: 'cobalt-stripe-mat',
        name: 'Cobalt Stripe Mat',
        summary: 'A drawn cobalt stripe on a flat technical weave.',
        description:
          'Woven as a single run rather than printed, so the stripe goes through the pile instead of sitting on top of it and cannot wear off at the heel. The flat weave keeps the pattern reading straight once the mat is fitted to a contoured floorpan.',
        brand: 'Motormats',
        basePricePaise: 549_900,
        imageBase: 'mat-08-cobalt-stripe',
        variants: buildVariants('COB', 549_900, ['Cobalt', 'Slate']),
      },
    ],
  },
  {
    category: {
      slug: 'carpet',
      name: 'Executive Carpet',
      description: 'Plush tufted carpet with a rubberised anti-skid backing.',
    },
    items: [
      {
        slug: 'executive-carpet-mat',
        name: 'Executive Carpet Mat',
        summary: 'Plush tufted finish with a rubberised anti-skid backing.',
        description:
          'A 1,200 GSM tufted pile bonded to a moulded rubber backing. Warmer underfoot than a moulded mat, with heel-pad reinforcement where wear actually happens.',
        brand: 'Motormats',
        basePricePaise: 389_900,
        isFeatured: true,
        imageBase: 'mat-03-graphite-rib',
        variants: buildVariants('EXC', 389_900, ['Charcoal', 'Beige']),
      },
      {
        slug: 'ash-check-mat',
        name: 'Ash Check Mat',
        summary: 'A soft ash check with a bound truffle edge.',
        description:
          'A traditional check scaled down so it still reads as a pattern in a footwell rather than as a blur. Bound by hand at the edge in a contrasting truffle, which is the detail that stops a woven mat fraying at the corners.',
        brand: 'Motormats',
        basePricePaise: 369_900,
        imageBase: 'mat-05-ash-check',
        variants: buildVariants('ASH', 369_900, ['Ash', 'Truffle']),
      },
      {
        slug: 'silver-plush-mat',
        name: 'Silver Plush Mat',
        summary: 'A plain silver pile, the quietest mat in the range.',
        description:
          'No pattern at all — the one to choose when the interior is already doing the talking. A dense plush pile in a single silver yarn, bound in the same tone, so it reads as part of the trim rather than as an accessory laid over it.',
        brand: 'Motormats',
        basePricePaise: 419_900,
        compareAtPricePaise: 499_900,
        imageBase: 'mat-07-silver-plush',
        variants: buildVariants('SLV', 419_900, ['Silver', 'Graphite']),
      },
    ],
  },
  {
    category: {
      slug: 'all-weather',
      name: 'All-Weather',
      description: 'Monsoon-ready containment mats that wash clean in seconds.',
    },
    items: [
      {
        slug: 'all-weather-mat',
        name: 'All-Weather Mat',
        summary: 'Monsoon-ready containment that rinses clean in seconds.',
        description:
          'A deep channelled tray that holds well over a litre of water per mat. Lift it out, rinse it down and refit — no drying time, no residue in the carpet.',
        brand: 'Motormats',
        basePricePaise: 299_900,
        compareAtPricePaise: 379_900,
        isFeatured: true,
        imageBase: 'mat-04-camel-rib',
        variants: buildVariants('AWM', 299_900, ['Black', 'Grey']),
      },
      {
        slug: 'walnut-stripe-mat',
        name: 'Walnut Stripe Mat',
        summary: 'A warm walnut stripe for tan and cream cabins.',
        description:
          'Cut for the interiors a black mat fights: tan leather, cream trim, wood inserts. The stripe runs front to back so it follows the length of the footwell instead of cutting across it.',
        brand: 'Motormats',
        basePricePaise: 329_900,
        imageBase: 'mat-09-walnut-stripe',
        variants: buildVariants('WAL', 329_900, ['Walnut', 'Dune']),
      },
      {
        slug: 'crimson-stripe-mat',
        name: 'Crimson Stripe Mat',
        summary: 'The house stripe, in Motormats red.',
        description:
          'The only mat in the range woven in the brand red, run as a narrow stripe against ash and taupe rather than as a field — enough to be recognised from the doorway without taking over the cabin.',
        brand: 'Motormats',
        basePricePaise: 349_900,
        compareAtPricePaise: 419_900,
        isFeatured: true,
        imageBase: 'mat-10-crimson-stripe',
        variants: buildVariants('CRM', 349_900, ['Crimson', 'Ash']),
      },
    ],
  },
];
