import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";
import { db } from "@workspace/db";
import { subscriptionPlansTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { AdminCreateSubscriptionPlanBody, AdminUpdateSubscriptionPlanBody } from "@workspace/api-zod";
import { requireAuth, requirePermission } from "../../middlewares/auth";
import { writeAudit } from "../../lib/audit";
import type { SubscriptionPlan } from "@workspace/db";

const router: IRouter = Router();

function mapSubscriptionPlan(p: SubscriptionPlan) {
  return {
    id: p.id,
    nameAr: p.nameAr,
    nameEn: p.nameEn,
    slug: p.slug,
    descriptionAr: p.descriptionAr ?? null,
    descriptionEn: p.descriptionEn ?? null,
    price: Number(p.price),
    period: p.period,
    features: (p.features as string[]) ?? [],
    isActive: p.isActive,
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/admin/subscription-plans", requireAuth, requirePermission("subscriptions:write"), async (_req, res) => {
  const rows = await db.select().from(subscriptionPlansTable).orderBy(desc(subscriptionPlansTable.createdAt));
  res.json(rows.map(mapSubscriptionPlan));
});

router.post("/admin/subscription-plans", requireAuth, requirePermission("subscriptions:write"), async (req, res) => {
  const parsed = AdminCreateSubscriptionPlanBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة", details: parsed.error.issues });
  const data = parsed.data;

  const existing = await db.query.subscriptionPlansTable.findFirst({ where: eq(subscriptionPlansTable.slug, data.slug) });
  if (existing) return res.status(409).json({ error: "المعرف المختصر (slug) مستخدم مسبقاً" });

  const id = `sub-${randomUUID().slice(0, 8)}`;
  const [created] = await db.insert(subscriptionPlansTable).values({
    id,
    nameAr: data.nameAr,
    nameEn: data.nameEn,
    slug: data.slug,
    descriptionAr: data.descriptionAr ?? null,
    descriptionEn: data.descriptionEn ?? null,
    price: data.price.toString(),
    period: data.period,
    features: data.features ?? [],
    isActive: data.isActive ?? true,
  }).returning();
  await writeAudit(req, { action: "create", entityType: "subscription_plan", entityId: id, details: { slug: data.slug } });
  res.status(201).json(mapSubscriptionPlan(created));
});

router.put("/admin/subscription-plans/:id", requireAuth, requirePermission("subscriptions:write"), async (req, res) => {
  const parsed = AdminUpdateSubscriptionPlanBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة", details: parsed.error.issues });
  const existing = await db.query.subscriptionPlansTable.findFirst({ where: eq(subscriptionPlansTable.id, req.params.id as string) });
  if (!existing) return res.status(404).json({ error: "غير موجود" });

  const data = parsed.data;
  const values: Record<string, unknown> = {};
  if (data.nameAr !== undefined) values.nameAr = data.nameAr;
  if (data.nameEn !== undefined) values.nameEn = data.nameEn;
  if (data.slug !== undefined) values.slug = data.slug;
  if (data.descriptionAr !== undefined) values.descriptionAr = data.descriptionAr;
  if (data.descriptionEn !== undefined) values.descriptionEn = data.descriptionEn;
  if (data.price !== undefined) values.price = data.price.toString();
  if (data.period !== undefined) values.period = data.period;
  if (data.features !== undefined) values.features = data.features;
  if (data.isActive !== undefined) values.isActive = data.isActive;

  const [updated] = await db.update(subscriptionPlansTable).set(values).where(eq(subscriptionPlansTable.id, req.params.id as string)).returning();
  await writeAudit(req, { action: "update", entityType: "subscription_plan", entityId: req.params.id as string });
  res.json(mapSubscriptionPlan(updated));
});

router.delete("/admin/subscription-plans/:id", requireAuth, requirePermission("subscriptions:write"), async (req, res) => {
  const existing = await db.query.subscriptionPlansTable.findFirst({ where: eq(subscriptionPlansTable.id, req.params.id as string) });
  if (!existing) return res.status(404).json({ error: "غير موجود" });
  await db.delete(subscriptionPlansTable).where(eq(subscriptionPlansTable.id, req.params.id as string));
  await writeAudit(req, { action: "delete", entityType: "subscription_plan", entityId: req.params.id as string, details: { slug: existing.slug } });
  res.json({ success: true, message: "تم الحذف" });
});

export default router;
