import 'server-only';

import { db } from '@db/client';
import { auditLogs } from '@db/schema/identity';

import { clientAddress } from './api/action';
import { logger } from './logger';

// Never throws — an audit write failure must not roll back the operation it describes.
export async function recordAudit(entry: {
  actorUserId: number | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      actorUserId: entry.actorUserId,
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId ?? null,
      metadata: entry.metadata ?? null,
      ipHash: await clientAddress().catch(() => null),
    });
  } catch (error) {
    logger.error({ err: error, action: entry.action }, 'failed to write audit log');
  }
}
