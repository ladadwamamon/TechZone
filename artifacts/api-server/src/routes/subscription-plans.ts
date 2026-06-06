import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";
import { db } from "@workspace/db";
import { subscriptionPlansTable, customerSubscriptionsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { ListSubscriptionPlansResponseItem, CreateCustomerSubscriptionBody } from "@workspace/api-zod";
import { requireCustomer } from "../middlewares/customer-auth";

const router: IRouter = Router();

function mapPlan(p: typeof subscriptionPlansTable.$inferSelect) {
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

router.get("/subscription-plans", async (_req, res) => {
  const rows = await db.select().from(subscriptionPlansTable).where(eq(subscriptionPlansTable.isActive, true)).orderBy(desc(subscriptionPlansTable.createdAt));
  res.json(rows.map(mapPlan));
});

router.get("/customers/subscriptions", requireCustomer, async (req, res) => {
  const rows = await db.select().from(customerSubscriptionsTable).where(eq(customerSubscriptionsTable.customerId, req.customer!.id)).orderBy(desc(customerSubscriptionsTable.createdAt));
  res.json(rows.map(mapSubscription));
});

router.post("/customers/subscriptions", requireCustomer, async (req, res) => {
  const parsed = CreateCustomerSubscriptionBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة" });
  const planId = parsed.data.planId;
  const customerId = req.customer!.id;

  const plan = await db.query.subscriptionPlansTable.findFirst({ where: eq(subscriptionPlansTable.id, planId) });
  if (!plan || !plan.isActive) return res.status(404).json({ error: "الخطة غير موجودة أو غير فعّالة" });

  const now = new Date();
  let expiresAt: Date;
  switch (plan.period) {
    case "monthly":
      expiresAt = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      break;
    case "quarterly":
      expiresAt = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
      break;
    case "yearly":
      expiresAt = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      break;
    default:
      expiresAt = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }

  const id = `cs-${randomUUID().slice(0, 8)}`;
  const [created] = await db.insert(customerSubscriptionsTable).values({
    id,
    customerId,
    planId,
    status: "active",
    startedAt: now,
    expiresAt,
  }).returning();

  res.status(201).json(mapSubscription(created));
});

export default router;
