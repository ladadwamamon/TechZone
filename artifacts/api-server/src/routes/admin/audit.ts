import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { auditLogTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { requireAuth, requirePermission } from "../../middlewares/auth";

const router: IRouter = Router();

router.get("/admin/audit", requireAuth, requirePermission("audit:read"), async (req, res) => {
  const limit = parseInt((req.query.limit as string) ?? "50", 10);
  const rows = await db.select().from(auditLogTable)
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
