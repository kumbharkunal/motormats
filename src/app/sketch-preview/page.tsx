import { BrandMark } from '@/features/vehicles/components/brand-mark';
import { CarSketch } from '@/features/vehicles/components/car-sketch';
import { VEHICLE_BRANDS } from '@/features/vehicles/data/brands';

/** Scratch route for eyeballing the marks and sketches. Deleted before merge. */
export default function SketchPreviewPage() {
  return (
    <main className="bg-white p-10">
      <div id="marks" className="flex gap-6">
        {VEHICLE_BRANDS.map((brand) => (
          <div key={brand.slug} className="flex-1 text-center text-neutral-800">
            <BrandMark brand={brand.slug} className="mx-auto w-20" />
            <p className="mt-3 text-[10px] tracking-widest text-neutral-500 uppercase">
              {brand.name}
            </p>
            <CarSketch
              bodyStyle={brand.models[0]!.bodyStyle}
              {...(brand.models[0]!.sketch ? { override: brand.models[0]!.sketch } : {})}
              className="mt-4 text-neutral-700"
            />
          </div>
        ))}
      </div>

      <div id="big" className="mt-16 flex gap-10">
        {VEHICLE_BRANDS.slice(0, 4).map((brand) => (
          <BrandMark key={brand.slug} brand={brand.slug} className="w-40 text-neutral-800" />
        ))}
      </div>
      <div className="mt-10 flex gap-10">
        {VEHICLE_BRANDS.slice(4).map((brand) => (
          <BrandMark key={brand.slug} brand={brand.slug} className="w-40 text-neutral-800" />
        ))}
      </div>
    </main>
  );
}
