import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { SignOutSubmit } from '@/features/auth/components/sign-out-submit';

export function SignOutConfirm({ action, name }: { action: () => Promise<void>; name: string }) {
  return (
    <div className="rounded-3xl card-surface p-8 text-center">
      <h1 className="text-h2">Sign out?</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        You are signed in as {name}. Your cart stays on this device.
      </p>

      <form action={action} className="mt-6">
        <SignOutSubmit />
      </form>

      <Button asChild variant="ghost" className="mt-3 w-full">
        <Link href="/">Stay signed in</Link>
      </Button>
    </div>
  );
}
