'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { ArrowRight, LayoutDashboard, LogIn, LogOut, Menu, Package, User, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { MotormatsLogo } from '@/components/layout/motormats-logo';
import { NAV_LINKS } from '@/components/layout/nav-links';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ACCOUNT_LINKS = [
  { label: 'My account', href: '/account', icon: User },
  { label: 'My orders', href: '/account/orders', icon: Package },
] as const;

const ADMIN_LINK = { label: 'Admin panel', href: '/admin', icon: LayoutDashboard } as const;
const SIGN_OUT_LINK = { label: 'Sign out', href: '/sign-out', icon: LogOut } as const;
const GUEST_LINKS = [{ label: 'Sign in', href: '/sign-in', icon: LogIn }] as const;

export function MobileNav({
  isSignedIn = false,
  isAdmin = false,
  userName = null,
}: {
  isSignedIn?: boolean;
  isAdmin?: boolean;
  userName?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const accountLinks = isSignedIn
    ? [...ACCOUNT_LINKS, ...(isAdmin ? [ADMIN_LINK] : [])]
    : GUEST_LINKS;

  // "/" would prefix-match every route, so it has to be an exact comparison.
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  const close = () => setOpen(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className="flex size-12 items-center justify-center rounded-full nav-pill text-foreground transition-colors duration-200 group-data-[over-hero=true]/header:text-white active:scale-95 lg:hidden"
        >
          <Menu aria-hidden size={20} strokeWidth={1.5} />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        {/* Ink rather than black, and far lighter than the dark theme's 70%:
            the drawer now reads as a white panel lifted off the page, so the
            scrim only has to push the page back, not black it out. */}
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-foreground/40 backdrop-blur-sm data-[state=closed]:animate-[overlay-out_200ms_ease-in] data-[state=open]:animate-[overlay-in_250ms_ease-out]" />

        <Dialog.Content className="fixed inset-y-0 left-0 z-[101] flex w-[86vw] max-w-sm flex-col border-r border-border bg-surface data-[state=closed]:animate-[drawer-out_220ms_ease-in] data-[state=open]:animate-[drawer-in_280ms_cubic-bezier(0.25,1,0.5,1)]">
          <VisuallyHidden>
            <Dialog.Title>Navigation menu</Dialog.Title>
          </VisuallyHidden>

          {/* A red hairline along the top edge, echoing the footer rule. */}
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent"
          />

          <div className="flex h-[4.5rem] shrink-0 items-center justify-between border-b border-border px-5">
            <Link href="/" onClick={close} aria-label="Motormats home">
              <MotormatsLogo size="sm" className="h-8" />
            </Link>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close menu"
                className="flex size-11 items-center justify-center rounded-xl text-muted-foreground transition-colors duration-200 hover:bg-surface-hover hover:text-foreground active:scale-95"
              >
                <X aria-hidden size={20} strokeWidth={1.5} />
              </button>
            </Dialog.Close>
          </div>

          <nav className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">
            {isSignedIn ? (
              <Link
                href="/account"
                onClick={close}
                className="mb-5 flex min-h-14 items-center gap-3 rounded-2xl card-surface px-4 py-3"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent-text">
                  <User aria-hidden size={18} strokeWidth={1.8} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.6875rem] tracking-[0.12em] text-muted-foreground uppercase">
                    Signed in
                  </span>
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {userName ?? 'Your account'}
                  </span>
                </span>
              </Link>
            ) : null}

            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((link, index) => {
                const active = isActive(link.href);

                return (
                  <li
                    key={link.href}
                    // `both` so the row holds its start state through the delay.
                    // fade-up ends opaque, so the reduced-motion reset in
                    // globals.css lands it visible rather than hidden.
                    className="animate-[fade-up_380ms_var(--ease-quart)_both] motion-reduce:animate-none"
                    style={{ animationDelay: `${60 + index * 45}ms` }}
                  >
                    <Link
                      href={link.href}
                      onClick={close}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'group relative flex min-h-12 items-center justify-between rounded-xl py-3 pr-4 pl-5 text-lg transition-colors duration-200',
                        active
                          ? 'bg-accent/8 font-semibold text-foreground'
                          : 'text-foreground/75 hover:bg-surface-hover hover:text-foreground',
                      )}
                    >
                      {/* The rail marks the current route, so it is not carried by colour alone. */}
                      <span
                        aria-hidden
                        className={cn(
                          'absolute top-1/2 left-0 h-6 w-[3px] -translate-y-1/2 rounded-full bg-accent transition-motion duration-200',
                          active ? 'scale-y-100' : 'scale-y-0',
                        )}
                      />
                      {link.label}
                      <ArrowRight
                        aria-hidden
                        size={16}
                        className="text-muted-foreground transition-motion duration-200 group-hover:translate-x-1 group-hover:text-accent-text"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>

            <ul className="mt-5 flex flex-col gap-1 border-t border-border pt-5">
              {accountLinks.map(({ label, href, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={close}
                    className="flex min-h-11 items-center gap-3 rounded-xl px-4 py-2.5 text-[0.9375rem] text-foreground/75 transition-colors duration-200 hover:bg-surface-hover hover:text-foreground"
                  >
                    <Icon aria-hidden size={17} className="shrink-0 text-muted-foreground" />
                    {label}
                  </Link>
                </li>
              ))}

              {isSignedIn ? (
                <li>
                  {/* accent-text: the AA-safe red for body copy on this ground. */}
                  <Link
                    href={SIGN_OUT_LINK.href}
                    onClick={close}
                    className="flex min-h-11 items-center gap-3 rounded-xl px-4 py-2.5 text-[0.9375rem] font-medium text-accent-text transition-colors duration-200 hover:bg-accent/10"
                  >
                    <LogOut aria-hidden size={17} className="shrink-0" />
                    {SIGN_OUT_LINK.label}
                  </Link>
                </li>
              ) : null}
            </ul>
          </nav>

          <div className="border-t border-border p-5">
            <Button asChild size="lg" className="w-full">
              <Link href="/collections" onClick={close}>
                Shop now
              </Link>
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
