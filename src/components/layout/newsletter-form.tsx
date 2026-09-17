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
        className="min-w-0 flex-1 border border-border bg-transparent px-4 py-3.5 text-sm text-foreground transition-colors duration-200 placeholder:text-subtle-foreground focus:border-accent focus:outline-none"
      />
      <button
        type="submit"
        className="caps bg-accent px-6 py-3.5 text-label whitespace-nowrap text-white transition-colors duration-300 hover:bg-accent-hover"
      >
        Join
      </button>
    </form>
  );
}
