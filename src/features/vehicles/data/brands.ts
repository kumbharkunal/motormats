import type { CarBodyStyle, CarSketchOverride } from '@/features/vehicles/components/car-sketch';

export type VehicleModel = {
  slug: string;
  name: string;
  yearRange?: string;
  /**
   * Which profile `CarSketch` draws for this model.
   *
   * On the model rather than the brand. Hyundai sells the Creta and the Verna
   * off the same forecourt and one is an SUV while the other is a saloon, so a
   * brand-level body style drew the wrong car for most of the range — the Thar
   * in particular came out as a soft-roader.
   */
  bodyStyle: CarBodyStyle;
  /**
   * Kerb dimensions and styling lines where this model differs from its
   * archetype. Only the brand leaders that would otherwise draw identically
   * carry one — see `CarSketchOverride`.
   */
  sketch?: CarSketchOverride;
};

export type VehicleBrand = {
  slug: string;
  name: string;
  /** Ink for the sketch and the brand mark. */
  brandColor: string;
  /** Top seller first — the fit wizard leads with `models[0]`. */
  models: VehicleModel[];
};

/**
 * Indian car brands with their most popular models.
 *
 * Eighteen marks, in three rows of six. It was eight, capped at that because
 * the old rail could only fit eight across without scrolling; the grid has no
 * such limit, and a fitment selector that stops at eight brands tells a Skoda
 * or a Jeep owner the shop is not for them. Eighteen divides cleanly by both
 * three and six, so no breakpoint leaves an orphan tile in the last row.
 *
 * Ordered by Indian market share, then the luxury marques. Ford is here
 * although it stopped selling cars in India in 2021: mats are aftermarket, and
 * every EcoSport and Endeavour on the road still has a floor.
 *
 * There is no `image` field any more. It pointed at eight `/public/cars/*.webp`
 * rasters, and adding ten brands would have meant ten photographs that do not
 * exist — the selector draws `BrandMark` and `CarSketch` instead, which is the
 * same language as the rest of the page.
 *
 * This is static demo data for client presentation — no database backing yet.
 */
