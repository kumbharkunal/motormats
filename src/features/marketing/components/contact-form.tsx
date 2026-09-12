'use client';

import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

const FIELD =
  'border-border bg-surface focus:border-accent/50 placeholder:text-subtle-foreground w-full rounded-2xl border px-4 py-3 text-sm transition-colors duration-200 focus:outline-none';

/**
 * There is no enquiry store or mail transport yet, so this deliberately does
 * not claim a message was sent — it points the customer at WhatsApp, which
 * actually reaches someone.
 */
export function ContactForm() {
  const [sending, setSending] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      toast.info('The enquiry form is not connected yet. Please reach us on WhatsApp meanwhile.');
    }, 400);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="mb-2 block text-sm font-medium">
            Your name
          </label>
          <input id="contact-name" name="name" required autoComplete="name" className={FIELD} />
        </div>
        <div>
          <label htmlFor="contact-phone" className="mb-2 block text-sm font-medium">
            Phone
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            inputMode="tel"
            className={FIELD}
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-email" className="mb-2 block text-sm font-medium">
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={FIELD}
        />
      </div>

      <div>
        <label htmlFor="contact-vehicle" className="mb-2 block text-sm font-medium">
          Vehicle <span className="font-normal text-muted-foreground">(make and model)</span>
        </label>
        <input
          id="contact-vehicle"
          name="vehicle"
          placeholder="e.g. Hyundai Creta 2023"
          className={FIELD}
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-2 block text-sm font-medium">
          How can we help?
        </label>
        <textarea id="contact-message" name="message" required rows={5} className={FIELD} />
      </div>

      <Button type="submit" size="lg" isLoading={sending} className="w-full sm:w-auto">
        Send enquiry
      </Button>
    </form>
  );
}
