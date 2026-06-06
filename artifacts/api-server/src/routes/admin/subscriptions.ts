import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { customerSubscriptionsTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { requireAuth, requirePermission } from "../../middlewares/auth";

const router: IRouter = Router();

function mapSubscription(s: typeof customerSubscriptionsTable.$inferSelect) {
  return {
    id: s.id,
    customerId: s.customerId,
    planId: s.planId,
    status: s.status,
    startedAt: s.startedAt ? s.startedAt.toISOString() : null,
    expiresAt: s.expiresAt ? s.expiresAt.toISOString() : null,
    renewCount: s.renewCount,
    cancelledAt: s.cancelledAt ? s.cancelledAt.toISOString() : null,
    createdAt: s.createdAt.toISOString(),
  };
}

router.get("/admin/subscriptions", requireAuth, requirePermission("subscriptions:write"), async (_req, res) => {
  const rows = await db.select().from(customerSubscriptionsTable).orderBy(desc(customerSubscriptionsTable.createdAt));
  res.json(rows.map(mapSubscription));
});

export default router;
