import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const blogPostsTable = pgTable("blog_posts", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  titleAr: text("title_ar").notNull(),
  excerpt: text("excerpt").notNull(),
  contentAr: text("content_ar").notNull(),
  coverImage: text("cover_image").notNull(),
  date: text("date").notNull(),
  readingMinutes: integer("reading_minutes").notNull().default(5),
  categoryAr: text("category_ar").notNull(),
  isFeatured: boolean("is_featured").notNull().default(false),
  authorName: text("author_name").notNull().default("فريق تيك زون"),
  authorAvatar: text("author_avatar"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBlogPostSchema = createInsertSchema(blogPostsTable);
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPostsTable.$inferSelect;
