import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { ordersTable } from "@workspace/db";
import { eq, and, or, ilike, desc, sql } from "drizzle-orm";
import { AdminUpdateOrderStatusBody } from "@workspace/api-zod";
import { requireAuth, requirePermission } from "../../middlewares/auth";
import { writeAudit } from "../../lib/audit";
import { mapOrder, mapOrderWithCodes } from "./helpers";
import { allocateCodesForOrder } from "../../lib/digital";

const router: IRouter = Router();

router.get("/admin/orders", requireAuth, requirePermission("orders:write"), async (req, res) => {
  const { status, search, page = "1", limit = "20" } = req.query as Record<string, string>;
  const conditions = [];
  if (status) conditions.push(eq(ordersTable.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(ordersTable.customerName, `%${search}%`),
        ilike(ordersTable.phone, `%${search}%`),
        ilike(ordersTable.id, `%${search}%`),
      ),
    );
  }
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const offset = (pageNum - 1) * limitNum;
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [orders, totalResult] = await Promise.all([
    db.select().from(ordersTable).where(where).orderBy(desc(ordersTable.createdAt)).limit(limitNum).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(ordersTable).where(where),
  ]);

  res.json({
    orders: orders.map(mapOrder),
    total: Number(totalResult[0]?.count ?? 0),
    page: pageNum,
    limit: limitNum,
  });
});

router.get("/admin/orders/:id", requireAuth, requirePermission("orders:write"), async (req, res) => {
  const order = await db.query.ordersTable.findFirst({ where: eq(ordersTable.id, (req.params.id as string)) });
  if (!order) return res.status(404).json({ error: "غير موجود" });
  res.json(await mapOrderWithCodes(order));
});

// POST /admin/orders/:id/fulfill — allocate codes for any still-unfulfilled digital items
router.post("/admin/orders/:id/fulfill", requireAuth, requirePermission("orders:write"), async (req, res) => {
  const order = await db.query.ordersTable.findFirst({ where: eq(ordersTable.id, (req.params.id as string)) });
  if (!order) return res.status(404).json({ error: "غير موجود" });

  const items = order.items as Array<{ productId: string; nameAr: string; quantity: number }>;
  await db.transaction(async (tx) => {
    await allocateCodesForOrder(tx, order.id, items);
  });
  await writeAudit(req, { action: "fulfill", entityType: "order", entityId: order.id });
  res.json(await mapOrderWithCodes(order));
});

router.patch("/admin/orders/:id/status", requireAuth, requirePermission("orders:write"), async (req, res) => {
  const parsed = AdminUpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "حالة غير صالحة", details: parsed.error.issues });
  const existing = await db.query.ordersTable.findFirst({ where: eq(ordersTable.id, (req.params.id as string)) });
  if (!existing) return res.status(404).json({ error: "غير موجود" });
  const [updated] = await db.update(ordersTable).set({ status: parsed.data.status }).where(eq(ordersTable.id, (req.params.id as string))).returning();
  await writeAudit(req, { action: "update_status", entityType: "order", entityId: (req.params.id as string), details: { from: existing.status, to: parsed.data.status } });
  res.json(mapOrder(updated));
});

export default router;
