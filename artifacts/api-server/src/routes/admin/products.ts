import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";
import { db } from "@workspace/db";
import { productsTable } from "@workspace/db";
import { eq, and, ilike, desc, sql } from "drizzle-orm";
import { AdminCreateProductBody, AdminUpdateProductBody } from "@workspace/api-zod";
import { requireAuth, requirePermission } from "../../middlewares/auth";
import { writeAudit } from "../../lib/audit";
import { mapAdminProduct, buildProductValues, recalcCategoryCount, recalcBrandCount } from "./helpers";
import { syncDigitalStock } from "../../lib/digital";

const router: IRouter = Router();

router.get("/admin/products", requireAuth, requirePermission("products:write"), async (req, res) => {
  const { search, category, brand, page = "1", limit = "20" } = req.query as Record<string, string>;
  const conditions = [];
  if (search) conditions.push(ilike(productsTable.nameAr, `%${search}%`));
  if (category) conditions.push(eq(productsTable.categorySlug, category));
  if (brand) conditions.push(eq(productsTable.brandSlug, brand));

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const offset = (pageNum - 1) * limitNum;
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [products, totalResult] = await Promise.all([
    db.select().from(productsTable).where(where).orderBy(desc(productsTable.createdAt)).limit(limitNum).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(productsTable).where(where),
  ]);

  res.json({
    products: products.map(mapAdminProduct),
    total: Number(totalResult[0]?.count ?? 0),
    page: pageNum,
    limit: limitNum,
  });
});

router.get("/admin/products/:id", requireAuth, requirePermission("products:write"), async (req, res) => {
  const product = await db.query.productsTable.findFirst({
    where: eq(productsTable.id, req.params.id as string),
  });
  if (!product) return res.status(404).json({ error: "غير موجود" });
  res.json(mapAdminProduct(product));
});

router.post("/admin/products", requireAuth, requirePermission("products:write"), async (req, res) => {
  const parsed = AdminCreateProductBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة", details: parsed.error.issues });
  const data = parsed.data;
  const id = data.id ?? `prod-${randomUUID().slice(0, 8)}`;

  const values = buildProductValues(data);
  const [created] = await db.insert(productsTable).values({
    id,
    ...values,
  } as typeof productsTable.$inferInsert).returning();

  await Promise.all([recalcCategoryCount(created.categorySlug), recalcBrandCount(created.brandSlug)]);
  // Digital products derive stock from their available code pool; ignore any
  // manually supplied stock value.
  if (created.productType === "digital") await syncDigitalStock(db, created.id);
  await writeAudit(req, { action: "create", entityType: "product", entityId: id, details: { nameAr: created.nameAr } });
  const final = await db.query.productsTable.findFirst({ where: eq(productsTable.id, id) });
  res.status(201).json(mapAdminProduct(final ?? created));
});

router.put("/admin/products/:id", requireAuth, requirePermission("products:write"), async (req, res) => {
  const parsed = AdminUpdateProductBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة", details: parsed.error.issues });

  const existing = await db.query.productsTable.findFirst({ where: eq(productsTable.id, (req.params.id as string)) });
  if (!existing) return res.status(404).json({ error: "غير موجود" });

  const values = buildProductValues(parsed.data);
  const [updated] = await db.update(productsTable).set(values).where(eq(productsTable.id, (req.params.id as string))).returning();

  const slugsToRecalc = new Set<string>([existing.categorySlug, updated.categorySlug]);
  const brandsToRecalc = new Set<string>([existing.brandSlug, updated.brandSlug]);
  await Promise.all([
    ...[...slugsToRecalc].map(recalcCategoryCount),
    ...[...brandsToRecalc].map(recalcBrandCount),
  ]);
  // Keep digital stock locked to the available code pool after edits.
  if (updated.productType === "digital") await syncDigitalStock(db, updated.id);
  await writeAudit(req, { action: "update", entityType: "product", entityId: (req.params.id as string) });
  const final = await db.query.productsTable.findFirst({ where: eq(productsTable.id, (req.params.id as string)) });
  res.json(mapAdminProduct(final ?? updated));
});

router.delete("/admin/products/:id", requireAuth, requirePermission("products:write"), async (req, res) => {
  const existing = await db.query.productsTable.findFirst({ where: eq(productsTable.id, (req.params.id as string)) });
  if (!existing) return res.status(404).json({ error: "غير موجود" });
  await db.delete(productsTable).where(eq(productsTable.id, (req.params.id as string)));
  await Promise.all([recalcCategoryCount(existing.categorySlug), recalcBrandCount(existing.brandSlug)]);
  await writeAudit(req, { action: "delete", entityType: "product", entityId: (req.params.id as string), details: { nameAr: existing.nameAr } });
  res.json({ success: true, message: "تم الحذف" });
});

export default router;
