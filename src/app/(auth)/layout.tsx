import Link from 'next/link';
import type { ReactNode } from 'react';

import { MotormatsLogo } from '@/components/layout/motormats-logo';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-5 py-12">
      <Link href="/" aria-label="Motormats home" className="mb-8">
        <MotormatsLogo size="lg" priority />
      </Link>
      <main id="main" className="w-full max-w-md">
        {children}
      </main>
    </div>
  );
}
