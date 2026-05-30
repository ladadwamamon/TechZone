import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";
import { db } from "@workspace/db";
import { blogPostsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { AdminCreateBlogPostBody, AdminUpdateBlogPostBody } from "@workspace/api-zod";
import { requireAuth, requirePermission } from "../../middlewares/auth";
import { writeAudit } from "../../lib/audit";

const router: IRouter = Router();

function mapPost(p: typeof blogPostsTable.$inferSelect) {
  return {
    id: p.id,
    slug: p.slug,
    titleAr: p.titleAr,
    excerpt: p.excerpt,
    contentAr: p.contentAr,
    coverImage: p.coverImage,
    date: p.date,
    readingMinutes: p.readingMinutes,
    categoryAr: p.categoryAr,
    isFeatured: p.isFeatured,
    authorName: p.authorName,
    authorAvatar: p.authorAvatar ?? null,
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/admin/blog", requireAuth, requirePermission("blog:write"), async (_req, res) => {
  const rows = await db.select().from(blogPostsTable).orderBy(desc(blogPostsTable.createdAt));
  res.json(rows.map(mapPost));
});

router.get("/admin/blog/:id", requireAuth, requirePermission("blog:write"), async (req, res) => {
  const post = await db.query.blogPostsTable.findFirst({
    where: eq(blogPostsTable.id, req.params.id as string),
  });
  if (!post) return res.status(404).json({ error: "غير موجود" });
  res.json(mapPost(post));
});

router.post("/admin/blog", requireAuth, requirePermission("blog:write"), async (req, res) => {
  const parsed = AdminCreateBlogPostBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة", details: parsed.error.issues });
  const data = parsed.data;
  const id = data.id ?? `post-${randomUUID().slice(0, 8)}`;
  const [created] = await db.insert(blogPostsTable).values({
    id,
    slug: data.slug,
    titleAr: data.titleAr,
    excerpt: data.excerpt,
    contentAr: data.contentAr,
    coverImage: data.coverImage,
    date: data.date,
    readingMinutes: data.readingMinutes ?? 5,
    categoryAr: data.categoryAr,
    isFeatured: data.isFeatured ?? false,
    authorName: data.authorName ?? "فريق تيك زون",
    authorAvatar: data.authorAvatar ?? null,
  }).returning();
  await writeAudit(req, { action: "create", entityType: "blog_post", entityId: id });
  res.status(201).json(mapPost(created));
});

router.put("/admin/blog/:id", requireAuth, requirePermission("blog:write"), async (req, res) => {
  const parsed = AdminUpdateBlogPostBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة", details: parsed.error.issues });
  const existing = await db.query.blogPostsTable.findFirst({ where: eq(blogPostsTable.id, (req.params.id as string)) });
  if (!existing) return res.status(404).json({ error: "غير موجود" });

  const values: Record<string, unknown> = {};
  for (const key of ["slug", "titleAr", "excerpt", "contentAr", "coverImage", "date", "readingMinutes", "categoryAr", "isFeatured", "authorName", "authorAvatar"] as const) {
    if (parsed.data[key] !== undefined) values[key] = parsed.data[key];
  }
  const [updated] = await db.update(blogPostsTable).set(values).where(eq(blogPostsTable.id, (req.params.id as string))).returning();
  await writeAudit(req, { action: "update", entityType: "blog_post", entityId: (req.params.id as string) });
  res.json(mapPost(updated));
});

router.delete("/admin/blog/:id", requireAuth, requirePermission("blog:write"), async (req, res) => {
  const existing = await db.query.blogPostsTable.findFirst({ where: eq(blogPostsTable.id, (req.params.id as string)) });
  if (!existing) return res.status(404).json({ error: "غير موجود" });
  await db.delete(blogPostsTable).where(eq(blogPostsTable.id, (req.params.id as string)));
  await writeAudit(req, { action: "delete", entityType: "blog_post", entityId: (req.params.id as string) });
  res.json({ success: true, message: "تم الحذف" });
});

export default router;
