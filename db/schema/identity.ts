import {
  bigint,
  char,
  index,
  int,
  json,
  mysqlTable,
  primaryKey,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';

import { createdAt, dateTime, foreignId, primaryId, publicId, timestamps } from './columns.ts';

export const USER_ROLES = ['customer', 'admin', 'super_admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ['active', 'suspended', 'deleted'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const users = mysqlTable(
  'users',
  {
    id: primaryId().primaryKey(),
    publicId: publicId().notNull(),

    firebaseUid: varchar({ length: 128 }).notNull(),
    phone: varchar({ length: 20 }),
    email: varchar({ length: 320 }),
    name: varchar({ length: 120 }),

    role: varchar({ length: 32 }).$type<UserRole>().notNull().default('customer'),
    status: varchar({ length: 32 }).$type<UserStatus>().notNull().default('active'),

    sessionEpoch: int().notNull().default(0),

    ...timestamps(),
  },
  (t) => [
    uniqueIndex('users_public_id_uq').on(t.publicId),
    uniqueIndex('users_firebase_uid_uq').on(t.firebaseUid),
    uniqueIndex('users_phone_uq').on(t.phone),
    index('users_role_idx').on(t.role),
    index('users_email_idx').on(t.email),
  ],
);

// Only a SHA-256 of the refresh token is stored — a database leak cannot be replayed.
export const sessions = mysqlTable(
  'sessions',
  {
    id: primaryId().primaryKey(),
    userId: foreignId()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    tokenHash: char({ length: 64 }).notNull(),
    familyId: char({ length: 26 }).notNull(),

    // How this session was established. Carried across every rotation so the
    // admin gate can require the password provider for the lifetime of the
    // session; null on rows predating the column, which is treated as untrusted.
    signInProvider: varchar({ length: 32 }),

    userAgentHash: char({ length: 64 }),
    ipHash: char({ length: 64 }),

    expiresAt: dateTime().notNull(),
    revokedAt: dateTime(),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex('sessions_token_hash_uq').on(t.tokenHash),
    index('sessions_user_idx').on(t.userId),
    index('sessions_family_idx').on(t.familyId),
    index('sessions_expires_idx').on(t.expiresAt),
  ],
);

export const auditLogs = mysqlTable(
  'audit_logs',
  {
    id: primaryId().primaryKey(),
    actorUserId: foreignId().references(() => users.id, { onDelete: 'set null' }),
    action: varchar({ length: 64 }).notNull(),
    resourceType: varchar({ length: 64 }).notNull(),
    resourceId: varchar({ length: 64 }),
    metadata: json().$type<Record<string, unknown>>(),
    ipHash: char({ length: 64 }),
    createdAt: createdAt(),
  },
  (t) => [
    index('audit_actor_idx').on(t.actorUserId, t.createdAt),
    index('audit_resource_idx').on(t.resourceType, t.resourceId),
    index('audit_action_idx').on(t.action, t.createdAt),
  ],
);

export const rateLimits = mysqlTable(
  'rate_limits',
  {
    bucketKey: varchar({ length: 191 }).notNull(),
    windowStart: bigint({ mode: 'number', unsigned: true }).notNull(),
    hits: int().notNull().default(0),
    expiresAt: dateTime().notNull(),
  },
  (t) => [
    // Composite PK (not a unique index): Aiven sets sql_require_primary_key=ON.
    primaryKey({ name: 'rate_limits_pk', columns: [t.bucketKey, t.windowStart] }),
    index('rate_limits_expires_idx').on(t.expiresAt),
  ],
);

export const idempotencyKeys = mysqlTable(
  'idempotency_keys',
  {
    id: primaryId().primaryKey(),
    scope: varchar({ length: 64 }).notNull(),
    idempotencyKey: varchar({ length: 191 }).notNull(),
    userId: foreignId().references(() => users.id, { onDelete: 'cascade' }),
    requestHash: char({ length: 64 }).notNull(),
    status: varchar({ length: 16 }).$type<'in_progress' | 'completed'>().notNull(),
    responseSnapshot: json().$type<Record<string, unknown>>(),

    expiresAt: dateTime().notNull(),
    ...timestamps(),
  },
  (t) => [
    uniqueIndex('idempotency_scope_key_uq').on(t.scope, t.idempotencyKey),
    index('idempotency_expires_idx').on(t.expiresAt),
  ],
);

export type UserRow = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type SessionRow = typeof sessions.$inferSelect;
