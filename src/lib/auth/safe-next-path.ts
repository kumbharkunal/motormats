/**
 * Resolves a `?next=` parameter to a destination that cannot leave this origin.
 *
 * Only same-site absolute paths are honoured: a leading single slash, never a
 * second one, so `//evil.com` and `https://evil.com` both fall back. `prefix`
 * narrows it further — the admin sign-in uses `/admin/` so a login there can
 * never bounce out into the storefront.
 */
export function safeNextPath(
  next: string | undefined,
  fallback: string,
  prefix = '/',
): string {
  if (!next) return fallback;
  if (!/^\/(?!\/)/.test(next)) return fallback;
  if (next.includes('..')) return fallback;
  return next.startsWith(prefix) ? next : fallback;
}
