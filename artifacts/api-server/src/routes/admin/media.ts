import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";
import { db } from "@workspace/db";
import { mediaTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { AdminCreateMediaBody, AdminUpdateMediaBody } from "@workspace/api-zod";
import { requireAuth, requirePermission } from "../../middlewares/auth";
import { writeAudit } from "../../lib/audit";

const router: IRouter = Router();

function mapMedia(m: typeof mediaTable.$inferSelect) {
  return {
    id: m.id,
    url: m.url,
    filename: m.filename,
    mimeType: m.mimeType ?? null,
    sizeBytes: m.sizeBytes ?? null,
    altText: m.altText ?? null,
    folder: m.folder,
    uploadedBy: m.uploadedBy ?? null,
    createdAt: m.createdAt.toISOString(),
  };
}

router.get("/admin/media", requireAuth, requirePermission("media:write"), async (req, res) => {
  const { folder } = req.query as Record<string, string>;
  const rows = await db.select().from(mediaTable)
    .where(folder ? eq(mediaTable.folder, folder) : undefined)
    .orderBy(desc(mediaTable.createdAt));
  res.json(rows.map(mapMedia));
});

router.post("/admin/media", requireAuth, requirePermission("media:write"), async (req, res) => {
  const parsed = AdminCreateMediaBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة", details: parsed.error.issues });
  const data = parsed.data;
  const id = randomUUID();
  const [created] = await db.insert(mediaTable).values({
    id,
    url: data.url,
    filename: data.filename,
    mimeType: data.mimeType ?? null,
    sizeBytes: data.sizeBytes ?? null,
    altText: data.altText ?? null,
    folder: data.folder ?? "general",
    uploadedBy: req.admin!.username,
  }).returning();
  await writeAudit(req, { action: "create", entityType: "media", entityId: id });
  res.status(201).json(mapMedia(created));
});

router.put("/admin/media/:id", requireAuth, requirePermission("media:write"), async (req, res) => {
  const parsed = AdminUpdateMediaBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة", details: parsed.error.issues });
  const existing = await db.query.mediaTable.findFirst({ where: eq(mediaTable.id, (req.params.id as string)) });
  if (!existing) return res.status(404).json({ error: "غير موجود" });
  const values: Record<string, unknown> = {};
  for (const key of ["url", "filename", "altText", "folder"] as const) {
    if (parsed.data[key] !== undefined) values[key] = parsed.data[key];
  }
  const [updated] = await db.update(mediaTable).set(values).where(eq(mediaTable.id, (req.params.id as string))).returning();
  await writeAudit(req, { action: "update", entityType: "media", entityId: (req.params.id as string) });
  res.json(mapMedia(updated));
});

router.delete("/admin/media/:id", requireAuth, requirePermission("media:write"), async (req, res) => {
  const existing = await db.query.mediaTable.findFirst({ where: eq(mediaTable.id, (req.params.id as string)) });
  if (!existing) return res.status(404).json({ error: "غير موجود" });
  await db.delete(mediaTable).where(eq(mediaTable.id, (req.params.id as string)));
  await writeAudit(req, { action: "delete", entityType: "media", entityId: (req.params.id as string) });
  res.json({ success: true, message: "تم الحذف" });
});

export default router;
