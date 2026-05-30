import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { siteSettingsTable } from "@workspace/db";
import { requireAuth, requirePermission } from "../../middlewares/auth";
import { writeAudit } from "../../lib/audit";

const router: IRouter = Router();

async function readAllSettings(): Promise<Record<string, unknown>> {
  const rows = await db.select().from(siteSettingsTable);
  const map: Record<string, unknown> = {};
  for (const row of rows) map[row.key] = row.value;
  return map;
}

router.get("/admin/settings", requireAuth, requirePermission("settings:write"), async (_req, res) => {
  res.json(await readAllSettings());
});

router.put("/admin/settings", requireAuth, requirePermission("settings:write"), async (req, res) => {
  const body = req.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({ error: "صيغة الإعدادات غير صالحة" });
  }
  const entries = Object.entries(body as Record<string, unknown>);
  const now = new Date();
  for (const [key, value] of entries) {
    await db.insert(siteSettingsTable).values({
      key,
      value: value as object,
      updatedAt: now,
      updatedBy: req.admin!.username,
    }).onConflictDoUpdate({
      target: siteSettingsTable.key,
      set: { value: value as object, updatedAt: now, updatedBy: req.admin!.username },
    });
  }
  await writeAudit(req, { action: "update", entityType: "site_settings", details: { keys: entries.map(([k]) => k) } });
  res.json(await readAllSettings());
});

export default router;
