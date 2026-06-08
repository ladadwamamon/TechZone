import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";
import { db, rolesTable, adminAccountsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { AdminCreateRoleBody, AdminUpdateRoleBody } from "@workspace/api-zod";
import { requireAuth, requirePermission } from "../../middlewares/auth";
import { writeAudit } from "../../lib/audit";
import { ALL_PERMISSIONS } from "../../lib/rbac";
import { refreshRolesCache } from "../../lib/roles";
import type { Role } from "@workspace/db";

const router: IRouter = Router();

function toPublic(r: Role) {
  return {
    id: r.id,
    key: r.key,
    nameAr: r.nameAr,
    permissions: r.permissions,
    isSystem: r.isSystem,
    createdAt: r.createdAt.toISOString(),
  };
}

function sanitizePermissions(perms: string[]): string[] {
  const allowed = new Set<string>(ALL_PERMISSIONS as string[]);
  return Array.from(new Set(perms.filter((p) => allowed.has(p))));
}

router.get("/admin/roles", requireAuth, requirePermission("admins:manage"), async (_req, res) => {
  const rows = await db.select().from(rolesTable);
  rows.sort((a, b) => {
    if (a.isSystem !== b.isSystem) return a.isSystem ? -1 : 1;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });
  res.json(rows.map(toPublic));
});

router.post("/admin/roles", requireAuth, requirePermission("admins:manage"), async (req, res) => {
  const parsed = AdminCreateRoleBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة", details: parsed.error.issues });

  const key = parsed.data.key.trim().toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "");
  if (key.length < 2) return res.status(400).json({ error: "معرّف الدور غير صالح" });

  const dupe = await db.query.rolesTable.findFirst({ where: eq(rolesTable.key, key) });
  if (dupe) return res.status(409).json({ error: "معرّف الدور مستخدم مسبقاً" });

  const id = randomUUID();
  const [created] = await db.insert(rolesTable).values({
    id,
    key,
    nameAr: parsed.data.nameAr,
    permissions: sanitizePermissions(parsed.data.permissions),
    isSystem: false,
  }).returning();
  await refreshRolesCache();
  await writeAudit(req, { action: "create", entityType: "role", entityId: id, details: { key } });
  res.status(201).json(toPublic(created));
});

router.put("/admin/roles/:id", requireAuth, requirePermission("admins:manage"), async (req, res) => {
  const parsed = AdminUpdateRoleBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة", details: parsed.error.issues });

  const existing = await db.query.rolesTable.findFirst({ where: eq(rolesTable.id, req.params.id as string) });
  if (!existing) return res.status(404).json({ error: "غير موجود" });

  const values: Record<string, unknown> = {};
  if (parsed.data.nameAr !== undefined) values.nameAr = parsed.data.nameAr;
  if (parsed.data.permissions !== undefined) {
    // super_admin must always retain all permissions
    values.permissions = existing.key === "super_admin"
      ? [...ALL_PERMISSIONS]
      : sanitizePermissions(parsed.data.permissions);
  }

  const [updated] = await db.update(rolesTable).set(values).where(eq(rolesTable.id, req.params.id as string)).returning();
  await refreshRolesCache();
  await writeAudit(req, { action: "update", entityType: "role", entityId: req.params.id as string });
  res.json(toPublic(updated));
});

router.delete("/admin/roles/:id", requireAuth, requirePermission("admins:manage"), async (req, res) => {
  const existing = await db.query.rolesTable.findFirst({ where: eq(rolesTable.id, req.params.id as string) });
  if (!existing) return res.status(404).json({ error: "غير موجود" });
  if (existing.isSystem) return res.status(409).json({ error: "لا يمكن حذف دور النظام" });

  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(adminAccountsTable)
    .where(eq(adminAccountsTable.role, existing.key));
  if (Number(count) > 0) {
    return res.status(409).json({ error: "لا يمكن حذف دور مستخدم من قبل حسابات" });
  }

  await db.delete(rolesTable).where(eq(rolesTable.id, req.params.id as string));
  await refreshRolesCache();
  await writeAudit(req, { action: "delete", entityType: "role", entityId: req.params.id as string, details: { key: existing.key } });
  res.json({ success: true, message: "تم الحذف" });
});

export default router;
