import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { blogPostsTable } from "@workspace/db";
import { eq, ilike, and, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/blog", async (req, res) => {
  const { category, search, limit = "10" } = req.query as Record<string, string>;
  const conditions = [];
  if (category) conditions.push(eq(blogPostsTable.categoryAr, category));
  if (search) conditions.push(ilike(blogPostsTable.titleAr, `%${search}%`));

  const posts = await db.select({
    id: blogPostsTable.id,
    slug: blogPostsTable.slug,
    titleAr: blogPostsTable.titleAr,
    excerpt: blogPostsTable.excerpt,
    coverImage: blogPostsTable.coverImage,
    date: blogPostsTable.date,
    readingMinutes: blogPostsTable.readingMinutes,
    categoryAr: blogPostsTable.categoryAr,
    isFeatured: blogPostsTable.isFeatured,
  }).from(blogPostsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(blogPostsTable.isFeatured), desc(blogPostsTable.createdAt))
    .limit(parseInt(limit, 10));

  res.json(posts);
});

router.get("/blog/:slug", async (req, res) => {
  const post = await db.query.blogPostsTable.findFirst({
    where: eq(blogPostsTable.slug, req.params.slug),
  });
  if (!post) return res.status(404).json({ error: "Not found" });

  const related = await db.select({
    id: blogPostsTable.id,
    slug: blogPostsTable.slug,
    titleAr: blogPostsTable.titleAr,
    excerpt: blogPostsTable.excerpt,
    coverImage: blogPostsTable.coverImage,
    date: blogPostsTable.date,
    readingMinutes: blogPostsTable.readingMinutes,
    categoryAr: blogPostsTable.categoryAr,
    isFeatured: blogPostsTable.isFeatured,
  }).from(blogPostsTable)
    .where(eq(blogPostsTable.categoryAr, post.categoryAr))
    .limit(3);

  res.json({
    ...post,
    relatedPosts: related.filter(r => r.id !== post.id),
  });
});

export default router;
