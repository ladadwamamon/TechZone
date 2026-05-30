import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { newsletterSubscribersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, requirePermission } from "../../middlewares/auth";
import { writeAudit } from "../../lib/audit";

const router: IRouter = Router();

router.get("/admin/newsletter", requireAuth, requirePermission("newsletter:read"), async (_req, res) => {
  const rows = await db.select().from(newsletterSubscribersTable).orderBy(desc(newsletterSubscribersTable.createdAt));
  res.json(rows.map((r) => ({ id: r.id, email: r.email, createdAt: r.createdAt.toISOString() })));
});

router.delete("/admin/newsletter/:id", requireAuth, requirePermission("newsletter:write"), async (req, res) => {
  const existing = await db.query.newsletterSubscribersTable.findFirst({ where: eq(newsletterSubscribersTable.id, (req.params.id as string)) });
  if (!existing) return res.status(404).json({ error: "غير موجود" });
  await db.delete(newsletterSubscribersTable).where(eq(newsletterSubscribersTable.id, (req.params.id as string)));
  await writeAudit(req, { action: "delete", entityType: "newsletter_subscriber", entityId: (req.params.id as string) });
  res.json({ success: true, message: "تم الحذف" });
});

export default router;
