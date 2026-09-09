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

export function SiteFooter() {
  return (
    <footer className="relative w-full border-t border-border">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent shadow-[0_0_20px_rgba(225,6,0,0.6)]"
      />

      {/* Top padding gets its own, larger floor: the accent rule above blurs
          20px downward, and at 4svh a short phone left it landing on the logo. */}
      <div className="container-page pt-[clamp(2.25rem,5svh,3.5rem)] pb-[clamp(1.5rem,4svh,3.5rem)]">
        {/* `grid-cols-1` for its `minmax(0, 1fr)`, not for the column count: a bare
            `grid` gives the single track `auto`, which sizes to the widest child's
            min-content and pushed the whole page 28px wide at 320px. */}
        <div className="grid grid-cols-1 gap-[clamp(1.25rem,3svh,1.5rem)] md:grid-cols-12 md:gap-12">
          <div className="md:col-span-4">
            <MotormatsLogo size="md" />
            <p className="mt-3 line-clamp-2 max-w-sm text-sm leading-relaxed text-muted-foreground/70 md:mt-5 md:line-clamp-none">
              Engineered for Excellence. Premium protection for discerning drivers who demand the
              absolute best for their vehicle&apos;s interior.
            </p>

            <ul className="mt-4 flex gap-3 md:mt-6">
              {SOCIAL_LINKS.map(({ icon: Icon, label }) => (
                <li key={label}>
                  <Link
                    href="/contact"
                    aria-label={label}
                    className="flex size-11 items-center justify-center rounded-full bg-white/5 text-muted-foreground transition-colors duration-300 hover:bg-white/10 hover:text-foreground"
                  >
                    <Icon aria-hidden size={18} />
                  </Link>
                </li>
              ))}
            </ul>

            <p className="mt-4 hidden text-[0.8125rem] tracking-wider text-muted-foreground/50 md:mt-6 md:block">
              © {new Date().getFullYear()} Motormats. Engineered for Excellence.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 md:col-span-4 md:gap-8">
            {FOOTER_SECTIONS.map((section) => (
              <nav key={section.title} aria-label={section.title}>
                <h2 className="font-sans text-[0.8125rem] font-semibold tracking-[0.12em] text-foreground/80 uppercase">
                  {section.title}
                </h2>
                <ul className="mt-3 space-y-2 md:mt-5 md:space-y-3">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground/70 transition-colors duration-200 hover:text-foreground"
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
            <h2 className="font-sans text-[0.8125rem] font-semibold tracking-[0.12em] text-foreground/80 uppercase">
              Stay Ahead
            </h2>
            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground/70 md:mt-5 md:line-clamp-none">
              Subscribe for exclusive releases, technical insights, and priority access to new
              patterns.
            </p>
            <NewsletterForm />
          </div>
        </div>

        <div className="mt-[clamp(1rem,2.5svh,2.5rem)] flex flex-col gap-1 border-t border-border pt-3 text-[0.6875rem] md:flex-row md:items-center md:justify-between md:gap-3 md:pt-6 md:text-sm">
          <p className="flex items-center gap-2 text-muted-foreground/40 md:gap-3">
            <CreditCard aria-hidden className="size-4 shrink-0 md:size-5.5" />
            <span className="text-muted-foreground/30">Visa • Mastercard • UPI • COD</span>
          </p>

          <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-6">
            <p className="text-muted-foreground/30">
              All prices inclusive of GST. Made with precision in India.
            </p>
            <div aria-hidden className="hidden h-4 w-px bg-white/10 md:block" />
            <p className="flex items-center gap-1.5 text-muted-foreground/40 md:text-[0.8125rem]">
              <span className="md:hidden">© {new Date().getFullYear()} Motormats ·</span>
              Designed &amp; Developed by
              <a
                href="https://napps.in"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground transition-colors duration-200 hover:text-accent-text"
              >
                napps.in
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
