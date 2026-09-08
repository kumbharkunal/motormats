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
            className="bg-accent hover:shadow-glow flex h-14 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold tracking-[0.15em] text-white uppercase shadow-[0_4px_15px_rgba(225,6,0,0.25)] transition-shadow duration-300"
          >
            <MessageCircle aria-hidden size={18} />
            WhatsApp us
          </a>

          <dl className="card-surface space-y-5 rounded-3xl p-6 text-sm">
            <Detail icon={Phone} label="Phone">
              {BUSINESS.phoneDisplay}
            </Detail>
            <Detail icon={Mail} label="Email">
              <a
                href={`mailto:${BUSINESS.email}`}
                className="hover:text-foreground transition-colors duration-200"
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
      <Icon aria-hidden size={18} className="text-accent-text mt-0.5 shrink-0" />
      <div>
        <dt className="text-foreground/80 text-xs tracking-[0.12em] uppercase">{label}</dt>
        <dd className="text-muted-foreground mt-1 leading-relaxed">{children}</dd>
      </div>
    </div>
  );
}
