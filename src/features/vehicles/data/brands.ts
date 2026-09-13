export type VehicleModel = {
  slug: string;
  name: string;
  yearRange?: string;
};

export type VehicleBrand = {
  slug: string;
  name: string;
  /** Body style hint used by `BrandIcon` to pick the right silhouette. */
  bodyStyle: 'hatchback' | 'sedan' | 'suv' | 'luxury-sedan' | 'compact-suv';
  /** Brand-specific color for the car silhouette icon. */
  brandColor: string;
  /** Path to the hero car image in `/public`. */
  image: string;
  models: VehicleModel[];
};

/**
 * Indian car brands with their most popular models.
 *
 * Capped to ~8 brands so the rail fits the 1340px container without scrolling.
 * Models are the top-sellers in each brand's Indian lineup (2024-2026).
 *
 * This is static demo data for client presentation — no database backing yet.
 */
export const VEHICLE_BRANDS: VehicleBrand[] = [
  {
    slug: 'maruti-suzuki',
    name: 'Maruti Suzuki',
    bodyStyle: 'hatchback',
    brandColor: '#1a3c8a',
    image: '/cars/swift.webp',
    models: [
      { slug: 'swift', name: 'Swift', yearRange: '2024–present' },
      { slug: 'baleno', name: 'Baleno', yearRange: '2022–present' },
      { slug: 'brezza', name: 'Brezza', yearRange: '2022–present' },
      { slug: 'ertiga', name: 'Ertiga', yearRange: '2018–present' },
      { slug: 'wagon-r', name: 'WagonR', yearRange: '2019–present' },
      { slug: 'dzire', name: 'Dzire', yearRange: '2024–present' },
      { slug: 'fronx', name: 'Fronx', yearRange: '2023–present' },
      { slug: 'grand-vitara', name: 'Grand Vitara', yearRange: '2022–present' },
    ],
  },
  {
    slug: 'hyundai',
    name: 'Hyundai',
    bodyStyle: 'sedan',
    brandColor: '#0e3e8a',
    image: '/cars/creta.webp',
    models: [
      { slug: 'creta', name: 'Creta', yearRange: '2024–present' },
      { slug: 'venue', name: 'Venue', yearRange: '2019–present' },
      { slug: 'i20', name: 'i20', yearRange: '2020–present' },
      { slug: 'verna', name: 'Verna', yearRange: '2023–present' },
      { slug: 'tucson', name: 'Tucson', yearRange: '2022–present' },
      { slug: 'alcazar', name: 'Alcazar', yearRange: '2021–present' },
    ],
  },
  {
    slug: 'tata',
    name: 'Tata',
    bodyStyle: 'compact-suv',
    brandColor: '#1c45a6',
    image: '/cars/nexon.webp',
    models: [
      { slug: 'nexon', name: 'Nexon', yearRange: '2023–present' },
      { slug: 'punch', name: 'Punch', yearRange: '2021–present' },
      { slug: 'harrier', name: 'Harrier', yearRange: '2023–present' },
      { slug: 'safari', name: 'Safari', yearRange: '2021–present' },
      { slug: 'tiago', name: 'Tiago', yearRange: '2016–present' },
      { slug: 'altroz', name: 'Altroz', yearRange: '2020–present' },
      { slug: 'curvv', name: 'Curvv', yearRange: '2024–present' },
    ],
  },
  {
    slug: 'mahindra',
    name: 'Mahindra',
    bodyStyle: 'suv',
    brandColor: '#b91c1c',
    image: '/cars/thar.webp',
    models: [
      { slug: 'thar', name: 'Thar', yearRange: '2020–present' },
      { slug: 'xuv700', name: 'XUV700', yearRange: '2021–present' },
      { slug: 'scorpio-n', name: 'Scorpio-N', yearRange: '2022–present' },
      { slug: 'xuv3xo', name: 'XUV 3XO', yearRange: '2024–present' },
      { slug: 'bolero', name: 'Bolero', yearRange: '2020–present' },
      { slug: 'xuv400', name: 'XUV400 EV', yearRange: '2023–present' },
    ],
  },
  {
    slug: 'kia',
    name: 'Kia',
    bodyStyle: 'compact-suv',
    brandColor: '#05141f',
    image: '/cars/seltos.webp',
    models: [
      { slug: 'seltos', name: 'Seltos', yearRange: '2023–present' },
      { slug: 'sonet', name: 'Sonet', yearRange: '2020–present' },
      { slug: 'carens', name: 'Carens', yearRange: '2022–present' },
      { slug: 'ev6', name: 'EV6', yearRange: '2022–present' },
      { slug: 'ev9', name: 'EV9', yearRange: '2024–present' },
    ],
  },
  {
    slug: 'toyota',
    name: 'Toyota',
    bodyStyle: 'sedan',
    brandColor: '#cc0000',
    image: '/cars/innova.webp',
    models: [
      { slug: 'innova-crysta', name: 'Innova Crysta', yearRange: '2016–present' },
      { slug: 'innova-hycross', name: 'Innova Hycross', yearRange: '2023–present' },
      { slug: 'fortuner', name: 'Fortuner', yearRange: '2016–present' },
      { slug: 'urban-cruiser-hyryder', name: 'Urban Cruiser Hyryder', yearRange: '2022–present' },
      { slug: 'glanza', name: 'Glanza', yearRange: '2022–present' },
      { slug: 'camry', name: 'Camry', yearRange: '2019–present' },
    ],
  },
  {
    slug: 'honda',
    name: 'Honda',
    bodyStyle: 'sedan',
    brandColor: '#cc0000',
    image: '/cars/city.webp',
    models: [
      { slug: 'city', name: 'City', yearRange: '2020–present' },
      { slug: 'amaze', name: 'Amaze', yearRange: '2024–present' },
      { slug: 'elevate', name: 'Elevate', yearRange: '2023–present' },
      { slug: 'city-hybrid', name: 'City Hybrid', yearRange: '2022–present' },
      { slug: 'wr-v', name: 'WR-V' },
    ],
  },
  {
    slug: 'mg',
    name: 'MG',
    bodyStyle: 'suv',
    brandColor: '#2d2d2d',
    image: '/cars/hector.webp',
    models: [
      { slug: 'hector', name: 'Hector', yearRange: '2023–present' },
      { slug: 'astor', name: 'Astor', yearRange: '2021–present' },
      { slug: 'zs-ev', name: 'ZS EV', yearRange: '2023–present' },
      { slug: 'gloster', name: 'Gloster', yearRange: '2020–present' },
      { slug: 'comet-ev', name: 'Comet EV', yearRange: '2023–present' },
      { slug: 'windsor', name: 'Windsor', yearRange: '2024–present' },
    ],
  },
] as const;
