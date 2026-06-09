import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { productsTable, productReviewsTable, categoriesTable, brandsTable } from "@workspace/db";
import { eq, and, gte, lte, ilike, desc, asc, inArray, sql } from "drizzle-orm";
import { normalizeSpecs } from "../lib/product-specs";

const router: IRouter = Router();

function mapProduct(p: typeof productsTable.$inferSelect) {
  return {
    id: p.id,
    nameAr: p.nameAr,
    nameEn: p.nameEn,
    slug: p.slug,
    sku: p.sku ?? undefined,
    price: Number(p.price),
    originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
    discountPercent: p.discountPercent ? Number(p.discountPercent) : null,
    categorySlug: p.categorySlug,
    brandSlug: p.brandSlug,
    image: p.image,
    image2: p.image2 ?? (Array.isArray(p.images) ? p.images[0] ?? null : null),
    productType: p.productType,
    platform: p.platform ?? null,
    region: p.region ?? null,
    stock: p.stock,
    rating: Number(p.rating),
    reviewCount: p.reviewCount,
    warranty: p.warranty ?? null,
    isNew: p.isNew,
    isBestSeller: p.isBestSeller,
    isExclusive: p.isExclusive,
    badges: (p.badges as string[]) ?? [],
  };
}

// GET /products
router.get("/products", async (req, res) => {
  const { category, brand, minPrice, maxPrice, inStock, sort, search, page = "1", limit = "20" } = req.query as Record<string, string>;
  const conditions = [];
  if (category) conditions.push(eq(productsTable.categorySlug, category));
  if (brand) conditions.push(eq(productsTable.brandSlug, brand));
  if (minPrice) conditions.push(gte(productsTable.price, minPrice));
  if (maxPrice) conditions.push(lte(productsTable.price, maxPrice));
  if (inStock === "true") conditions.push(gte(productsTable.stock, sql`1`));
  if (search) conditions.push(ilike(productsTable.nameAr, `%${search}%`));

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const offset = (pageNum - 1) * limitNum;

  let orderBy;
  if (sort === "price_asc") orderBy = asc(productsTable.price);
  else if (sort === "price_desc") orderBy = desc(productsTable.price);
  else if (sort === "rating") orderBy = desc(productsTable.rating);
  else orderBy = desc(productsTable.createdAt);

  const [products, totalResult] = await Promise.all([
    db.select().from(productsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderBy)
      .limit(limitNum)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(productsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined),
  ]);

  res.json({
    products: products.map(mapProduct),
    total: Number(totalResult[0]?.count ?? 0),
    page: pageNum,
    limit: limitNum,
  });
});

// GET /products/featured
router.get("/products/featured", async (_req, res) => {
  const products = await db.select().from(productsTable)
    .where(eq(productsTable.isFeatured, true))
    .orderBy(desc(productsTable.createdAt))
    .limit(8);
  res.json(products.map(mapProduct));
});

// GET /products/best-sellers
router.get("/products/best-sellers", async (req, res) => {
  const limit = parseInt((req.query.limit as string) ?? "8", 10);
  const products = await db.select().from(productsTable)
    .where(eq(productsTable.isBestSeller, true))
    .orderBy(desc(productsTable.reviewCount))
    .limit(limit);
  res.json(products.map(mapProduct));
});

// GET /products/flash-deals
router.get("/products/flash-deals", async (_req, res) => {
  const products = await db.select().from(productsTable)
    .where(eq(productsTable.isFlashDeal, true))
    .orderBy(desc(productsTable.discountPercent))
    .limit(6);

  const tomorrow = new Date();
  tomorrow.setHours(23, 59, 59, 0);

  res.json({
    products: products.map(mapProduct),
    endsAt: tomorrow.toISOString(),
  });
});

// GET /products/recently-viewed
router.get("/products/recently-viewed", async (req, res) => {
  const ids = req.query.ids as string;
  if (!ids) return res.json([]);
  const idList = ids.split(",").filter(Boolean);
  if (idList.length === 0) return res.json([]);
  const products = await db.select().from(productsTable)
    .where(inArray(productsTable.id, idList));
  res.json(products.map(mapProduct));
});

// GET /products/:id/related (must be before /products/:id)
router.get("/products/:id/related", async (req, res) => {
  const product = await db.query.productsTable.findFirst({
    where: eq(productsTable.id, req.params.id),
  });
  if (!product) return res.status(404).json({ error: "Not found" });
  const related = await db.select().from(productsTable)
    .where(and(eq(productsTable.categorySlug, product.categorySlug), sql`${productsTable.id} != ${product.id}`))
    .orderBy(desc(productsTable.rating))
    .limit(6);
  res.json(related.map(mapProduct));
});

// GET /products/:id
router.get("/products/:id", async (req, res) => {
  const product = await db.query.productsTable.findFirst({
    where: eq(productsTable.id, req.params.id),
  });
  if (!product) return res.status(404).json({ error: "Not found" });

  const [reviews, category, brand] = await Promise.all([
    db.select().from(productReviewsTable).where(eq(productReviewsTable.productId, product.id)),
    db.query.categoriesTable.findFirst({ where: eq(categoriesTable.slug, product.categorySlug) }),
    db.query.brandsTable.findFirst({ where: eq(brandsTable.slug, product.brandSlug) }),
  ]);

  res.json({
    ...mapProduct(product),
    images: Array.from(
      new Set(
        [product.image, ...(Array.isArray(product.images) ? product.images : []), product.image2].filter(
          (x): x is string => Boolean(x),
        ),
      ),
    ),
    categoryNameAr: category?.nameAr ?? "",
    brandNameEn: brand?.nameEn ?? "",
    deliveryType: product.deliveryType ?? null,
    digitalInstructionsAr: product.digitalInstructionsAr ?? null,
    descriptionAr: product.descriptionAr ?? "",
    specs: normalizeSpecs(product.specs),
    reviews: reviews.map(r => ({ id: r.id, authorName: r.authorName, rating: r.rating, comment: r.comment, date: r.date })),
    variants: (product.variants as Array<{ id: string; label: string; value: string; price: number; inStock: boolean }>) ?? [],
    metaTitle: product.metaTitle ?? null,
    metaDescription: product.metaDescription ?? null,
    metaKeywords: product.metaKeywords ?? null,
  });
});

export default router;
