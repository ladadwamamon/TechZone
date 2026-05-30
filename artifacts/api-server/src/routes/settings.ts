import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { siteSettingsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/settings", async (_req, res) => {
  const rows = await db.select().from(siteSettingsTable);
  const map: Record<string, unknown> = {};
  for (const row of rows) map[row.key] = row.value;
  res.json(map);
});

export default router;
