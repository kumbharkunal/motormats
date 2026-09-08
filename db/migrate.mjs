/**
 * Migration runner.
 *
 * Used instead of `drizzle-kit migrate` because that command does not close its
 * connection reliably on Windows, and MySQL DDL is not transactional — an
 * interrupted run leaves the schema half-applied. This owns the connection
 * lifecycle and exits with a real status code, which is also what a deploy
 * pipeline needs.
 */
import { config as loadEnv } from 'dotenv';
import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import mysql from 'mysql2/promise';

const isProduction = process.env.NODE_ENV === 'production';
loadEnv({ path: isProduction ? '.env.production' : '.env.development', quiet: true });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

// Mirrors the normalisation in src/lib/env.server.ts: the CA is accepted either
// as a PEM block or as the base64 of one.
const rawCa = process.env.DATABASE_SSL_CA;
const ca =
  !rawCa || rawCa.includes('-----BEGIN')
    ? rawCa
    : Buffer.from(rawCa, 'base64').toString('utf8');

const connection = await mysql.createConnection({
  uri: url,
  multipleStatements: false,
  ...(ca ? { ssl: { ca } } : {}),
});

try {
  await migrate(drizzle(connection), { migrationsFolder: './db/migrations' });
  console.log('Migrations applied.');
} catch (error) {
  console.error('Migration failed:', error);
  process.exitCode = 1;
} finally {
  await connection.end();
}
