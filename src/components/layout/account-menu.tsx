'use client';

import { ChevronDown, LayoutDashboard, LogOut, Package, User } from 'lucide-react';
import Link from 'next/link';
import { Fragment, useEffect, useId, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

const BASE_ITEMS = [
  { label: 'My account', href: '/account', icon: User },
  { label: 'My orders', href: '/account/orders', icon: Package },
] as const;

const ADMIN_ITEM = { label: 'Admin panel', href: '/admin', icon: LayoutDashboard } as const;
const SIGN_OUT_ITEM = { label: 'Sign out', href: '/sign-out', icon: LogOut, danger: true } as const;

/**
 * Signed-in account menu.
 *
 * Hand-rolled rather than pulling in `@radix-ui/react-dropdown-menu` for one
 * menu of three links. What Radix would buy us here — dismiss on outside click
 * and Escape, focus returning to the trigger, and the right ARIA wiring — is
 * small enough to own, and the links are natively tabbable.
 *
 * "Sign out" is a link to the confirmation page, not the action itself: ending
 * a session is a state change and happens on POST there, so no prefetch or link
 * preview can log anyone out.
 */
export function AccountMenu({ name, isAdmin = false }: { name: string | null; isAdmin?: boolean }) {
  const [open, setOpen] = useState(false);
  const items = [...BASE_ITEMS, ...(isAdmin ? [ADMIN_ITEM] : []), SIGN_OUT_ITEM];
  const menuId = useId();
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      setOpen(false);
      // Escape should leave focus where the reader expects it, on the trigger.
      trigger.current?.focus();
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const label = name?.trim().split(/\s+/)[0] ?? 'Account';

  return (
    <div ref={container} className="relative">
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        // No capsule. The band is one opaque paper ground now, so the trigger
        // sits on it directly like the cart icon beside it — which is also what
        // retired `nav-pill`, whose whole job was faking glass over the hero.
        className="flex h-11 items-center gap-2 px-1 text-muted-foreground transition-colors duration-200 hover:text-foreground active:scale-95"
      >
        <span className="flex size-8 items-center justify-center bg-accent/12 text-accent-text">
          <User aria-hidden size={16} strokeWidth={1.8} />
        </span>
        <span className="hidden max-w-24 truncate text-sm font-medium xl:block">{label}</span>
        <ChevronDown
          aria-hidden
          size={15}
          className={cn('transition-motion duration-200', open && 'rotate-180')}
        />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Account"
          className="absolute top-[calc(100%+0.5rem)] right-0 z-50 w-52 overflow-hidden rounded-2xl card-surface p-1.5"
        >
          {name ? (
            <p className="mb-1 truncate border-b border-border px-3 pt-2 pb-3 text-xs text-muted-foreground">
              Signed in as <span className="font-medium text-foreground">{name}</span>
            </p>
          ) : null}

          {items.map(({ label: itemLabel, href, icon: Icon, ...item }) => {
            const danger = 'danger' in item && item.danger;

            return (
              <Fragment key={href}>
                {/* The rule is its own element. As a `border-t` + `pt-3` on the
                    row itself, the padding pushed the label below the row's
                    centre line. */}
                {danger ? <div aria-hidden className="my-1.5 border-t border-border" /> : null}

                <Link
                  href={href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition-colors duration-200',
                    danger
                      ? // accent-text, which on this light ground resolves to the brand
                        // red itself at 4.97:1 — safe for 14px body copy.
                        'font-medium text-accent-text hover:bg-accent/10'
                      : 'text-foreground/80 hover:bg-surface-hover hover:text-foreground',
                  )}
                >
                  <Icon
                    aria-hidden
                    size={16}
                    className={cn(
                      'shrink-0',
                      danger ? 'text-accent-text' : 'text-muted-foreground',
                    )}
                  />
                  {itemLabel}
                </Link>
              </Fragment>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
