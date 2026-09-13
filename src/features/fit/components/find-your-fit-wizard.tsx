'use client';

import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { COLLECTION_CARDS, collectionPath, type CollectionSlug } from '@/features/catalog/routes';
import { fitCatalogHref, saveFitSelection, type FitSelection } from '@/features/fit/fit-session';
import { VirtualModelList } from '@/features/fit/components/virtual-model-list';
import { yearsForModel } from '@/features/fit/years';
import { VEHICLE_BRANDS } from '@/features/vehicles/data/brands';
import { cn } from '@/lib/utils';

const STEPS = ['Car', 'Model', 'Year', 'Exact fit', 'Material', 'Buy'] as const;

type FindYourFitWizardProps = {
  /** Homepage embed uses a tighter layout; full page uses default. */
  variant?: 'home' | 'page';
};

export function FindYourFitWizard({ variant = 'page' }: FindYourFitWizardProps) {
  const [step, setStep] = useState(0);
  const [brandSlug, setBrandSlug] = useState<string | null>(null);
  const [modelSlug, setModelSlug] = useState<string | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [materialSlug, setMaterialSlug] = useState<CollectionSlug | null>(null);

  const brand = VEHICLE_BRANDS.find((b) => b.slug === brandSlug) ?? null;
  const model = brand?.models.find((m) => m.slug === modelSlug) ?? null;
  const years = useMemo(() => yearsForModel(model?.yearRange), [model?.yearRange]);

  const selection: FitSelection | null =
    brand && model && year && materialSlug
      ? {
          brandSlug: brand.slug,
          brandName: brand.name,
          modelSlug: model.slug,
          modelName: model.name,
          year,
          materialSlug,
        }
      : null;

  const buyHref = selection ? fitCatalogHref(selection) : '#';

  function goNext() {
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function pickBrand(slug: string) {
    setBrandSlug(slug);
    setModelSlug(null);
    setYear(null);
    setMaterialSlug(null);
    setStep(1);
  }

  function pickModel(slug: string) {
    setModelSlug(slug);
    setYear(null);
    setMaterialSlug(null);
    setStep(2);
  }

  function pickYear(y: number) {
    setYear(y);
    setMaterialSlug(null);
    setStep(3);
  }

  function confirmFit() {
    setStep(4);
  }

  function pickMaterial(slug: CollectionSlug) {
    setMaterialSlug(slug);
    if (brand && model && year) {
      saveFitSelection({
        brandSlug: brand.slug,
        brandName: brand.name,
        modelSlug: model.slug,
        modelName: model.name,
        year,
        materialSlug: slug,
      });
    }
    setStep(5);
  }

  const isHome = variant === 'home';

  return (
    <div
      className={cn(
        'rounded-3xl border border-border',
        isHome ? 'bg-white p-5 md:p-8' : 'bg-white p-6 md:p-10',
      )}
    >
      <div className="mb-8" aria-label={`Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`}>
        <div className="flex items-center justify-between gap-3 text-sm">
          <p className="font-semibold text-foreground">
            Step {step + 1} of {STEPS.length}
          </p>
          <p className="text-muted-foreground">{STEPS[step]}</p>
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-surface-elevated">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {step === 0 ? (
        <div>
          <h3 className="text-lg font-semibold tracking-tight md:text-xl">Select your car brand</h3>
          <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:gap-3">
            {VEHICLE_BRANDS.map((b) => (
              <li key={b.slug}>
                <button
                  type="button"
                  onClick={() => pickBrand(b.slug)}
                  className={cn(
                    'flex w-full flex-col items-center gap-2 rounded-2xl border p-3 transition-colors duration-200 hover:border-foreground',
                    brandSlug === b.slug ? 'border-accent bg-accent/5' : 'border-border bg-surface',
                  )}
                >
                  <Image src={b.image} alt="" width={96} height={56} unoptimized className="h-10 w-16 object-contain" />
                  <span className="text-center text-[0.6875rem] font-semibold tracking-wide uppercase">
                    {b.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {step === 1 && brand ? (
        <div>
          <h3 className="text-lg font-semibold tracking-tight md:text-xl">{brand.name} model</h3>
          <VirtualModelList models={[...brand.models]} onPick={pickModel} />
        </div>
      ) : null}

      {step === 2 && model ? (
        <div>
          <h3 className="text-lg font-semibold tracking-tight md:text-xl">Which year is your {model.name}?</h3>
          <ul className="mt-5 flex flex-wrap gap-2">
            {years.map((y) => (
              <li key={y}>
                <button
                  type="button"
                  onClick={() => pickYear(y)}
                  className={cn(
                    'min-w-[4.5rem] rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                    year === y ? 'border-accent bg-accent text-white' : 'border-border hover:border-foreground',
                  )}
                >
                  {y}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {step === 3 && brand && model && year ? (
        <div className="max-w-lg">
          <h3 className="text-lg font-semibold tracking-tight md:text-xl">Exact fit confirmed</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            We laser-cut for{' '}
            <strong className="text-foreground">
              {brand.name} {model.name} ({year})
            </strong>
            — pedal box, tunnel and anchor points included. No universal sizing.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
              Pattern matched to this generation
            </li>
            <li className="flex items-start gap-2">
              <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
              RHD footwells — driver &amp; passenger wells aligned
            </li>
            <li className="flex items-start gap-2">
              <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
              Cut after you order — made for your VIN trim
            </li>
          </ul>
          <Button type="button" className="mt-8" size="lg" onClick={confirmFit}>
            Continue to material
            <ArrowRight aria-hidden className="ml-1 size-4" />
          </Button>
        </div>
      ) : null}

      {step === 4 && brand && model && year ? (
        <div>
          <h3 className="text-lg font-semibold tracking-tight md:text-xl">Choose your material</h3>
          <p className="mt-2 text-sm text-muted-foreground">Same exact fit — pick the surface you want underfoot.</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {COLLECTION_CARDS.map((card) => (
              <li key={card.slug}>
                <button
                  type="button"
                  onClick={() => pickMaterial(card.slug)}
                  className={cn(
                    'w-full rounded-2xl border p-4 text-left transition-colors hover:border-foreground',
                    materialSlug === card.slug ? 'border-accent ring-1 ring-accent/30' : 'border-border',
                  )}
                >
                  <p className="text-xs font-semibold tracking-wide text-accent uppercase">{card.tagline}</p>
                  <p className="mt-1 font-semibold">{card.name}</p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{card.body}</p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {step === 5 && selection ? (
        <div className="max-w-lg">
          <div className="flex items-center gap-2 text-accent">
            <Sparkles aria-hidden className="size-5" />
            <p className="text-sm font-semibold uppercase tracking-wide">Your fit is ready</p>
          </div>
          <h3 className="mt-4 text-xl font-semibold tracking-tight md:text-2xl">
            {selection.brandName} {selection.modelName} · {selection.year}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Material:{' '}
            <strong className="text-foreground">
              {COLLECTION_CARDS.find((c) => c.slug === selection.materialSlug)?.name}
            </strong>
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={buyHref}>Shop this fit</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="w-full border border-border sm:w-auto">
              <Link href={collectionPath(selection.materialSlug)}>Browse {selection.materialSlug} range</Link>
            </Button>
          </div>
        </div>
      ) : null}

      <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={goBack}
          disabled={step === 0}
          className="gap-1"
        >
          <ArrowLeft aria-hidden className="size-4" />
          Back
        </Button>
        {isHome && step < 5 ? (
          <Button asChild size="sm" variant="ghost" className="border border-border">
            <Link href="/find-your-fit">Full-screen fit</Link>
          </Button>
        ) : (
          <span aria-hidden className="size-px" />
        )}
        {step < 3 && brandSlug && step > 0 ? (
          <Button type="button" size="sm" onClick={goNext} disabled={step === 1 && !modelSlug}>
            Next
            <ArrowRight aria-hidden className="ml-1 size-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
