import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";
import { db } from "@workspace/db";
import { brandsTable, productsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { AdminCreateBrandBody, AdminUpdateBrandBody } from "@workspace/api-zod";
import { requireAuth, requirePermission } from "../../middlewares/auth";
import { writeAudit } from "../../lib/audit";

const router: IRouter = Router();

router.get("/admin/brands", requireAuth, requirePermission("brands:write"), async (_req, res) => {
  const rows = await db.select().from(brandsTable).orderBy(brandsTable.nameEn);
  res.json(rows);
});

router.post("/admin/brands", requireAuth, requirePermission("brands:write"), async (req, res) => {
  const parsed = AdminCreateBrandBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة", details: parsed.error.issues });
  const data = parsed.data;
  const id = data.id ?? `brand-${randomUUID().slice(0, 8)}`;
  const [created] = await db.insert(brandsTable).values({
    id,
    slug: data.slug,
    nameEn: data.nameEn,
    logo: data.logo,
    website: data.website ?? null,
    descriptionAr: data.descriptionAr ?? null,
  }).returning();
  await writeAudit(req, { action: "create", entityType: "brand", entityId: id });
  res.status(201).json(created);
});

router.put("/admin/brands/:id", requireAuth, requirePermission("brands:write"), async (req, res) => {
  const parsed = AdminUpdateBrandBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة", details: parsed.error.issues });
  const existing = await db.query.brandsTable.findFirst({ where: eq(brandsTable.id, (req.params.id as string)) });
  if (!existing) return res.status(404).json({ error: "غير موجود" });

  const values: Record<string, unknown> = {};
  for (const key of ["slug", "nameEn", "logo", "website", "descriptionAr"] as const) {
    if (parsed.data[key] !== undefined) values[key] = parsed.data[key];
  }
  const [updated] = await db.update(brandsTable).set(values).where(eq(brandsTable.id, (req.params.id as string))).returning();

  if (parsed.data.slug !== undefined && parsed.data.slug !== existing.slug) {
    await db.update(productsTable).set({ brandSlug: updated.slug }).where(eq(productsTable.brandSlug, existing.slug));
  }
  await writeAudit(req, { action: "update", entityType: "brand", entityId: (req.params.id as string) });
  res.json(updated);
});

router.delete("/admin/brands/:id", requireAuth, requirePermission("brands:write"), async (req, res) => {
  const existing = await db.query.brandsTable.findFirst({ where: eq(brandsTable.id, (req.params.id as string)) });
  if (!existing) return res.status(404).json({ error: "غير موجود" });
  const [countRow] = await db.select({ count: sql<number>`count(*)` }).from(productsTable).where(eq(productsTable.brandSlug, existing.slug));
  if (Number(countRow?.count ?? 0) > 0) {
    return res.status(409).json({ error: "لا يمكن حذف ماركة تحتوي على منتجات" });
  }
  await db.delete(brandsTable).where(eq(brandsTable.id, (req.params.id as string)));
  await writeAudit(req, { action: "delete", entityType: "brand", entityId: (req.params.id as string) });
  res.json({ success: true, message: "تم الحذف" });
});

export default router;
