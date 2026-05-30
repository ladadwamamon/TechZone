import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";
import { db } from "@workspace/db";
import { adminAccountsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { AdminCreateAccountBody, AdminUpdateAccountBody } from "@workspace/api-zod";
import { requireAuth, requirePermission } from "../../middlewares/auth";
import { hashPassword } from "../../lib/password";
import { destroyAllSessionsForAdmin } from "../../lib/session";
import { writeAudit } from "../../lib/audit";
import type { AdminAccount } from "@workspace/db";

const router: IRouter = Router();

function toPublic(a: AdminAccount) {
  return {
    id: a.id,
    username: a.username,
    fullName: a.fullName,
    email: a.email ?? null,
    role: a.role,
    isActive: a.isActive,
    lastLoginAt: a.lastLoginAt ? a.lastLoginAt.toISOString() : null,
    createdAt: a.createdAt.toISOString(),
  };
}

router.get("/admin/accounts", requireAuth, requirePermission("admins:manage"), async (_req, res) => {
  const rows = await db.select().from(adminAccountsTable).orderBy(desc(adminAccountsTable.createdAt));
  res.json(rows.map(toPublic));
});

router.post("/admin/accounts", requireAuth, requirePermission("admins:manage"), async (req, res) => {
  const parsed = AdminCreateAccountBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة", details: parsed.error.issues });
  const data = parsed.data;

  const dupe = await db.query.adminAccountsTable.findFirst({ where: eq(adminAccountsTable.username, data.username) });
  if (dupe) return res.status(409).json({ error: "اسم المستخدم مستخدم مسبقاً" });

  const id = randomUUID();
  const passwordHash = await hashPassword(data.password);
  const [created] = await db.insert(adminAccountsTable).values({
    id,
    username: data.username,
    fullName: data.fullName,
    email: data.email ?? null,
    passwordHash,
    role: data.role,
    isActive: data.isActive ?? true,
  }).returning();
  await writeAudit(req, { action: "create", entityType: "admin_account", entityId: id, details: { username: data.username, role: data.role } });
  res.status(201).json(toPublic(created));
});

router.put("/admin/accounts/:id", requireAuth, requirePermission("admins:manage"), async (req, res) => {
  const parsed = AdminUpdateAccountBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة", details: parsed.error.issues });
  const existing = await db.query.adminAccountsTable.findFirst({ where: eq(adminAccountsTable.id, (req.params.id as string)) });
  if (!existing) return res.status(404).json({ error: "غير موجود" });

  // Prevent demoting/deactivating the last active super-admin
  const isLosingSuperAdmin =
    existing.role === "super_admin" &&
    ((parsed.data.role !== undefined && parsed.data.role !== "super_admin") || parsed.data.isActive === false);
  if (isLosingSuperAdmin) {
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(adminAccountsTable)
      .where(eq(adminAccountsTable.role, "super_admin"));
    if (Number(count) <= 1) {
      return res.status(409).json({ error: "لا يمكن إزالة آخر حساب مدير عام" });
    }
  }

  const values: Record<string, unknown> = {};
  if (parsed.data.fullName !== undefined) values.fullName = parsed.data.fullName;
  if (parsed.data.email !== undefined) values.email = parsed.data.email;
  if (parsed.data.role !== undefined) values.role = parsed.data.role;
  if (parsed.data.isActive !== undefined) values.isActive = parsed.data.isActive;
  if (parsed.data.password !== undefined) values.passwordHash = await hashPassword(parsed.data.password);

  const [updated] = await db.update(adminAccountsTable).set(values).where(eq(adminAccountsTable.id, (req.params.id as string))).returning();

  // Invalidate sessions when password changes or account is deactivated
  if (parsed.data.password !== undefined || parsed.data.isActive === false) {
    await destroyAllSessionsForAdmin((req.params.id as string));
  }
  await writeAudit(req, { action: "update", entityType: "admin_account", entityId: (req.params.id as string) });
  res.json(toPublic(updated));
});

router.delete("/admin/accounts/:id", requireAuth, requirePermission("admins:manage"), async (req, res) => {
  const existing = await db.query.adminAccountsTable.findFirst({ where: eq(adminAccountsTable.id, (req.params.id as string)) });
  if (!existing) return res.status(404).json({ error: "غير موجود" });
  if (req.admin!.id === (req.params.id as string)) {
    return res.status(409).json({ error: "لا يمكنك حذف حسابك الخاص" });
  }
  if (existing.role === "super_admin") {
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(adminAccountsTable)
      .where(eq(adminAccountsTable.role, "super_admin"));
    if (Number(count) <= 1) {
      return res.status(409).json({ error: "لا يمكن حذف آخر حساب مدير عام" });
    }
  }
  await db.delete(adminAccountsTable).where(eq(adminAccountsTable.id, (req.params.id as string)));
  await writeAudit(req, { action: "delete", entityType: "admin_account", entityId: (req.params.id as string), details: { username: existing.username } });
  res.json({ success: true, message: "تم الحذف" });
});

export default router;
