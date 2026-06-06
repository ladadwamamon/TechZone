import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";
import { db } from "@workspace/db";
import { navItemsTable, customPagesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import {
  AdminCreateNavItemBody,
  AdminUpdateNavItemBody,
  AdminReorderNavItemsBody,
  AdminCreatePageBody,
  AdminUpdatePageBody,
} from "@workspace/api-zod";
import { requireAuth, requirePermission } from "../../middlewares/auth";
import { writeAudit } from "../../lib/audit";
import type { NavItem, CustomPage } from "@workspace/db";

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

function mapPage(p: CustomPage) {
  return {
    id: p.id,
    slug: p.slug,
    titleAr: p.titleAr,
    contentHtml: p.contentHtml,
    isPublished: p.isPublished,
    metaTitle: p.metaTitle ?? null,
    metaDescription: p.metaDescription ?? null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

// ---------- Navigation items ----------

router.get("/admin/nav-items", requireAuth, requirePermission("navigation:write"), async (_req, res) => {
  const rows = await db.select().from(navItemsTable).orderBy(asc(navItemsTable.sortOrder));
  res.json(rows.map(mapNavItem));
});

router.post("/admin/nav-items", requireAuth, requirePermission("navigation:write"), async (req, res) => {
  const parsed = AdminCreateNavItemBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة", details: parsed.error.issues });
  const data = parsed.data;
  const id = `nav-${randomUUID().slice(0, 8)}`;
  const [created] = await db.insert(navItemsTable).values({
    id,
    label: data.label,
    href: data.href,
    location: data.location ?? "header",
    parentId: data.parentId ?? null,
    sortOrder: data.sortOrder ?? 0,
    isVisible: data.isVisible ?? true,
    opensNewTab: data.opensNewTab ?? false,
  }).returning();
  await writeAudit(req, { action: "create", entityType: "nav_item", entityId: id, details: { label: data.label } });
  res.status(201).json(mapNavItem(created));
});

router.post("/admin/nav-items/reorder", requireAuth, requirePermission("navigation:write"), async (req, res) => {
  const parsed = AdminReorderNavItemsBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة", details: parsed.error.issues });
  await db.transaction(async (tx) => {
    for (const item of parsed.data.items) {
      await tx.update(navItemsTable)
        .set({ sortOrder: item.sortOrder, parentId: item.parentId ?? null })
        .where(eq(navItemsTable.id, item.id));
    }
  });
  await writeAudit(req, { action: "reorder", entityType: "nav_item", entityId: "*", details: { count: parsed.data.items.length } });
  res.json({ success: true, message: "تم الترتيب" });
});

router.put("/admin/nav-items/:id", requireAuth, requirePermission("navigation:write"), async (req, res) => {
  const parsed = AdminUpdateNavItemBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة", details: parsed.error.issues });
  const existing = await db.query.navItemsTable.findFirst({ where: eq(navItemsTable.id, req.params.id as string) });
  if (!existing) return res.status(404).json({ error: "غير موجود" });

  const data = parsed.data;
  const values: Record<string, unknown> = {};
  if (data.label !== undefined) values.label = data.label;
  if (data.href !== undefined) values.href = data.href;
  if (data.location !== undefined) values.location = data.location;
  if (data.parentId !== undefined) values.parentId = data.parentId;
  if (data.sortOrder !== undefined) values.sortOrder = data.sortOrder;
  if (data.isVisible !== undefined) values.isVisible = data.isVisible;
  if (data.opensNewTab !== undefined) values.opensNewTab = data.opensNewTab;

  const [updated] = await db.update(navItemsTable).set(values).where(eq(navItemsTable.id, req.params.id as string)).returning();
  await writeAudit(req, { action: "update", entityType: "nav_item", entityId: req.params.id as string });
  res.json(mapNavItem(updated));
});

router.delete("/admin/nav-items/:id", requireAuth, requirePermission("navigation:write"), async (req, res) => {
  const existing = await db.query.navItemsTable.findFirst({ where: eq(navItemsTable.id, req.params.id as string) });
  if (!existing) return res.status(404).json({ error: "غير موجود" });
  await db.delete(navItemsTable).where(eq(navItemsTable.id, req.params.id as string));
  await writeAudit(req, { action: "delete", entityType: "nav_item", entityId: req.params.id as string, details: { label: existing.label } });
  res.json({ success: true, message: "تم الحذف" });
});

// ---------- Custom pages ----------

router.get("/admin/pages", requireAuth, requirePermission("pages:write"), async (_req, res) => {
  const rows = await db.select().from(customPagesTable).orderBy(asc(customPagesTable.titleAr));
  res.json(rows.map(mapPage));
});

router.post("/admin/pages", requireAuth, requirePermission("pages:write"), async (req, res) => {
  const parsed = AdminCreatePageBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة", details: parsed.error.issues });
  const data = parsed.data;
  const slug = data.slug.trim().toLowerCase();

  const existing = await db.query.customPagesTable.findFirst({ where: eq(customPagesTable.slug, slug) });
  if (existing) return res.status(409).json({ error: "الرابط مستخدم مسبقاً" });

  const id = `page-${randomUUID().slice(0, 8)}`;
  const [created] = await db.insert(customPagesTable).values({
    id,
    slug,
    titleAr: data.titleAr,
    contentHtml: data.contentHtml ?? "",
    isPublished: data.isPublished ?? true,
    metaTitle: data.metaTitle ?? null,
    metaDescription: data.metaDescription ?? null,
  }).returning();
  await writeAudit(req, { action: "create", entityType: "custom_page", entityId: id, details: { slug } });
  res.status(201).json(mapPage(created));
});

router.put("/admin/pages/:id", requireAuth, requirePermission("pages:write"), async (req, res) => {
  const parsed = AdminUpdatePageBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة", details: parsed.error.issues });
  const existing = await db.query.customPagesTable.findFirst({ where: eq(customPagesTable.id, req.params.id as string) });
  if (!existing) return res.status(404).json({ error: "غير موجود" });

  const data = parsed.data;
  const values: Record<string, unknown> = { updatedAt: new Date() };
  if (data.slug !== undefined) {
    const slug = data.slug.trim().toLowerCase();
    const clash = await db.query.customPagesTable.findFirst({ where: eq(customPagesTable.slug, slug) });
    if (clash && clash.id !== existing.id) return res.status(409).json({ error: "الرابط مستخدم مسبقاً" });
    values.slug = slug;
  }
  if (data.titleAr !== undefined) values.titleAr = data.titleAr;
  if (data.contentHtml !== undefined) values.contentHtml = data.contentHtml;
  if (data.isPublished !== undefined) values.isPublished = data.isPublished;
  if (data.metaTitle !== undefined) values.metaTitle = data.metaTitle;
  if (data.metaDescription !== undefined) values.metaDescription = data.metaDescription;

  const [updated] = await db.update(customPagesTable).set(values).where(eq(customPagesTable.id, req.params.id as string)).returning();
  await writeAudit(req, { action: "update", entityType: "custom_page", entityId: req.params.id as string });
  res.json(mapPage(updated));
});

router.delete("/admin/pages/:id", requireAuth, requirePermission("pages:write"), async (req, res) => {
  const existing = await db.query.customPagesTable.findFirst({ where: eq(customPagesTable.id, req.params.id as string) });
  if (!existing) return res.status(404).json({ error: "غير موجود" });
  await db.delete(customPagesTable).where(eq(customPagesTable.id, req.params.id as string));
  await writeAudit(req, { action: "delete", entityType: "custom_page", entityId: req.params.id as string, details: { slug: existing.slug } });
  res.json({ success: true, message: "تم الحذف" });
});

export default router;
