import { AtSign, Camera, CreditCard, Film, Globe } from 'lucide-react';
import Link from 'next/link';

import { MotormatsLogo } from '@/components/layout/motormats-logo';
import { NewsletterForm } from '@/components/layout/newsletter-form';
import { collectionPath, SHOP_ROUTES } from '@/features/catalog/routes';

const FOOTER_SECTIONS = [
  {
    title: 'Shop',
    links: [
      { label: 'All Mats', href: SHOP_ROUTES.collections },
      { label: '7D Luxury', href: collectionPath('7d-luxury') },
      { label: 'Carbon', href: collectionPath('carbon') },
      { label: 'Executive Carpet', href: collectionPath('carpet') },
      { label: 'All-Weather', href: collectionPath('all-weather') },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Our Story', href: SHOP_ROUTES.ourStory },
      { label: 'Gallery', href: SHOP_ROUTES.gallery },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Shipping & Returns', href: '/shipping-and-returns' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
] as const;

const SOCIAL_LINKS = [
  { icon: Camera, label: 'Instagram', href: SHOP_ROUTES.instagram },
  { icon: AtSign, label: 'Twitter', href: SHOP_ROUTES.contact },
  { icon: Globe, label: 'Facebook', href: SHOP_ROUTES.contact },
  { icon: Film, label: 'YouTube', href: SHOP_ROUTES.contact },
] as const;

/**
 * The footer, on ink.
 *
 * It used to be the one white plane on the page, lifting itself off the grey
 * sections above. The page no longer has one ground to lift off — it alternates
 * — so the footer closes it on the darker of the two and the closing CTA above
 * runs straight into it without a rule between them.
 *
 * `band-dark` re-points the text and line tokens, which is why every rank here
 * is still a token at full strength rather than an alpha on white. Diluting one
 * ink was how the payment strip previously measured 1.6:1.
 */
export function SiteFooter() {
  return (
    <footer className="band-dark w-full border-t border-border">
      <div className="container-page pt-[clamp(3rem,7vw,5rem)] pb-[clamp(1.5rem,4vw,2.5rem)]">
        {/* `grid-cols-1` for its `minmax(0, 1fr)`, not for the column count: a bare
            `grid` gives the single track `auto`, which sizes to the widest child's
            min-content and pushed the whole page 28px wide at 320px. */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-3">
            <MotormatsLogo size="md" tone="brand" className="h-8" />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
              A better floor, for every drive. Premium protection for drivers who want the interior
              to look the way it did on day one.
            </p>

            <ul className="mt-8 flex gap-2">
              {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    aria-label={label}
                    {...(href.startsWith('http')
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                    className="flex size-11 items-center justify-center border border-border text-muted-foreground transition-colors duration-300 hover:border-accent hover:bg-accent hover:text-white"
                  >
                    <Icon aria-hidden size={16} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-10 md:col-span-5 sm:grid-cols-3">
            {FOOTER_SECTIONS.map((section) => (
              <nav key={section.title} aria-label={section.title}>
                <h2 className="caps text-eyebrow text-foreground">{section.title}</h2>
                <ul className="mt-6 space-y-3">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors duration-200 hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          <div className="md:col-span-4">
            <h2 className="caps text-eyebrow text-foreground">Join the drive</h2>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              Exclusive releases, technical notes and first access to new patterns.
            </p>
            <NewsletterForm />
          </div>
        </div>

        <div className="mt-[clamp(2.5rem,5vw,4rem)] flex flex-col gap-3 border-t border-border pt-6 text-[0.8125rem] text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p className="flex items-center gap-2.5">
            <CreditCard aria-hidden className="size-4 shrink-0" />
            Visa · Mastercard · UPI · COD
          </p>

          <p>All prices inclusive of GST. Made with precision in India.</p>

          <p>
            © {new Date().getFullYear()} Motormats · Built by{' '}
            <a
              href="https://napps.in"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-white transition-colors duration-200 hover:text-accent-text"
            >
              napps.in
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
