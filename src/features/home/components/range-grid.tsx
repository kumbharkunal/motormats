import { ArrowLink } from '@/components/editorial/arrow-link';
import { SectionIntro } from '@/components/editorial/section-intro';
import { ProductCard, type ProductCardItem } from '@/features/catalog/components/product-card';
import { SHOP_ROUTES } from '@/features/catalog/routes';
import { RevealScope } from '@/features/home/components/reveal-scope';

/**
 * The four ranges, as the product itself.
 *
 * This replaces `ProductZone` — an editorial plate beside a 2x2 of cards, run
 * twice with different copy — plus the collections rail and the materials
 * comparison table, all three of which were arguing the same point in three
 * registers. The mats are photographed as transparent cutouts, so the cards can
 * carry the whole argument: four surfaces, side by side, at the same scale.
 *
 * A server component. The cards contain a client quick-add button and nothing
 * else interactive, so the only client boundary the band needs is `RevealScope`
 * — which is a div with a ref.
 */
export function RangeGrid({ products }: { products: ProductCardItem[] }) {
  if (products.length === 0) return null;

  return (
    <section
      id="the-range"
      aria-labelledby="range-heading"
      className="band-light border-b border-border"
    >
      <div className="container-page py-section">
        <RevealScope>
          <div data-reveal>
            <SectionIntro
              eyebrow="Cut to your floorpan"
              titleId="range-heading"
              title={
                <>
                  Made
                  <br />
                  to fit.
                </>
              }
              body="Every pattern starts from a 3D scan of the actual car. No size brackets, no trimming, no gap at the pedals."
              action={<ArrowLink href={SHOP_ROUTES.collections}>Shop all mats</ArrowLink>}
            />
          </div>

          {/*
            `fade`, not the default rise: every card holds a quick-add button,
            and a wrapper that carries a transform — even for the 900ms of an
            entrance — is what desynchronises a tap target from its paint.
          */}
          <ul
            data-reveal="fade"
            className="mt-12 grid grid-cols-2 gap-px bg-border md:mt-16 lg:grid-cols-4"
          >
            {products.map((product, index) => (
              <li key={product.publicId} className="flex">
                {/* `w-full`: the card is a flex child here, so without it the
                    article shrinks to its content and the grid's hairline
                    ground shows through as a block of colour beside it. */}
                <ProductCard product={product} priority={index < 2} className="w-full border-0" />
              </li>
            ))}
          </ul>
        </RevealScope>
      </div>
    </section>
  );
}
