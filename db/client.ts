import 'server-only';

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

import { serverEnv } from '@/lib/env.server';

import * as schema from './schema/index.ts';

/**
 * Cached on globalThis in every environment.
 *
 * In development that stops HMR opening a new pool per reload. In production it
 * matters more: Next builds several server bundles, so this module can be
 * evaluated more than once in a single process, and on a serverless host every
 * warm instance would otherwise stack another pool against a connection cap
 * that is shared account-wide.
 */
const globalForDb = globalThis as unknown as {
  motormatsPool?: mysql.Pool;
};

function createPool(): mysql.Pool {
  const ca = serverEnv.DATABASE_SSL_CA;

  return mysql.createPool({
    uri: serverEnv.DATABASE_URL,
    connectionLimit: serverEnv.DATABASE_POOL_SIZE,
    // Queue rather than throw when the pool is saturated: a slow request beats
    // a failed checkout.
    waitForConnections: true,
    queueLimit: 0,
    enableKeepAlive: true,
    ...(ca ? { ssl: { ca } } : {}),
    timezone: 'Z',
    supportBigNumbers: true,
    bigNumberStrings: false,
    dateStrings: false,
  });
}

export const pool = globalForDb.motormatsPool ?? createPool();
globalForDb.motormatsPool = pool;

export const db = drizzle(pool, { schema, mode: 'default', casing: 'snake_case' });

export type Database = typeof db;
export { schema };
