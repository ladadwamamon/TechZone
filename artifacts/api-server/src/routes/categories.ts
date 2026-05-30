import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { categoriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/categories", async (_req, res) => {
  const categories = await db.select().from(categoriesTable);
  res.json(categories);
});

router.get("/categories/:slug", async (req, res) => {
  const category = await db.query.categoriesTable.findFirst({
    where: eq(categoriesTable.slug, req.params.slug),
  });
  if (!category) return res.status(404).json({ error: "Not found" });
  res.json(category);
});

export default router;
