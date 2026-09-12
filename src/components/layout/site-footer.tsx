import { AtSign, Camera, CreditCard, Film, Globe } from 'lucide-react';
import Link from 'next/link';

import { MotormatsLogo } from '@/components/layout/motormats-logo';
import { NewsletterForm } from '@/components/layout/newsletter-form';

const FOOTER_SECTIONS = [
  {
    title: 'Company',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'About Us', href: '/our-story' },
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
  { icon: Camera, label: 'Instagram' },
  { icon: AtSign, label: 'Twitter' },
  { icon: Globe, label: 'Facebook' },
  { icon: Film, label: 'YouTube' },
] as const;

/**
 * Every rank here uses a palette token at full strength.
 *
 * This footer used to dilute one ink with alpha — `/70` for links, `/40` for the
 * copyright, `/30` for the payment strip. On the near-white canvas that last one
 * measured 1.6:1, which is not quiet, it is invisible; even the links only
 * reached 3.48:1. The scale already has three ranks drawn for this exact job
 * (7.7:1, 5.0:1 and the brand red at 5.0:1), so the hierarchy comes from
 * choosing between them rather than from fading one out.
 *
 * White rather than the page canvas: it lifts the footer off the grey sections
 * above it without needing a heavy rule to separate them.
 */
export function SiteFooter() {
  return (
    <footer className="relative w-full border-t border-border bg-surface">
      <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-accent" />

      <div className="container-page pt-[clamp(3rem,7vw,5rem)] pb-[clamp(1.5rem,4vw,2.5rem)]">
        {/* `grid-cols-1` for its `minmax(0, 1fr)`, not for the column count: a bare
            `grid` gives the single track `auto`, which sizes to the widest child's
            min-content and pushed the whole page 28px wide at 320px. */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-4">
            <MotormatsLogo size="md" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Engineered for excellence. Premium protection for drivers who want the interior to
              look the way it did on day one.
            </p>

            <ul className="mt-7 flex gap-3">
              {SOCIAL_LINKS.map(({ icon: Icon, label }) => (
                <li key={label}>
                  <Link
                    href="/contact"
                    aria-label={label}
                    className="flex size-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors duration-300 hover:border-accent hover:bg-accent hover:text-white"
                  >
                    <Icon aria-hidden size={17} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-6 md:col-span-4 md:gap-8">
            {FOOTER_SECTIONS.map((section) => (
              <nav key={section.title} aria-label={section.title}>
                <h2 className="text-eyebrow font-semibold text-accent uppercase">
                  {section.title}
                </h2>
                <ul className="mt-5 space-y-3">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors duration-200 hover:text-accent"
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
            <h2 className="text-eyebrow font-semibold text-accent uppercase">Stay Ahead</h2>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              Exclusive releases, technical notes and first access to new patterns.
            </p>
            <NewsletterForm />
          </div>
        </div>

        <div className="mt-[clamp(2.5rem,5vw,4rem)] flex flex-col gap-3 border-t border-border pt-6 text-[0.8125rem] text-subtle-foreground md:flex-row md:items-center md:justify-between">
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
              className="font-medium text-foreground transition-colors duration-200 hover:text-accent"
            >
              napps.in
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
