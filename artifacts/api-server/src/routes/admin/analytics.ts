import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { ordersTable, productsTable, newsletterSubscribersTable } from "@workspace/db";
import { desc, sql, gte, asc, inArray } from "drizzle-orm";
import { requireAuth, requirePermission } from "../../middlewares/auth";
import { mapAdminProduct, mapOrder } from "./helpers";

const router: IRouter = Router();

const REVENUE_STATUSES = ["confirmed", "shipped", "out_for_delivery", "delivered"];

router.get("/admin/analytics/overview", requireAuth, requirePermission("analytics:read"), async (_req, res) => {
  const [revenueRow, ordersCountRow, byStatus, productsCountRow, subsCountRow, lowStockRow, recentOrders] = await Promise.all([
    db.select({ total: sql<number>`coalesce(sum(${ordersTable.total}), 0)` }).from(ordersTable)
      .where(inArray(ordersTable.status, REVENUE_STATUSES)),
    db.select({ count: sql<number>`count(*)` }).from(ordersTable),
    db.select({ status: ordersTable.status, count: sql<number>`count(*)` }).from(ordersTable).groupBy(ordersTable.status),
    db.select({ count: sql<number>`count(*)` }).from(productsTable),
    db.select({ count: sql<number>`count(*)` }).from(newsletterSubscribersTable),
    db.select({ count: sql<number>`count(*)` }).from(productsTable).where(sql`${productsTable.stock} <= 5`),
    db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(5),
  ]);

  res.json({
    totalRevenue: Number(revenueRow[0]?.total ?? 0),
    totalOrders: Number(ordersCountRow[0]?.count ?? 0),
    ordersByStatus: byStatus.map((s) => ({ status: s.status, count: Number(s.count) })),
    totalProducts: Number(productsCountRow[0]?.count ?? 0),
    totalSubscribers: Number(subsCountRow[0]?.count ?? 0),
    lowStockCount: Number(lowStockRow[0]?.count ?? 0),
    recentOrders: recentOrders.map(mapOrder),
  });
});

router.get("/admin/analytics/sales-over-time", requireAuth, requirePermission("analytics:read"), async (req, res) => {
  const days = parseInt((req.query.days as string) ?? "30", 10);
  const since = new Date();
  since.setDate(since.getDate() - (Number.isFinite(days) ? days : 30));

  const rows = await db
    .select({
      date: sql<string>`to_char(${ordersTable.createdAt}, 'YYYY-MM-DD')`,
      orders: sql<number>`count(*)`,
      revenue: sql<number>`coalesce(sum(${ordersTable.total}), 0)`,
    })
    .from(ordersTable)
    .where(gte(ordersTable.createdAt, since))
    .groupBy(sql`to_char(${ordersTable.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(asc(sql`to_char(${ordersTable.createdAt}, 'YYYY-MM-DD')`));

  res.json(rows.map((r) => ({ date: r.date, orders: Number(r.orders), revenue: Number(r.revenue) })));
});

router.get("/admin/analytics/top-products", requireAuth, requirePermission("analytics:read"), async (req, res) => {
  const limit = parseInt((req.query.limit as string) ?? "10", 10);
  const rows = await db
    .select({
      productId: sql<string>`item->>'productId'`,
      nameAr: sql<string>`max(item->>'nameAr')`,
      image: sql<string>`max(item->>'image')`,
      quantitySold: sql<number>`coalesce(sum((item->>'quantity')::int), 0)`,
      revenue: sql<number>`coalesce(sum((item->>'price')::numeric * (item->>'quantity')::int), 0)`,
    })
    .from(sql`${ordersTable}, jsonb_array_elements(${ordersTable.items}) as item`)
    .groupBy(sql`item->>'productId'`)
    .orderBy(desc(sql`coalesce(sum((item->>'quantity')::int), 0)`))
    .limit(Number.isFinite(limit) ? limit : 10);

  res.json(rows.map((r) => ({
    productId: r.productId,
    nameAr: r.nameAr ?? "",
    image: r.image ?? null,
    quantitySold: Number(r.quantitySold),
    revenue: Number(r.revenue),
  })));
});

router.get("/admin/analytics/low-stock", requireAuth, requirePermission("analytics:read"), async (req, res) => {
  const threshold = parseInt((req.query.threshold as string) ?? "5", 10);
  const rows = await db.select().from(productsTable)
    .where(sql`${productsTable.stock} <= ${Number.isFinite(threshold) ? threshold : 5}`)
    .orderBy(asc(productsTable.stock));
  res.json(rows.map(mapAdminProduct));
});

export default router;
