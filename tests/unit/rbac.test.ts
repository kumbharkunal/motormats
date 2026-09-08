import { describe, expect, it } from 'vitest';

import { USER_ROLES } from '@db/schema/identity';
import {
  can,
  isAdminRole,
  isElevatedPermission,
  PERMISSIONS,
  ROLE_PERMISSIONS,
} from '@/lib/auth/rbac';

describe('rbac', () => {
  it('defines permissions for exactly the known roles', () => {
    expect(Object.keys(ROLE_PERMISSIONS).sort()).toEqual([...USER_ROLES].sort());
  });

  it('grants no permission outside the declared set', () => {
    for (const role of USER_ROLES) {
      for (const permission of ROLE_PERMISSIONS[role]) {
        expect(PERMISSIONS).toContain(permission);
      }
    }
  });

  it('keeps customers out of the admin panel and other people\u2019s orders', () => {
    expect(can('customer', 'admin:access')).toBe(false);
    expect(can('customer', 'order:read:any')).toBe(false);
    expect(can('customer', 'product:write')).toBe(false);
    expect(can('customer', 'user:read')).toBe(false);
    expect(isAdminRole('customer')).toBe(false);
  });

  it('lets customers read the catalogue and their own orders', () => {
    expect(can('customer', 'product:read')).toBe(true);
    expect(can('customer', 'order:read:own')).toBe(true);
  });

  it('withholds role assignment and settings from a plain admin', () => {
    expect(can('admin', 'admin:access')).toBe(true);
    expect(can('admin', 'product:write')).toBe(true);
    expect(can('admin', 'order:refund')).toBe(true);
    // Privilege escalation must require super_admin.
    expect(can('admin', 'user:assign_role')).toBe(false);
    expect(can('admin', 'user:write')).toBe(false);
    expect(can('admin', 'settings:write')).toBe(false);
  });

  it('gives super_admin a strict superset of admin', () => {
    for (const permission of ROLE_PERMISSIONS.admin) {
      expect(can('super_admin', permission)).toBe(true);
    }
    expect(can('super_admin', 'user:assign_role')).toBe(true);
  });

  it('gives admin a strict superset of customer', () => {
    for (const permission of ROLE_PERMISSIONS.customer) {
      expect(can('admin', permission)).toBe(true);
    }
  });

  /**
   * Elevated permissions additionally demand an admin sign-in method. If a
   * back-office permission ever slipped into the customer set it would silently
   * lose that second gate, so the split is asserted directly.
   */
  describe('elevation', () => {
    it('treats every non-customer permission as elevated', () => {
      for (const permission of PERMISSIONS) {
        expect(isElevatedPermission(permission)).toBe(
          !ROLE_PERMISSIONS.customer.includes(permission),
        );
      }
    });

    it('does not elevate the permissions customers hold', () => {
      expect(isElevatedPermission('product:read')).toBe(false);
      expect(isElevatedPermission('order:read:own')).toBe(false);
    });

    it('elevates back-office permissions', () => {
      expect(isElevatedPermission('admin:access')).toBe(true);
      expect(isElevatedPermission('product:write')).toBe(true);
      expect(isElevatedPermission('order:refund')).toBe(true);
      expect(isElevatedPermission('user:assign_role')).toBe(true);
    });
  });
});
