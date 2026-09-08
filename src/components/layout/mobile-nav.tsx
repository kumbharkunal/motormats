'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { ArrowRight, LayoutDashboard, LogIn, LogOut, Menu, Package, User, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { NAV_LINKS } from '@/components/layout/nav-links';
import { Button } from '@/components/ui/button';

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
}: {
  isSignedIn?: boolean;
  isAdmin?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const accountLinks = isSignedIn
    ? [...ACCOUNT_LINKS, ...(isAdmin ? [ADMIN_LINK] : []), SIGN_OUT_LINK]
    : GUEST_LINKS;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className="nav-pill text-foreground flex size-12 items-center justify-center rounded-full transition-colors duration-200 active:scale-95 lg:hidden"
        >
          <Menu aria-hidden size={20} strokeWidth={1.5} />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm data-[state=open]:animate-[overlay-in_250ms_ease-out] data-[state=closed]:animate-[overlay-out_200ms_ease-in]" />
        <Dialog.Content className="bg-surface border-border fixed inset-y-0 left-0 z-[101] flex w-[86vw] max-w-sm flex-col border-r data-[state=open]:animate-[drawer-in_280ms_cubic-bezier(0.25,1,0.5,1)] data-[state=closed]:animate-[drawer-out_220ms_ease-in]">
          <VisuallyHidden>
            <Dialog.Title>Navigation menu</Dialog.Title>
          </VisuallyHidden>

          <div className="border-border flex h-16 items-center justify-end border-b px-4">
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close menu"
                className="text-muted-foreground hover:text-foreground flex size-11 items-center justify-center rounded-xl transition-colors duration-200 active:scale-95"
              >
                <X aria-hidden size={20} strokeWidth={1.5} />
              </button>
            </Dialog.Close>
          </div>

          <nav className="flex-1 overflow-y-auto overscroll-contain px-4 py-6">
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-foreground/80 hover:text-foreground group flex min-h-11 items-center justify-between rounded-xl px-4 py-3 text-base transition-colors duration-200 hover:bg-white/5"
                  >
                    {link.label}
                    <ArrowRight
                      aria-hidden
                      size={16}
                      className="text-muted-foreground group-hover:text-accent-text transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </Link>
                </li>
              ))}
            </ul>

            <ul className="border-border mt-4 flex flex-col gap-1 border-t pt-4">
              {accountLinks.map(({ label, href, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className="text-foreground/80 hover:text-foreground flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-base transition-colors duration-200 hover:bg-white/5"
                  >
                    <Icon aria-hidden size={17} className="text-muted-foreground shrink-0" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-border border-t p-4">
            <Button asChild size="lg" className="w-full">
              <Link href="/collections" onClick={() => setOpen(false)}>
                Shop now
              </Link>
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