export const VEHICLE_BRANDS: VehicleBrand[] = [
  {
    slug: 'maruti-suzuki',
    name: 'Maruti Suzuki',
    brandColor: '#1a3c8a',
    models: [
      { slug: 'swift', name: 'Swift', yearRange: '2024–present', bodyStyle: 'hatchback' },
      { slug: 'baleno', name: 'Baleno', yearRange: '2022–present', bodyStyle: 'hatchback' },
      { slug: 'brezza', name: 'Brezza', yearRange: '2022–present', bodyStyle: 'compact-suv' },
      { slug: 'ertiga', name: 'Ertiga', yearRange: '2018–present', bodyStyle: 'muv' },
      { slug: 'wagon-r', name: 'WagonR', yearRange: '2019–present', bodyStyle: 'hatchback' },
      { slug: 'dzire', name: 'Dzire', yearRange: '2024–present', bodyStyle: 'sedan' },
      { slug: 'fronx', name: 'Fronx', yearRange: '2023–present', bodyStyle: 'coupe-suv' },
      { slug: 'grand-vitara', name: 'Grand Vitara', yearRange: '2022–present', bodyStyle: 'suv' },
    ],
  },
  {
    slug: 'hyundai',
    name: 'Hyundai',
    brandColor: '#0e3e8a',
    models: [
      { slug: 'creta', name: 'Creta', yearRange: '2024–present', bodyStyle: 'suv' },
      { slug: 'venue', name: 'Venue', yearRange: '2019–present', bodyStyle: 'compact-suv' },
      { slug: 'i20', name: 'i20', yearRange: '2020–present', bodyStyle: 'hatchback' },
      { slug: 'verna', name: 'Verna', yearRange: '2023–present', bodyStyle: 'sedan' },
      { slug: 'tucson', name: 'Tucson', yearRange: '2022–present', bodyStyle: 'suv' },
      { slug: 'alcazar', name: 'Alcazar', yearRange: '2021–present', bodyStyle: 'suv' },
    ],
  },
  {
    slug: 'tata',
    name: 'Tata',
    brandColor: '#1c45a6',
    models: [
      { slug: 'nexon', name: 'Nexon', yearRange: '2023–present', bodyStyle: 'coupe-suv' },
      { slug: 'punch', name: 'Punch', yearRange: '2021–present', bodyStyle: 'compact-suv' },
      { slug: 'harrier', name: 'Harrier', yearRange: '2023–present', bodyStyle: 'suv' },
      { slug: 'safari', name: 'Safari', yearRange: '2021–present', bodyStyle: 'suv' },
      { slug: 'tiago', name: 'Tiago', yearRange: '2016–present', bodyStyle: 'hatchback' },
      { slug: 'altroz', name: 'Altroz', yearRange: '2020–present', bodyStyle: 'hatchback' },
      { slug: 'curvv', name: 'Curvv', yearRange: '2024–present', bodyStyle: 'coupe-suv' },
    ],
  },
  {
    slug: 'mahindra',
    name: 'Mahindra',
    brandColor: '#b91c1c',
    models: [
      { slug: 'thar', name: 'Thar', yearRange: '2020–present', bodyStyle: 'off-roader' },
      { slug: 'xuv700', name: 'XUV700', yearRange: '2021–present', bodyStyle: 'suv' },
      { slug: 'scorpio-n', name: 'Scorpio-N', yearRange: '2022–present', bodyStyle: 'suv' },
      { slug: 'xuv3xo', name: 'XUV 3XO', yearRange: '2024–present', bodyStyle: 'compact-suv' },
      { slug: 'bolero', name: 'Bolero', yearRange: '2020–present', bodyStyle: 'off-roader' },
      { slug: 'xuv400', name: 'XUV400 EV', yearRange: '2023–present', bodyStyle: 'compact-suv' },
    ],
  },
  {
    slug: 'kia',
    name: 'Kia',
    brandColor: '#05141f',
    models: [
      {
        slug: 'seltos',
        name: 'Seltos',
        yearRange: '2023–present',
        bodyStyle: 'suv',
        // 40mm longer than a Creta, and squarer at the back.
        sketch: { length: 4.37, height: 1.65, wheelbase: 2.61, roofEndX: 0.88, tailY: 0.95 },
      },
      { slug: 'sonet', name: 'Sonet', yearRange: '2020–present', bodyStyle: 'compact-suv' },
      { slug: 'carens', name: 'Carens', yearRange: '2022–present', bodyStyle: 'muv' },
      { slug: 'ev6', name: 'EV6', yearRange: '2022–present', bodyStyle: 'coupe-suv' },
      { slug: 'ev9', name: 'EV9', yearRange: '2024–present', bodyStyle: 'suv' },
    ],
  },
  {
    slug: 'toyota',
    name: 'Toyota',
    brandColor: '#cc0000',
    models: [
      { slug: 'innova-crysta', name: 'Innova Crysta', yearRange: '2016–present', bodyStyle: 'muv' },
      { slug: 'innova-hycross', name: 'Innova Hycross', yearRange: '2023–present', bodyStyle: 'muv' },
      { slug: 'fortuner', name: 'Fortuner', yearRange: '2016–present', bodyStyle: 'suv' },
      {
        slug: 'urban-cruiser-hyryder',
        name: 'Urban Cruiser Hyryder',
        yearRange: '2022–present',
        bodyStyle: 'suv',
      },
      { slug: 'glanza', name: 'Glanza', yearRange: '2022–present', bodyStyle: 'hatchback' },
      { slug: 'camry', name: 'Camry', yearRange: '2019–present', bodyStyle: 'luxury-sedan' },
    ],
  },
  {
    slug: 'honda',
    name: 'Honda',
    brandColor: '#cc0000',
    models: [
      { slug: 'city', name: 'City', yearRange: '2020–present', bodyStyle: 'sedan' },
      { slug: 'amaze', name: 'Amaze', yearRange: '2024–present', bodyStyle: 'sedan' },
      { slug: 'elevate', name: 'Elevate', yearRange: '2023–present', bodyStyle: 'compact-suv' },
      { slug: 'city-hybrid', name: 'City Hybrid', yearRange: '2022–present', bodyStyle: 'sedan' },
      { slug: 'wr-v', name: 'WR-V', bodyStyle: 'compact-suv' },
    ],
  },
  {
    slug: 'mg',
    name: 'MG',
    brandColor: '#2d2d2d',
    models: [
      {
        slug: 'hector',
        name: 'Hector',
        yearRange: '2023–present',
        bodyStyle: 'suv',
        // A size up on the Creta in every direction, with a higher beltline.
        sketch: { length: 4.66, height: 1.76, wheelbase: 2.75, beltY: 0.66 },
      },
      { slug: 'astor', name: 'Astor', yearRange: '2021–present', bodyStyle: 'compact-suv' },
      { slug: 'zs-ev', name: 'ZS EV', yearRange: '2023–present', bodyStyle: 'compact-suv' },
      { slug: 'gloster', name: 'Gloster', yearRange: '2020–present', bodyStyle: 'suv' },
      { slug: 'comet-ev', name: 'Comet EV', yearRange: '2023–present', bodyStyle: 'hatchback' },
      { slug: 'windsor', name: 'Windsor', yearRange: '2024–present', bodyStyle: 'coupe-suv' },
    ],
  },
  {
    slug: 'volkswagen',
    name: 'Volkswagen',
    brandColor: '#001e50',
    models: [
      { slug: 'virtus', name: 'Virtus', yearRange: '2022–present', bodyStyle: 'sedan' },
      { slug: 'taigun', name: 'Taigun', yearRange: '2021–present', bodyStyle: 'compact-suv' },
      { slug: 'tiguan', name: 'Tiguan', yearRange: '2021–present', bodyStyle: 'suv' },
      { slug: 'polo', name: 'Polo', yearRange: '2010–2022', bodyStyle: 'hatchback' },
      { slug: 'vento', name: 'Vento', yearRange: '2010–2022', bodyStyle: 'sedan' },
    ],
  },
  {
    slug: 'skoda',
    name: 'Skoda',
    brandColor: '#0e3a2f',
    models: [
      { slug: 'slavia', name: 'Slavia', yearRange: '2022–present', bodyStyle: 'sedan' },
      { slug: 'kushaq', name: 'Kushaq', yearRange: '2021–present', bodyStyle: 'compact-suv' },
      { slug: 'kodiaq', name: 'Kodiaq', yearRange: '2022–present', bodyStyle: 'suv' },
      { slug: 'octavia', name: 'Octavia', yearRange: '2017–2022', bodyStyle: 'sedan' },
      { slug: 'superb', name: 'Superb', yearRange: '2020–present', bodyStyle: 'luxury-sedan' },
      { slug: 'rapid', name: 'Rapid', yearRange: '2011–2021', bodyStyle: 'sedan' },
    ],
  },
  {
    slug: 'renault',
    name: 'Renault',
    brandColor: '#8a7500',
    models: [
      { slug: 'kwid', name: 'Kwid', yearRange: '2015–present', bodyStyle: 'hatchback' },
      { slug: 'triber', name: 'Triber', yearRange: '2019–present', bodyStyle: 'muv' },
      { slug: 'kiger', name: 'Kiger', yearRange: '2021–present', bodyStyle: 'compact-suv' },
      { slug: 'duster', name: 'Duster', yearRange: '2012–2022', bodyStyle: 'suv' },
    ],
  },
  {
    slug: 'nissan',
    name: 'Nissan',
    brandColor: '#c3002f',
    models: [
      { slug: 'magnite', name: 'Magnite', yearRange: '2020–present', bodyStyle: 'compact-suv' },
      { slug: 'kicks', name: 'Kicks', yearRange: '2019–2023', bodyStyle: 'suv' },
      { slug: 'sunny', name: 'Sunny', yearRange: '2011–2019', bodyStyle: 'sedan' },
      { slug: 'terrano', name: 'Terrano', yearRange: '2013–2020', bodyStyle: 'suv' },
    ],
  },
  {
    slug: 'jeep',
    name: 'Jeep',
    brandColor: '#1b3c2f',
    models: [
      { slug: 'compass', name: 'Compass', yearRange: '2017–present', bodyStyle: 'suv' },
      { slug: 'meridian', name: 'Meridian', yearRange: '2022–present', bodyStyle: 'suv' },
      { slug: 'wrangler', name: 'Wrangler', yearRange: '2021–present', bodyStyle: 'off-roader' },
      {
        slug: 'grand-cherokee',
        name: 'Grand Cherokee',
        yearRange: '2022–present',
        bodyStyle: 'suv',
      },
    ],
  },
  {
    slug: 'citroen',
    name: 'Citroën',
    brandColor: '#8b1a2b',
    models: [
      { slug: 'c3', name: 'C3', yearRange: '2022–present', bodyStyle: 'hatchback' },
      { slug: 'c3-aircross', name: 'C3 Aircross', yearRange: '2023–present', bodyStyle: 'suv' },
      { slug: 'basalt', name: 'Basalt', yearRange: '2024–present', bodyStyle: 'coupe-suv' },
      { slug: 'ec3', name: 'ëC3', yearRange: '2023–present', bodyStyle: 'hatchback' },
    ],
  },
  {
    slug: 'mercedes-benz',
    name: 'Mercedes-Benz',
    brandColor: '#2d3538',
    models: [
      { slug: 'c-class', name: 'C-Class', yearRange: '2022–present', bodyStyle: 'luxury-sedan' },
      { slug: 'e-class', name: 'E-Class', yearRange: '2021–present', bodyStyle: 'luxury-sedan' },
      { slug: 'glc', name: 'GLC', yearRange: '2023–present', bodyStyle: 'suv' },
      { slug: 'gla', name: 'GLA', yearRange: '2021–present', bodyStyle: 'compact-suv' },
      { slug: 'gle', name: 'GLE', yearRange: '2020–present', bodyStyle: 'suv' },
    ],
  },
  {
    slug: 'bmw',
    name: 'BMW',
    brandColor: '#0066b1',
    models: [
      { slug: '3-series', name: '3 Series', yearRange: '2019–present', bodyStyle: 'luxury-sedan' },
      { slug: '5-series', name: '5 Series', yearRange: '2024–present', bodyStyle: 'luxury-sedan' },
      { slug: 'x1', name: 'X1', yearRange: '2023–present', bodyStyle: 'compact-suv' },
      { slug: 'x3', name: 'X3', yearRange: '2022–present', bodyStyle: 'suv' },
      { slug: 'x5', name: 'X5', yearRange: '2019–present', bodyStyle: 'suv' },
    ],
  },
  {
    slug: 'audi',
    name: 'Audi',
    brandColor: '#bb0a30',
    models: [
      { slug: 'a4', name: 'A4', yearRange: '2021–present', bodyStyle: 'luxury-sedan' },
      { slug: 'a6', name: 'A6', yearRange: '2019–present', bodyStyle: 'luxury-sedan' },
      { slug: 'q3', name: 'Q3', yearRange: '2022–present', bodyStyle: 'compact-suv' },
      { slug: 'q5', name: 'Q5', yearRange: '2021–present', bodyStyle: 'suv' },
      { slug: 'q7', name: 'Q7', yearRange: '2022–present', bodyStyle: 'suv' },
    ],
  },
  {
    slug: 'ford',
    name: 'Ford',
    brandColor: '#00274e',
    models: [
      { slug: 'ecosport', name: 'EcoSport', yearRange: '2013–2021', bodyStyle: 'compact-suv' },
      { slug: 'endeavour', name: 'Endeavour', yearRange: '2016–2021', bodyStyle: 'suv' },
      { slug: 'figo', name: 'Figo', yearRange: '2015–2021', bodyStyle: 'hatchback' },
      { slug: 'aspire', name: 'Aspire', yearRange: '2015–2021', bodyStyle: 'sedan' },
    ],
  },
] as const;
