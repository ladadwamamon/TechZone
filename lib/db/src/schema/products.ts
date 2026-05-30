import { pgTable, text, decimal, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const categoriesTable = pgTable("categories", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  icon: text("icon").notNull(),
  image: text("image"),
  productCount: integer("product_count").notNull().default(0),
  descriptionAr: text("description_ar"),
});

export const insertCategorySchema = createInsertSchema(categoriesTable);
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categoriesTable.$inferSelect;

export const brandsTable = pgTable("brands", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  logo: text("logo").notNull(),
  website: text("website"),
  descriptionAr: text("description_ar"),
  productCount: integer("product_count").notNull().default(0),
});

export const insertBrandSchema = createInsertSchema(brandsTable);
export type InsertBrand = z.infer<typeof insertBrandSchema>;
export type Brand = typeof brandsTable.$inferSelect;

export const productsTable = pgTable("products", {
  id: text("id").primaryKey(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  slug: text("slug").notNull().unique(),
  sku: text("sku"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }),
  categorySlug: text("category_slug").notNull().references(() => categoriesTable.slug),
  brandSlug: text("brand_slug").notNull().references(() => brandsTable.slug),
  image: text("image").notNull(),
  image2: text("image2"),
  stock: integer("stock").notNull().default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }).notNull().default("0"),
  reviewCount: integer("review_count").notNull().default(0),
  warranty: text("warranty"),
  isNew: boolean("is_new").notNull().default(false),
  isBestSeller: boolean("is_best_seller").notNull().default(false),
  isExclusive: boolean("is_exclusive").notNull().default(false),
  isFlashDeal: boolean("is_flash_deal").notNull().default(false),
  isFeatured: boolean("is_featured").notNull().default(false),
  descriptionAr: text("description_ar"),
  specs: jsonb("specs"),
  variants: jsonb("variants"),
  badges: jsonb("badges"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable);
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;

export const productReviewsTable = pgTable("product_reviews", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull().references(() => productsTable.id),
  authorName: text("author_name").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  date: text("date").notNull(),
});

export const insertProductReviewSchema = createInsertSchema(productReviewsTable);
export type InsertProductReview = z.infer<typeof insertProductReviewSchema>;
export type ProductReview = typeof productReviewsTable.$inferSelect;
