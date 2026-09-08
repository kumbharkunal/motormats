import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// drizzle-kit runs outside Next, so the env file must be loaded explicitly.
loadEnv({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development' });

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is not set. Copy .env.example to .env.development.');

export default defineConfig({
  schema: './db/schema/index.ts',
  out: './db/migrations',
  dialect: 'mysql',
  dbCredentials: { url },
  casing: 'snake_case',
  verbose: true,
  strict: true,
});
