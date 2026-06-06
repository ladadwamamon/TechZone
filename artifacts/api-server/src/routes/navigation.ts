import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { navItemsTable, customPagesTable } from "@workspace/db";
import { and, eq, asc } from "drizzle-orm";
import type { NavItem } from "@workspace/db";

const router: IRouter = Router();

function mapNavItem(n: NavItem) {
  return {
    id: n.id,
    label: n.label,
    href: n.href,
    location: n.location,
    parentId: n.parentId ?? null,
    sortOrder: n.sortOrder,
    isVisible: n.isVisible,
    opensNewTab: n.opensNewTab,
  };
}

// GET /nav-items?location=header|footer  (visible only)
router.get("/nav-items", async (req, res) => {
  const location = (req.query.location as string) || undefined;
  const conditions = [eq(navItemsTable.isVisible, true)];
  if (location === "header" || location === "footer") {
    conditions.push(eq(navItemsTable.location, location));
  }
  const rows = await db.select().from(navItemsTable)
    .where(and(...conditions))
    .orderBy(asc(navItemsTable.sortOrder));
  res.json(rows.map(mapNavItem));
});

// GET /pages/:slug  (published only)
router.get("/pages/:slug", async (req, res) => {
  const page = await db.query.customPagesTable.findFirst({
    where: eq(customPagesTable.slug, (req.params.slug as string).toLowerCase()),
  });
  if (!page || !page.isPublished) return res.status(404).json({ error: "الصفحة غير موجودة" });
  res.json({
    id: page.id,
    slug: page.slug,
    titleAr: page.titleAr,
    contentHtml: page.contentHtml,
    isPublished: page.isPublished,
    metaTitle: page.metaTitle ?? null,
    metaDescription: page.metaDescription ?? null,
    createdAt: page.createdAt.toISOString(),
    updatedAt: page.updatedAt.toISOString(),
  });
});

export default router;
