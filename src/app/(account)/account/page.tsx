import { LogOut, Mail, Package, Phone, User } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth/current-user';

export const metadata: Metadata = {
  title: 'My account',
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in?next=/account');

  return (
    <div className="container-page max-w-3xl py-12 md:py-16">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'My account' }]} />

      <h1 className="text-h1 mt-6">My account</h1>
      <p className="text-muted-foreground mt-3">
        {user.name ? `Signed in as ${user.name}.` : 'You are signed in.'}
      </p>

      <dl className="card-surface mt-8 grid gap-5 rounded-3xl p-6 sm:grid-cols-2">
        <Detail icon={User} label="Name">
          {user.name ?? <span className="text-subtle-foreground">Not provided</span>}
        </Detail>
        <Detail icon={Phone} label="Phone">
          {user.phone ?? <span className="text-subtle-foreground">Not provided</span>}
        </Detail>
        <Detail icon={Mail} label="Email">
          {user.email ?? <span className="text-subtle-foreground">Not provided</span>}
        </Detail>
      </dl>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link
          href="/account/orders"
          className="card-surface hover:border-accent/30 flex items-center gap-4 rounded-2xl p-5 transition-colors duration-300"
        >
          <span className="bg-accent/15 text-accent-text flex size-11 shrink-0 items-center justify-center rounded-full">
            <Package aria-hidden size={18} />
          </span>
          <span>
            <span className="block text-sm font-semibold">My orders</span>
            <span className="text-muted-foreground text-xs">Track and review past purchases</span>
          </span>
        </Link>

        <Link
          href="/sign-out"
          className="card-surface hover:border-accent/30 flex items-center gap-4 rounded-2xl p-5 transition-colors duration-300"
        >
          <span className="text-muted-foreground flex size-11 shrink-0 items-center justify-center rounded-full bg-white/5">
            <LogOut aria-hidden size={18} />
          </span>
          <span>
            <span className="block text-sm font-semibold">Sign out</span>
            <span className="text-muted-foreground text-xs">End this session</span>
          </span>
        </Link>
      </div>

      <Button asChild variant="ghost" className="mt-8">
        <Link href="/collections">Continue shopping</Link>
      </Button>
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof User;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <Icon aria-hidden size={18} className="text-accent-text mt-0.5 shrink-0" />
      <div className="min-w-0">
        <dt className="text-foreground/80 text-xs tracking-[0.12em] uppercase">{label}</dt>
        <dd className="text-muted-foreground mt-1 truncate text-sm">{children}</dd>
      </div>
    </div>
  );
}
