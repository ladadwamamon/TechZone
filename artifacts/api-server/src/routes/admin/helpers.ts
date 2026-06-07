import { db } from "@workspace/db";
import { productsTable, categoriesTable, brandsTable, ordersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { loadDeliveredCodes } from "../../lib/digital";

export function mapAdminProduct(p: typeof productsTable.$inferSelect) {
  return {
    id: p.id,
    nameAr: p.nameAr,
    nameEn: p.nameEn,
    slug: p.slug,
    sku: p.sku ?? null,
    price: Number(p.price),
    originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
    discountPercent: p.discountPercent ? Number(p.discountPercent) : null,
    categorySlug: p.categorySlug,
    brandSlug: p.brandSlug,
    image: p.image,
    image2: p.image2 ?? null,
    images: Array.isArray(p.images) ? p.images : [],
    productType: p.productType,
    platform: p.platform ?? null,
    region: p.region ?? null,
    deliveryType: p.deliveryType ?? null,
    digitalInstructionsAr: p.digitalInstructionsAr ?? null,
    stock: p.stock,
    rating: Number(p.rating),
    reviewCount: p.reviewCount,
    warranty: p.warranty ?? null,
    isNew: p.isNew,
    isBestSeller: p.isBestSeller,
    isExclusive: p.isExclusive,
    isFlashDeal: p.isFlashDeal,
    isFeatured: p.isFeatured,
    descriptionAr: p.descriptionAr ?? null,
    specs: (p.specs as Array<{ labelAr: string; value: string }>) ?? [],
    variants: (p.variants as Array<{ id: string; label: string; value: string; price: number; inStock: boolean }>) ?? [],
    badges: (p.badges as string[]) ?? [],
    metaTitle: p.metaTitle ?? null,
    metaDescription: p.metaDescription ?? null,
    metaKeywords: p.metaKeywords ?? null,
    createdAt: p.createdAt.toISOString(),
  };
}

export function mapOrder(o: typeof ordersTable.$inferSelect) {
  return {
    id: o.id,
    customerName: o.customerName,
    phone: o.phone,
    city: o.city,
    address: o.address,
    email: o.email ?? null,
    promoCode: o.promoCode ?? null,
    discount: o.discount ? Number(o.discount) : null,
    notes: o.notes ?? null,
    paymentMethod: o.paymentMethod,
    items: o.items as Array<{ productId: string; nameAr: string; price: number; quantity: number; image: string; productType?: string | null }>,
    subtotal: Number(o.subtotal),
    shipping: Number(o.shipping),
    total: Number(o.total),
    status: o.status,
    createdAt: o.createdAt.toISOString(),
  };
}

export async function mapOrderWithCodes(o: typeof ordersTable.$inferSelect) {
  const deliveredCodes = await loadDeliveredCodes(db, o.id);
  return { ...mapOrder(o), deliveredCodes };
}

export async function recalcCategoryCount(slug: string): Promise<void> {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(productsTable)
    .where(eq(productsTable.categorySlug, slug));
  await db.update(categoriesTable)
    .set({ productCount: Number(count) })
    .where(eq(categoriesTable.slug, slug));
}

export async function recalcBrandCount(slug: string): Promise<void> {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(productsTable)
    .where(eq(productsTable.brandSlug, slug));
  await db.update(brandsTable)
    .set({ productCount: Number(count) })
    .where(eq(brandsTable.slug, slug));
}

type ProductInputShape = {
  nameAr?: string;
  nameEn?: string;
  slug?: string;
  sku?: string | null;
  price?: number;
  originalPrice?: number | null;
  discountPercent?: number | null;
  categorySlug?: string;
  brandSlug?: string;
  image?: string;
  image2?: string | null;
  images?: string[];
  productType?: string;
  platform?: string | null;
  region?: string | null;
  deliveryType?: string | null;
  digitalInstructionsAr?: string | null;
  stock?: number;
  rating?: number;
  reviewCount?: number;
  warranty?: string | null;
  isNew?: boolean;
  isBestSeller?: boolean;
  isExclusive?: boolean;
  isFlashDeal?: boolean;
  isFeatured?: boolean;
  descriptionAr?: string | null;
  specs?: unknown;
  variants?: unknown;
  badges?: unknown;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
};

export function buildProductValues(data: ProductInputShape): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  const assign = (key: string, val: unknown) => {
    if (val !== undefined) values[key] = val;
  };
  assign("nameAr", data.nameAr);
  assign("nameEn", data.nameEn);
  assign("slug", data.slug);
  assign("sku", data.sku);
  if (data.price !== undefined) values.price = data.price.toString();
  if (data.originalPrice !== undefined) values.originalPrice = data.originalPrice === null ? null : data.originalPrice.toString();
  if (data.discountPercent !== undefined) values.discountPercent = data.discountPercent === null ? null : data.discountPercent.toString();
  assign("categorySlug", data.categorySlug);
  assign("brandSlug", data.brandSlug);
  assign("image", data.image);
  assign("image2", data.image2);
  assign("images", data.images);
  assign("productType", data.productType);
  assign("platform", data.platform);
  assign("region", data.region);
  assign("deliveryType", data.deliveryType);
  assign("digitalInstructionsAr", data.digitalInstructionsAr);
  assign("stock", data.stock);
  if (data.rating !== undefined) values.rating = data.rating.toString();
  assign("reviewCount", data.reviewCount);
  assign("warranty", data.warranty);
  assign("isNew", data.isNew);
  assign("isBestSeller", data.isBestSeller);
  assign("isExclusive", data.isExclusive);
  assign("isFlashDeal", data.isFlashDeal);
  assign("isFeatured", data.isFeatured);
  assign("descriptionAr", data.descriptionAr);
  assign("specs", data.specs);
  assign("variants", data.variants);
  assign("badges", data.badges);
  assign("metaTitle", data.metaTitle);
  assign("metaDescription", data.metaDescription);
  assign("metaKeywords", data.metaKeywords);
  return values;
}
