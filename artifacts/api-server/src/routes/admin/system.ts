import { Router, type IRouter } from "express";
import { db, webVitalsTable } from "@workspace/db";
import { gte, sql } from "drizzle-orm";
import { requireAuth, requirePermission } from "../../middlewares/auth";
import { getMetrics } from "../../middlewares/metrics";

const router: IRouter = Router();

router.get("/admin/system/health", requireAuth, requirePermission("analytics:read"), async (_req, res) => {
  res.json(getMetrics());
});

router.get("/admin/system/web-vitals", requireAuth, requirePermission("analytics:read"), async (req, res) => {
  const days = parseInt((req.query.days as string) ?? "7", 10);
  const since = new Date();
  since.setDate(since.getDate() - (Number.isFinite(days) ? days : 7));

  const rows = await db
    .select({
      metric: webVitalsTable.metric,
      avg: sql<number>`avg(${webVitalsTable.value})`,
      p75: sql<number>`percentile_cont(0.75) within group (order by ${webVitalsTable.value})`,
      count: sql<number>`count(*)`,
    })
    .from(webVitalsTable)
    .where(gte(webVitalsTable.createdAt, since))
    .groupBy(webVitalsTable.metric);

  res.json(
    rows.map((r) => ({
      metric: r.metric,
      avg: Math.round(Number(r.avg) * 100) / 100,
      p75: Math.round(Number(r.p75) * 100) / 100,
      count: Number(r.count),
    })),
  );
});

export default router;
