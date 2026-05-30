import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";
import { db } from "@workspace/db";
import { categoriesTable, productsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { AdminCreateCategoryBody, AdminUpdateCategoryBody } from "@workspace/api-zod";
import { requireAuth, requirePermission } from "../../middlewares/auth";
import { writeAudit } from "../../lib/audit";

const router: IRouter = Router();

router.get("/admin/categories", requireAuth, requirePermission("categories:write"), async (_req, res) => {
  const rows = await db.select().from(categoriesTable).orderBy(categoriesTable.nameAr);
  res.json(rows);
});

router.post("/admin/categories", requireAuth, requirePermission("categories:write"), async (req, res) => {
  const parsed = AdminCreateCategoryBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة", details: parsed.error.issues });
  const data = parsed.data;
  const id = data.id ?? `cat-${randomUUID().slice(0, 8)}`;
  const [created] = await db.insert(categoriesTable).values({
    id,
    slug: data.slug,
    nameAr: data.nameAr,
    nameEn: data.nameEn,
    icon: data.icon,
    image: data.image ?? null,
    descriptionAr: data.descriptionAr ?? null,
    metaTitle: data.metaTitle ?? null,
    metaDescription: data.metaDescription ?? null,
    metaKeywords: data.metaKeywords ?? null,
  }).returning();
  await writeAudit(req, { action: "create", entityType: "category", entityId: id });
  res.status(201).json(created);
});

router.put("/admin/categories/:id", requireAuth, requirePermission("categories:write"), async (req, res) => {
  const parsed = AdminUpdateCategoryBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة", details: parsed.error.issues });
  const existing = await db.query.categoriesTable.findFirst({ where: eq(categoriesTable.id, (req.params.id as string)) });
  if (!existing) return res.status(404).json({ error: "غير موجود" });

  const values: Record<string, unknown> = {};
  for (const key of ["slug", "nameAr", "nameEn", "icon", "image", "descriptionAr", "metaTitle", "metaDescription", "metaKeywords"] as const) {
    if (parsed.data[key] !== undefined) values[key] = parsed.data[key];
  }
  const [updated] = await db.update(categoriesTable).set(values).where(eq(categoriesTable.id, (req.params.id as string))).returning();

  // Keep products in sync if the slug changed
  if (parsed.data.slug !== undefined && parsed.data.slug !== existing.slug) {
    await db.update(productsTable).set({ categorySlug: updated.slug }).where(eq(productsTable.categorySlug, existing.slug));
  }
  await writeAudit(req, { action: "update", entityType: "category", entityId: (req.params.id as string) });
  res.json(updated);
});

router.delete("/admin/categories/:id", requireAuth, requirePermission("categories:write"), async (req, res) => {
  const existing = await db.query.categoriesTable.findFirst({ where: eq(categoriesTable.id, (req.params.id as string)) });
  if (!existing) return res.status(404).json({ error: "غير موجود" });
  const [countRow] = await db.select({ count: sql<number>`count(*)` }).from(productsTable).where(eq(productsTable.categorySlug, existing.slug));
  if (Number(countRow?.count ?? 0) > 0) {
    return res.status(409).json({ error: "لا يمكن حذف فئة تحتوي على منتجات" });
  }
  await db.delete(categoriesTable).where(eq(categoriesTable.id, (req.params.id as string)));
  await writeAudit(req, { action: "delete", entityType: "category", entityId: (req.params.id as string) });
  res.json({ success: true, message: "تم الحذف" });
});

export default router;
