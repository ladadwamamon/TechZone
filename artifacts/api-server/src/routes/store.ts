import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { productsTable, brandsTable, categoriesTable, ordersTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/store/summary", async (_req, res) => {
  const [products, brands, categories, orders] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(productsTable),
    db.select({ count: sql<number>`count(*)` }).from(brandsTable),
    db.select({ count: sql<number>`count(*)` }).from(categoriesTable),
    db.select({ count: sql<number>`count(*)` }).from(ordersTable),
  ]);

  res.json({
    totalProducts: Number(products[0]?.count ?? 0),
    totalBrands: Number(brands[0]?.count ?? 0),
    totalCategories: Number(categories[0]?.count ?? 0),
    totalOrders: Number(orders[0]?.count ?? 0),
    freeShippingThreshold: 500,
  });
});

export default router;
