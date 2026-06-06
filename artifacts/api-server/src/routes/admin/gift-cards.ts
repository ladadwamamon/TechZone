import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";
import { db } from "@workspace/db";
import { giftCardsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { AdminCreateGiftCardBody, AdminUpdateGiftCardBody } from "@workspace/api-zod";
import { requireAuth, requirePermission } from "../../middlewares/auth";
import { writeAudit } from "../../lib/audit";
import type { GiftCard } from "@workspace/db";

const router: IRouter = Router();

function mapGiftCard(c: GiftCard) {
  return {
    id: c.id,
    code: c.code,
    amount: Number(c.amount),
    balance: Number(c.balance),
    status: c.status,
    customerId: c.customerId ?? null,
    redeemedAt: c.redeemedAt ? c.redeemedAt.toISOString() : null,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
    createdAt: c.createdAt.toISOString(),
  };
}

router.get("/admin/gift-cards", requireAuth, requirePermission("gift_cards:write"), async (_req, res) => {
  const rows = await db.select().from(giftCardsTable).orderBy(desc(giftCardsTable.createdAt));
  res.json(rows.map(mapGiftCard));
});

router.post("/admin/gift-cards", requireAuth, requirePermission("gift_cards:write"), async (req, res) => {
  const parsed = AdminCreateGiftCardBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة", details: parsed.error.issues });
  const data = parsed.data;
  const code = data.code.trim().toUpperCase();

  const existing = await db.query.giftCardsTable.findFirst({ where: eq(giftCardsTable.code, code) });
  if (existing) return res.status(409).json({ error: "رمز بطاقة الهدايا مستخدم مسبقاً" });

  const id = `gc-${randomUUID().slice(0, 8)}`;
  const [created] = await db.insert(giftCardsTable).values({
    id,
    code,
    amount: data.amount.toString(),
    balance: (data.balance ?? data.amount).toString(),
    status: data.status ?? "active",
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
  }).returning();
  await writeAudit(req, { action: "create", entityType: "gift_card", entityId: id, details: { code } });
  res.status(201).json(mapGiftCard(created));
});

router.put("/admin/gift-cards/:id", requireAuth, requirePermission("gift_cards:write"), async (req, res) => {
  const parsed = AdminUpdateGiftCardBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة", details: parsed.error.issues });
  const existing = await db.query.giftCardsTable.findFirst({ where: eq(giftCardsTable.id, req.params.id as string) });
  if (!existing) return res.status(404).json({ error: "غير موجود" });

  const data = parsed.data;
  const values: Record<string, unknown> = {};
  if (data.code !== undefined) values.code = data.code.trim().toUpperCase();
  if (data.amount !== undefined) values.amount = data.amount.toString();
  if (data.balance !== undefined) values.balance = data.balance.toString();
  if (data.status !== undefined) values.status = data.status;
  if (data.expiresAt !== undefined) values.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;

  const [updated] = await db.update(giftCardsTable).set(values).where(eq(giftCardsTable.id, req.params.id as string)).returning();
  await writeAudit(req, { action: "update", entityType: "gift_card", entityId: req.params.id as string });
  res.json(mapGiftCard(updated));
});

router.delete("/admin/gift-cards/:id", requireAuth, requirePermission("gift_cards:write"), async (req, res) => {
  const existing = await db.query.giftCardsTable.findFirst({ where: eq(giftCardsTable.id, req.params.id as string) });
  if (!existing) return res.status(404).json({ error: "غير موجود" });
  await db.delete(giftCardsTable).where(eq(giftCardsTable.id, req.params.id as string));
  await writeAudit(req, { action: "delete", entityType: "gift_card", entityId: req.params.id as string, details: { code: existing.code } });
  res.json({ success: true, message: "تم الحذف" });
});

export default router;
