import type { AdminRole } from "@workspace/db";

export type Permission =
  | "products:write"
  | "categories:write"
  | "brands:write"
  | "reviews:write"
  | "blog:write"
  | "media:write"
  | "settings:write"
  | "orders:write"
  | "newsletter:read"
  | "newsletter:write"
  | "analytics:read"
  | "admins:manage"
  | "audit:read";

const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  super_admin: [
    "products:write",
    "categories:write",
    "brands:write",
    "reviews:write",
    "blog:write",
    "media:write",
    "settings:write",
    "orders:write",
    "newsletter:read",
    "newsletter:write",
    "analytics:read",
    "admins:manage",
    "audit:read",
  ],
  content_editor: [
    "products:write",
    "categories:write",
    "brands:write",
    "reviews:write",
    "blog:write",
    "media:write",
    "settings:write",
    "analytics:read",
  ],
  order_manager: [
    "orders:write",
    "newsletter:read",
    "newsletter:write",
    "analytics:read",
  ],
};

export function hasPermission(role: string, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role as AdminRole];
  if (!perms) return false;
  return perms.includes(permission);
}

export function permissionsForRole(role: string): Permission[] {
  return ROLE_PERMISSIONS[role as AdminRole] ?? [];
}
