import { sql } from 'drizzle-orm';

import { db } from '@db/client';

/**
 * Liveness probe, also used as a keep-warm target by the scheduled ping on
 * hosts that stop an idle process.
 *
 * Never cached, and never reports anything about the failure beyond a status —
 * a health endpoint is public.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await db.execute(sql`SELECT 1`);
    return Response.json({ status: 'ok' });
  } catch {
    return Response.json({ status: 'degraded' }, { status: 503 });
  }
}
