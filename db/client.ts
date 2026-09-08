import 'server-only';

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

import { serverEnv } from '@/lib/env.server';

import * as schema from './schema/index.ts';

// Cached on globalThis so HMR does not open a new pool on every reload.
const globalForDb = globalThis as unknown as {
  motormatsPool?: mysql.Pool;
};

function createPool(): mysql.Pool {
  const ca = serverEnv.DATABASE_SSL_CA;

  return mysql.createPool({
    uri: serverEnv.DATABASE_URL,
    connectionLimit: 8,
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
if (process.env.NODE_ENV !== 'production') globalForDb.motormatsPool = pool;

export const db = drizzle(pool, { schema, mode: 'default', casing: 'snake_case' });

export type Database = typeof db;
export { schema };
