import { randomUUID } from "node:crypto";
import { db, rolesTable } from "@workspace/db";
import { SYSTEM_ROLE_DEFAULTS, setRoleCache } from "./rbac";
import { logger } from "./logger";

export async function refreshRolesCache(): Promise<void> {
  const rows = await db.select().from(rolesTable);
  setRoleCache(rows.map((r) => ({ key: r.key, permissions: r.permissions })));
}

export async function seedSystemRoles(): Promise<void> {
  const existing = await db.select().from(rolesTable);
  const existingKeys = new Set(existing.map((r) => r.key));
  for (const def of SYSTEM_ROLE_DEFAULTS) {
    if (existingKeys.has(def.key)) continue;
    await db.insert(rolesTable).values({
      id: randomUUID(),
      key: def.key,
      nameAr: def.nameAr,
      permissions: def.permissions,
      isSystem: true,
    });
  }
}

export async function ensureRolesReady(): Promise<void> {
  try {
    await seedSystemRoles();
    await refreshRolesCache();
  } catch (err) {
    logger.error({ err }, "Failed to initialize roles; using system defaults");
  }
}
