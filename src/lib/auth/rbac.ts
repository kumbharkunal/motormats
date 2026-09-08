import type { UserRole } from '@db/schema/identity';

export const PERMISSIONS = [
  'product:read',
  'product:write',
  'product:delete',
  'order:read:own',
  'order:read:any',
  'order:write',
  'order:refund',
  'user:read',
  'user:write',
  'user:assign_role',
  'coupon:read',
  'coupon:write',
  'inventory:write',
  'audit:read',
  'settings:write',
  'admin:access',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const CUSTOMER: readonly Permission[] = ['product:read', 'order:read:own'];

const ADMIN: readonly Permission[] = [
  ...CUSTOMER,
  'admin:access',
  'product:write',
  'product:delete',
  'order:read:any',
  'order:write',
  'order:refund',
  'user:read',
  'coupon:read',
  'coupon:write',
  'inventory:write',
  'audit:read',
];

const SUPER_ADMIN: readonly Permission[] = [...ADMIN, 'user:write', 'user:assign_role', 'settings:write'];

export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  customer: CUSTOMER,
  admin: ADMIN,
  super_admin: SUPER_ADMIN,
};

export function can(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

/** Narrows a role that arrived as plain text, e.g. from a JSON response. */
export function isUserRole(value: string): value is UserRole {
  return Object.hasOwn(ROLE_PERMISSIONS, value);
}

export function isAdminRole(role: UserRole): boolean {
  return can(role, 'admin:access');
}

/**
 * Anything a plain customer cannot do is back-office work. Those permissions
 * additionally require an admin sign-in method, so a session opened by OTP or
 * Google cannot reach them even when the role would allow it.
 */
export function isElevatedPermission(permission: Permission): boolean {
  return !ROLE_PERMISSIONS.customer.includes(permission);
}
