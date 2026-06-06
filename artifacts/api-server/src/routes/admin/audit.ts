import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { auditLogTable } from "@workspace/db";
import { desc, and, eq, or, ilike, type SQL } from "drizzle-orm";
import { requireAuth, requirePermission } from "../../middlewares/auth";

const router: IRouter = Router();

router.get("/admin/audit", requireAuth, requirePermission("audit:read"), async (req, res) => {
  const limit = parseInt((req.query.limit as string) ?? "50", 10);
  const q = (req.query.q as string)?.trim();
  const action = (req.query.action as string)?.trim();
  const entityType = (req.query.entityType as string)?.trim();

  const conditions: SQL[] = [];
  if (q) {
    const term = `%${q}%`;
    const search = or(
      ilike(auditLogTable.adminUsername, term),
      ilike(auditLogTable.entityId, term),
      ilike(auditLogTable.entityType, term),
    );
    if (search) conditions.push(search);
  }
  if (action) conditions.push(eq(auditLogTable.action, action));
  if (entityType) conditions.push(eq(auditLogTable.entityType, entityType));
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db.select().from(auditLogTable)
    .where(where)
    .orderBy(desc(auditLogTable.createdAt))
    .limit(Number.isFinite(limit) ? limit : 50);
  res.json(rows.map((r) => ({
    id: r.id,
    adminId: r.adminId ?? null,
    adminUsername: r.adminUsername ?? null,
    action: r.action,
    entityType: r.entityType,
    entityId: r.entityId ?? null,
    details: r.details ?? null,
    ip: r.ip ?? null,
    createdAt: r.createdAt.toISOString(),
  })));
});

export default router;
