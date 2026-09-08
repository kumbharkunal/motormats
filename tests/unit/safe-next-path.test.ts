import { describe, expect, it } from 'vitest';

import { safeNextPath } from '@/lib/auth/safe-next-path';

/**
 * This helper is the only thing between a `?next=` parameter and an open
 * redirect, so the hostile inputs are tested explicitly.
 */
describe('safeNextPath', () => {
  it('falls back when no destination is supplied', () => {
    expect(safeNextPath(undefined, '/collections')).toBe('/collections');
    expect(safeNextPath('', '/collections')).toBe('/collections');
  });

  it('honours a same-site absolute path', () => {
    expect(safeNextPath('/checkout', '/collections')).toBe('/checkout');
    expect(safeNextPath('/orders/abc?tab=1', '/collections')).toBe('/orders/abc?tab=1');
  });

  it.each([
    ['//evil.com', 'protocol-relative'],
    ['https://evil.com', 'absolute URL'],
    ['http://evil.com', 'absolute URL'],
    ['evil.com', 'bare host'],
    ['../../etc/passwd', 'traversal'],
    ['/../../escape', 'traversal behind a slash'],
  ])('refuses %s (%s)', (candidate) => {
    expect(safeNextPath(candidate, '/collections')).toBe('/collections');
  });

  it('confines the admin sign-in to /admin paths', () => {
    expect(safeNextPath('/admin/orders', '/admin/dashboard', '/admin/')).toBe('/admin/orders');
    // Same-site, but signing in to the admin panel must not land on the storefront.
    expect(safeNextPath('/checkout', '/admin/dashboard', '/admin/')).toBe('/admin/dashboard');
  });
});
