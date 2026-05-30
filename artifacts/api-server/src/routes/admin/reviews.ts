import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";
import { db } from "@workspace/db";
import { productReviewsTable, productsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { AdminCreateReviewBody } from "@workspace/api-zod";
import { requireAuth, requirePermission } from "../../middlewares/auth";
import { writeAudit } from "../../lib/audit";

const router: IRouter = Router();

function mapReview(r: typeof productReviewsTable.$inferSelect) {
  return {
    id: r.id,
    productId: r.productId,
    authorName: r.authorName,
    rating: r.rating,
    comment: r.comment,
    date: r.date,
  };
}

async function recalcProductRating(productId: string): Promise<void> {
  const [agg] = await db
    .select({ avg: sql<number>`coalesce(avg(${productReviewsTable.rating}), 0)`, count: sql<number>`count(*)` })
    .from(productReviewsTable)
    .where(eq(productReviewsTable.productId, productId));
  await db.update(productsTable)
    .set({ rating: Number(agg?.avg ?? 0).toFixed(2), reviewCount: Number(agg?.count ?? 0) })
    .where(eq(productsTable.id, productId));
}

router.get("/admin/reviews", requireAuth, requirePermission("reviews:write"), async (req, res) => {
  const { productId } = req.query as Record<string, string>;
  const rows = await db.select().from(productReviewsTable)
    .where(productId ? eq(productReviewsTable.productId, productId) : undefined)
    .orderBy(desc(productReviewsTable.date));
  res.json(rows.map(mapReview));
});

router.post("/admin/reviews", requireAuth, requirePermission("reviews:write"), async (req, res) => {
  const parsed = AdminCreateReviewBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة", details: parsed.error.issues });
  const data = parsed.data;
  const id = `rev-${randomUUID().slice(0, 8)}`;
  const [created] = await db.insert(productReviewsTable).values({
    id,
    productId: data.productId,
    authorName: data.authorName,
    rating: data.rating,
    comment: data.comment,
    date: data.date ?? new Date().toISOString().slice(0, 10),
  }).returning();
  await recalcProductRating(data.productId);
  await writeAudit(req, { action: "create", entityType: "review", entityId: id, details: { productId: data.productId } });
  res.status(201).json(mapReview(created));
});

router.delete("/admin/reviews/:id", requireAuth, requirePermission("reviews:write"), async (req, res) => {
  const existing = await db.query.productReviewsTable.findFirst({ where: eq(productReviewsTable.id, (req.params.id as string)) });
  if (!existing) return res.status(404).json({ error: "غير موجود" });
  await db.delete(productReviewsTable).where(eq(productReviewsTable.id, (req.params.id as string)));
  await recalcProductRating(existing.productId);
  await writeAudit(req, { action: "delete", entityType: "review", entityId: (req.params.id as string) });
  res.json({ success: true, message: "تم الحذف" });
});

export default router;
