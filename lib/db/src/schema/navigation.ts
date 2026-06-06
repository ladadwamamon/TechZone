import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const NAV_LOCATIONS = ["header", "footer"] as const;
export type NavLocation = (typeof NAV_LOCATIONS)[number];

export const navItemsTable = pgTable("nav_items", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  href: text("href").notNull(),
  location: text("location").notNull().default("header"),
  parentId: text("parent_id"),
  sortOrder: integer("sort_order").notNull().default(0),
  isVisible: boolean("is_visible").notNull().default(true),
  opensNewTab: boolean("opens_new_tab").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertNavItemSchema = createInsertSchema(navItemsTable);
export type InsertNavItem = z.infer<typeof insertNavItemSchema>;
export type NavItem = typeof navItemsTable.$inferSelect;

export const customPagesTable = pgTable("custom_pages", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  titleAr: text("title_ar").notNull(),
  contentHtml: text("content_html").notNull().default(""),
  isPublished: boolean("is_published").notNull().default(true),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCustomPageSchema = createInsertSchema(customPagesTable);
export type InsertCustomPage = z.infer<typeof insertCustomPageSchema>;
export type CustomPage = typeof customPagesTable.$inferSelect;
