'use client';

import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

/**
 * The only interactive part of the footer, isolated so `SiteFooter` itself stays
 * a Server Component.
 *
 * There is no subscriber store yet, so the form deliberately does not claim to
 * have saved anything — it says so instead of fabricating a confirmation.
 */
export function NewsletterForm() {
  const [email, setEmail] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmail('');
    toast.info('Newsletter sign-up is not live yet. Please check back soon.');
  }

  return (
    <form className="mt-5 flex" onSubmit={handleSubmit}>
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        name="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Enter your email"
        className="border-border focus:border-accent/50 min-w-0 flex-1 rounded-l-full border bg-white/5 px-5 py-3 text-sm text-white transition-colors duration-200 placeholder:text-white/30 focus:bg-white/10 focus:outline-none"
      />
      <button
        type="submit"
        className="from-accent-gradient-from to-accent-gradient-to rounded-r-full bg-gradient-to-br px-7 py-3 text-[0.8125rem] font-semibold tracking-[0.15em] whitespace-nowrap text-white uppercase shadow-[0_4px_15px_rgba(225,6,0,0.2)] transition-shadow duration-300 hover:shadow-[0_8px_25px_rgba(225,6,0,0.4)]"
      >
        Join
      </button>
    </form>
  );
}
