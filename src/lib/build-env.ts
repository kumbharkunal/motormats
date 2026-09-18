/* eslint-disable no-restricted-properties -- see below. */

/**
 * Build-time flags.
 *
 * Separate from `env.client` on purpose. `NODE_ENV` is not configuration — it is
 * a constant the bundler inlines and then dead-code-eliminates around — and it
 * has no business travelling with a validated environment schema. Putting it
 * there cost every route that imported it the whole of zod: ~50KB gzip on the
 * homepage, for one boolean.
 *
 * The lint rule this disables exists to stop configuration being read straight
 * out of `process.env`. That is exactly right, and this is the one case it does
 * not describe.
 */
export const isDevelopment = process.env.NODE_ENV === 'development';
