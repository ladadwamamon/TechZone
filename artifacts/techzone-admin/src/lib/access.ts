export interface RouteAccess {
  path: string;
  perm: string;
}

export const ROUTE_ACCESS: RouteAccess[] = [
  { path: "/", perm: "analytics:read" },
  { path: "/orders", perm: "orders:write" },
  { path: "/products", perm: "products:write" },
  { path: "/categories", perm: "categories:write" },
  { path: "/brands", perm: "brands:write" },
  { path: "/coupons", perm: "coupons:write" },
  { path: "/navigation", perm: "navigation:write" },
  { path: "/pages", perm: "pages:write" },
  { path: "/reviews", perm: "reviews:write" },
  { path: "/blog", perm: "blog:write" },
  { path: "/media", perm: "media:write" },
  { path: "/newsletter", perm: "newsletter:read" },
  { path: "/customers", perm: "orders:write" },
  { path: "/accounts", perm: "admins:manage" },
  { path: "/roles", perm: "admins:manage" },
  { path: "/performance", perm: "analytics:read" },
  { path: "/settings", perm: "settings:write" },
  { path: "/audit", perm: "audit:read" },
];

export function firstAccessiblePath(
  hasPermission: (perm: string) => boolean,
): string | null {
  for (const { path, perm } of ROUTE_ACCESS) {
    if (hasPermission(perm)) return path;
  }
  return null;
}
