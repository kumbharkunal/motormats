import Link from 'next/link';

import { Button } from '@/components/ui/button';

export function SignOutConfirm({ action, name }: { action: () => Promise<void>; name: string }) {
  return (
    <div className="card-surface rounded-3xl p-8 text-center">
      <h1 className="text-h2">Sign out?</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        You are signed in as {name}. Your cart stays on this device.
      </p>

      <form action={action} className="mt-6">
        <Button type="submit" size="lg" className="w-full">
          Sign out
        </Button>
      </form>

      <Button asChild variant="ghost" className="mt-3 w-full">
        <Link href="/">Stay signed in</Link>
      </Button>
    </div>
  );
}
