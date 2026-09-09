/**
 * One-off maintenance on a hand-made admin account.
 *
 *   node scripts/fix-legacy-admin-account.ts admin@motormats.in            # dry run
 *   node scripts/fix-legacy-admin-account.ts admin@motormats.in --apply    # rename only
 *   node scripts/fix-legacy-admin-account.ts admin@motormats.in --apply --demote
 *
 * Takes an email or an E.164 phone: the admin account signs in with email and
 * password, so its row carries no phone number.
 *
 * Why this exists rather than a code change: the account menu is already
 * correct. `SiteHeader` asks `isAdminRole(user.role)` and `AccountMenu` renders
 * whatever `name` the row holds — "Administrator" really was the stored name,
 * and the admin role really is on the row. `db/seed.ts` creates no users, so
 * this account was made by hand.
 *
 * The rename and the demotion are separate on purpose: `--demote` revokes admin
 * access and locks the account out of `/admin`, which is not something to do by
 * accident while the panel is in use.
 *
 * Opens its own connection the way `db/seed.ts` does rather than importing
 * `@db/client`, which is `server-only` and throws outside a request.
 *
 * DANGER: development and production share one Aiven MySQL instance, so this
 * writes to the database the live site reads from. It changes nothing without
 * an explicit `--apply`.
 */
import { config as loadEnv } from 'dotenv';
import { eq, or } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

import { users } from '../db/schema/identity.ts';

loadEnv({ path: '.env.development', quiet: true });

const url = process.env.DATABASE_URL;
if (!url) {
  process.stderr.write('DATABASE_URL is not set.\n');
  process.exit(1);
}

const rawCa = process.env.DATABASE_SSL_CA;
const ca =
  !rawCa || rawCa.includes('-----BEGIN') ? rawCa : Buffer.from(rawCa, 'base64').toString('utf8');

const connection = await mysql.createConnection({
  uri: url,
  ...(ca ? { ssl: { ca } } : {}),
});
const db = drizzle(connection, { casing: 'snake_case' });

const NEW_NAME = 'Admin';

async function run(): Promise<void> {
  const [identifier, ...flags] = process.argv.slice(2);
  const apply = flags.includes('--apply');
  const demote = flags.includes('--demote');

  if (!identifier) {
    throw new Error(
      'Usage: fix-legacy-admin-account.ts <email or E.164 phone> [--apply] [--demote]',
    );
  }

  const [user] = await db
    .select({
      publicId: users.publicId,
      name: users.name,
      phone: users.phone,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(or(eq(users.email, identifier), eq(users.phone, identifier)))
    .limit(1);

  if (!user) {
    process.stdout.write(`No user matching ${identifier}. Nothing to do.\n`);
    return;
  }

  process.stdout.write(
    `Found ${user.publicId}\n` +
      `  email: ${user.email ?? '(none)'}\n` +
      `  phone: ${user.phone ?? '(none)'}\n` +
      `  name:  ${user.name ?? '(none)'}\n` +
      `  role:  ${user.role}\n\n`,
  );

  const changes: { name?: string; role?: 'customer' } = {};
  if (user.name !== NEW_NAME) changes.name = NEW_NAME;
  if (demote && user.role !== 'customer') changes.role = 'customer';

  if (Object.keys(changes).length === 0) {
    process.stdout.write('Already in the desired state. Nothing to do.\n');
    return;
  }

  for (const [field, value] of Object.entries(changes)) {
    process.stdout.write(`Would set ${field} -> "${value}"\n`);
  }
  if (!demote && user.role !== 'customer') {
    process.stdout.write('Leaving the admin role in place. Pass --demote to revoke it.\n');
  }

  if (!apply) {
    process.stdout.write('\nDry run. Re-run with --apply to write it.\n');
    return;
  }

  await db.update(users).set(changes).where(eq(users.publicId, user.publicId));
  process.stdout.write('\nApplied.\n');
}

try {
  await run();
} catch (error) {
  process.stderr.write(`Failed: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
} finally {
  await connection.end();
}
