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
  | "audit:read"
  | "coupons:write"
  | "digital_codes:write"
  | "navigation:write"
  | "pages:write";

export const ALL_PERMISSIONS: Permission[] = [
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
  "coupons:write",
  "digital_codes:write",
  "navigation:write",
  "pages:write",
];

export type SystemRoleDefault = {
  key: string;
  nameAr: string;
  permissions: Permission[];
};

export const SYSTEM_ROLE_DEFAULTS: SystemRoleDefault[] = [
  {
    key: "super_admin",
    nameAr: "مدير عام",
    permissions: [...ALL_PERMISSIONS],
  },
  {
    key: "content_editor",
    nameAr: "محرر محتوى",
    permissions: [
      "products:write",
      "categories:write",
      "brands:write",
      "reviews:write",
      "blog:write",
      "media:write",
      "settings:write",
      "analytics:read",
      "coupons:write",
      "navigation:write",
      "pages:write",
    ],
  },
  {
    key: "order_manager",
    nameAr: "مدير الطلبات",
    permissions: [
      "orders:write",
      "newsletter:read",
      "newsletter:write",
      "analytics:read",
      "digital_codes:write",
    ],
  },
];

export const SYSTEM_ROLE_KEYS: string[] = SYSTEM_ROLE_DEFAULTS.map((r) => r.key);

function defaultPermissions(role: string): Permission[] {
  const def = SYSTEM_ROLE_DEFAULTS.find((r) => r.key === role);
  return def ? [...def.permissions] : [];
}

const roleCache = new Map<string, Permission[]>();

export function setRoleCache(roles: { key: string; permissions: string[] }[]): void {
  roleCache.clear();
  for (const role of roles) {
    const valid = role.permissions.filter((p): p is Permission =>
      (ALL_PERMISSIONS as string[]).includes(p),
    );
    roleCache.set(role.key, valid);
  }
}

export function hasPermission(role: string, permission: Permission): boolean {
  return permissionsForRole(role).includes(permission);
}

export function roleExists(role: string): boolean {
  return roleCache.has(role) || SYSTEM_ROLE_KEYS.includes(role);
}

export function permissionsForRole(role: string): Permission[] {
  const cached = roleCache.get(role);
  if (cached) return cached;
  return defaultPermissions(role);
}
