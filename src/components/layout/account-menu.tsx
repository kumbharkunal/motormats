'use client';

import { ChevronDown, LayoutDashboard, LogOut, Package, User } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

const BASE_ITEMS = [
  { label: 'My account', href: '/account', icon: User },
  { label: 'My orders', href: '/account/orders', icon: Package },
] as const;

const ADMIN_ITEM = { label: 'Admin panel', href: '/admin', icon: LayoutDashboard } as const;
const SIGN_OUT_ITEM = { label: 'Sign out', href: '/sign-out', icon: LogOut } as const;

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
        className="nav-pill text-foreground/80 hover:text-foreground flex h-12 items-center gap-2 rounded-full pr-3 pl-2 transition-colors duration-200"
      >
        <span className="bg-accent/15 text-accent-text flex size-8 items-center justify-center rounded-full">
          <User aria-hidden size={16} strokeWidth={1.8} />
        </span>
        <span className="hidden max-w-24 truncate text-sm font-medium xl:block">{label}</span>
        <ChevronDown
          aria-hidden
          size={15}
          className={cn('transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Account"
          className="nav-pill absolute right-0 top-[calc(100%+0.5rem)] z-50 w-52 overflow-hidden rounded-2xl p-1.5"
        >
          {name ? (
            <p className="text-muted-foreground border-border mb-1 truncate border-b px-3 pt-2 pb-3 text-xs">
              Signed in as <span className="text-foreground font-medium">{name}</span>
            </p>
          ) : null}

          {items.map(({ label: itemLabel, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="text-foreground/80 hover:text-foreground flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition-colors duration-200 hover:bg-white/5"
            >
              <Icon aria-hidden size={16} className="text-muted-foreground shrink-0" />
              {itemLabel}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
