import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { digitalCodesTable, productsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { AdminAddDigitalCodesBody } from "@workspace/api-zod";
import { requireAuth, requirePermission } from "../../middlewares/auth";
import { writeAudit } from "../../lib/audit";
import { syncDigitalStock, newCodeId } from "../../lib/digital";
import type { DigitalCode } from "@workspace/db";

const router: IRouter = Router();

function mapCode(c: DigitalCode) {
  return {
    id: c.id,
    productId: c.productId,
    secret: c.secret,
    status: c.status,
    orderId: c.orderId ?? null,
    soldAt: c.soldAt ? c.soldAt.toISOString() : null,
    createdAt: c.createdAt.toISOString(),
  };
}

async function statsFor(productId: string) {
  const rows = await db
    .select({ status: digitalCodesTable.status, count: sql<number>`count(*)` })
    .from(digitalCodesTable)
    .where(eq(digitalCodesTable.productId, productId))
    .groupBy(digitalCodesTable.status);
  let available = 0;
  let sold = 0;
  for (const r of rows) {
    if (r.status === "available") available = Number(r.count);
    else if (r.status === "sold") sold = Number(r.count);
  }
  return { productId, available, sold, total: available + sold };
}

// GET /admin/products/:id/codes
router.get("/admin/products/:id/codes", requireAuth, requirePermission("digital_codes:write"), async (req, res) => {
  const rows = await db
    .select()
    .from(digitalCodesTable)
    .where(eq(digitalCodesTable.productId, req.params.id as string))
    .orderBy(desc(digitalCodesTable.createdAt));
  res.json(rows.map(mapCode));
});

// GET /admin/products/:id/codes/stats
router.get("/admin/products/:id/codes/stats", requireAuth, requirePermission("digital_codes:write"), async (req, res) => {
  res.json(await statsFor(req.params.id as string));
});

// POST /admin/products/:id/codes  (bulk add)
router.post("/admin/products/:id/codes", requireAuth, requirePermission("digital_codes:write"), async (req, res) => {
  const productId = req.params.id as string;
  const parsed = AdminAddDigitalCodesBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة", details: parsed.error.issues });

  const product = await db.query.productsTable.findFirst({ where: eq(productsTable.id, productId) });
  if (!product) return res.status(404).json({ error: "المنتج غير موجود" });

  const secrets = parsed.data.secrets
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (secrets.length === 0) return res.status(400).json({ error: "لا توجد أكواد صالحة" });

  await db.insert(digitalCodesTable).values(
    secrets.map((secret) => ({ id: newCodeId(), productId, secret, status: "available" as const })),
  );
  await syncDigitalStock(db, productId);
  await writeAudit(req, { action: "create", entityType: "digital_code", entityId: productId, details: { added: secrets.length } });

  const stats = await statsFor(productId);
  res.status(201).json({ ...stats, added: secrets.length });
});

// DELETE /admin/digital-codes/:codeId  (only unsold)
router.delete("/admin/digital-codes/:codeId", requireAuth, requirePermission("digital_codes:write"), async (req, res) => {
  const code = await db.query.digitalCodesTable.findFirst({ where: eq(digitalCodesTable.id, req.params.codeId as string) });
  if (!code) return res.status(404).json({ error: "غير موجود" });
  if (code.status === "sold") return res.status(409).json({ error: "لا يمكن حذف كود مُباع" });

  await db.delete(digitalCodesTable).where(eq(digitalCodesTable.id, code.id));
  await syncDigitalStock(db, code.productId);
  await writeAudit(req, { action: "delete", entityType: "digital_code", entityId: code.id });
  res.json({ success: true, message: "تم الحذف" });
});

export default router;
