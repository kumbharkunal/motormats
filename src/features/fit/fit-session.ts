import type { CollectionSlug } from '@/features/catalog/routes';

export type FitSelection = {
  brandSlug: string;
  brandName: string;
  modelSlug: string;
  modelName: string;
  year: number;
  materialSlug: CollectionSlug;
};

const STORAGE_KEY = 'motormats-fit-selection';

export function saveFitSelection(selection: FitSelection) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
}

export function readFitSelection(): FitSelection | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FitSelection;
  } catch {
    return null;
  }
}

export function fitCatalogHref(selection: FitSelection): string {
  const params = new URLSearchParams({
    brand: selection.brandSlug,
    model: selection.modelSlug,
    year: String(selection.year),
    fit: '1',
  });
  return `/collections/${selection.materialSlug}?${params.toString()}`;
}
