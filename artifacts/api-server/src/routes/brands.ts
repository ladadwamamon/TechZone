import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { brandsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/brands", async (_req, res) => {
  const brands = await db.select().from(brandsTable);
  res.json(brands);
});

router.get("/brands/:slug", async (req, res) => {
  const brand = await db.query.brandsTable.findFirst({
    where: eq(brandsTable.slug, req.params.slug),
  });
  if (!brand) return res.status(404).json({ error: "Not found" });
  res.json(brand);
});

export default router;
