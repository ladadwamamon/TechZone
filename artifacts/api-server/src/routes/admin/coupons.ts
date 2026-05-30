import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";
import { db } from "@workspace/db";
import { couponsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { AdminCreateCouponBody, AdminUpdateCouponBody } from "@workspace/api-zod";
import { requireAuth, requirePermission } from "../../middlewares/auth";
import { writeAudit } from "../../lib/audit";
import type { Coupon } from "@workspace/db";

const router: IRouter = Router();

function mapCoupon(c: Coupon) {
  return {
    id: c.id,
    code: c.code,
    type: c.type,
    value: Number(c.value),
    minSubtotal: c.minSubtotal != null ? Number(c.minSubtotal) : null,
    maxUses: c.maxUses ?? null,
    usedCount: c.usedCount,
    isActive: c.isActive,
    startsAt: c.startsAt ? c.startsAt.toISOString() : null,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
    descriptionAr: c.descriptionAr ?? null,
    createdAt: c.createdAt.toISOString(),
  };
}

router.get("/admin/coupons", requireAuth, requirePermission("coupons:write"), async (_req, res) => {
  const rows = await db.select().from(couponsTable).orderBy(desc(couponsTable.createdAt));
  res.json(rows.map(mapCoupon));
});

router.post("/admin/coupons", requireAuth, requirePermission("coupons:write"), async (req, res) => {
  const parsed = AdminCreateCouponBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة", details: parsed.error.issues });
  const data = parsed.data;
  const code = data.code.trim().toUpperCase();

  const existing = await db.query.couponsTable.findFirst({ where: eq(couponsTable.code, code) });
  if (existing) return res.status(409).json({ error: "رمز الخصم مستخدم مسبقاً" });

  const id = `cpn-${randomUUID().slice(0, 8)}`;
  const [created] = await db.insert(couponsTable).values({
    id,
    code,
    type: data.type,
    value: data.value.toString(),
    minSubtotal: data.minSubtotal != null ? data.minSubtotal.toString() : null,
    maxUses: data.maxUses ?? null,
    isActive: data.isActive ?? true,
    startsAt: data.startsAt ? new Date(data.startsAt) : null,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    descriptionAr: data.descriptionAr ?? null,
  }).returning();
  await writeAudit(req, { action: "create", entityType: "coupon", entityId: id, details: { code } });
  res.status(201).json(mapCoupon(created));
});

router.put("/admin/coupons/:id", requireAuth, requirePermission("coupons:write"), async (req, res) => {
  const parsed = AdminUpdateCouponBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة", details: parsed.error.issues });
  const existing = await db.query.couponsTable.findFirst({ where: eq(couponsTable.id, req.params.id as string) });
  if (!existing) return res.status(404).json({ error: "غير موجود" });

  const data = parsed.data;
  const values: Record<string, unknown> = {};
  if (data.code !== undefined) values.code = data.code.trim().toUpperCase();
  if (data.type !== undefined) values.type = data.type;
  if (data.value !== undefined) values.value = data.value.toString();
  if (data.minSubtotal !== undefined) values.minSubtotal = data.minSubtotal === null ? null : data.minSubtotal.toString();
  if (data.maxUses !== undefined) values.maxUses = data.maxUses;
  if (data.isActive !== undefined) values.isActive = data.isActive;
  if (data.startsAt !== undefined) values.startsAt = data.startsAt ? new Date(data.startsAt) : null;
  if (data.expiresAt !== undefined) values.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
  if (data.descriptionAr !== undefined) values.descriptionAr = data.descriptionAr;

  const [updated] = await db.update(couponsTable).set(values).where(eq(couponsTable.id, req.params.id as string)).returning();
  await writeAudit(req, { action: "update", entityType: "coupon", entityId: req.params.id as string });
  res.json(mapCoupon(updated));
});

router.delete("/admin/coupons/:id", requireAuth, requirePermission("coupons:write"), async (req, res) => {
  const existing = await db.query.couponsTable.findFirst({ where: eq(couponsTable.id, req.params.id as string) });
  if (!existing) return res.status(404).json({ error: "غير موجود" });
  await db.delete(couponsTable).where(eq(couponsTable.id, req.params.id as string));
  await writeAudit(req, { action: "delete", entityType: "coupon", entityId: req.params.id as string, details: { code: existing.code } });
  res.json({ success: true, message: "تم الحذف" });
});

export default router;
