import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import type { Metadata } from 'next';

import { BUSINESS, whatsappHref } from '@/features/marketing/business';
import { ContactForm } from '@/features/marketing/components/contact-form';
import { LocationMap } from '@/features/marketing/components/location-map';
import { PageShell } from '@/features/marketing/components/page-shell';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Talk to Motormats about fitment for your vehicle, an existing order, or bulk and dealer enquiries.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <PageShell
      breadcrumb="Contact"
      title="Talk to us"
      intro="Fitment questions, an order that needs chasing, or a dealer enquiry — WhatsApp is the fastest way to reach a person."
      wide
    >
      <div className="grid gap-10 lg:grid-cols-[1fr_20rem] lg:gap-14">
        <div>
          <ContactForm />
        </div>

        <aside className="space-y-6">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-accent text-sm font-semibold tracking-[0.15em] text-white uppercase shadow-glow-sm transition-shadow duration-300 hover:shadow-glow"
          >
            <MessageCircle aria-hidden size={18} />
            WhatsApp us
          </a>

          <dl className="space-y-5 rounded-3xl card-surface p-6 text-sm">
            <Detail icon={Phone} label="Phone">
              {BUSINESS.phoneDisplay}
            </Detail>
            <Detail icon={Mail} label="Email">
              <a
                href={`mailto:${BUSINESS.email}`}
                className="transition-colors duration-200 hover:text-foreground"
              >
                {BUSINESS.email}
              </a>
            </Detail>
            <Detail icon={Clock} label="Hours">
              {BUSINESS.hours}
            </Detail>
            <Detail icon={MapPin} label="Address">
              {BUSINESS.address.line1}
              <br />
              {BUSINESS.address.city}, {BUSINESS.address.state} {BUSINESS.address.postalCode}
            </Detail>
          </dl>
        </aside>
      </div>

      <LocationMap />
    </PageShell>
  );
}

function Detail({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Phone;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <Icon aria-hidden size={18} className="mt-0.5 shrink-0 text-accent-text" />
      <div>
        <dt className="text-xs tracking-[0.12em] text-foreground/80 uppercase">{label}</dt>
        <dd className="mt-1 leading-relaxed text-muted-foreground">{children}</dd>
      </div>
    </div>
  );
}
