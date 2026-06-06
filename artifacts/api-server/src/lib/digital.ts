import { randomUUID } from "crypto";
import { db, digitalCodesTable, productsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type DbOrTx = typeof db | Tx;

export type DeliveredCode = {
  productId: string;
  nameAr: string;
  secret: string;
};

export type OrderItemShape = {
  productId: string;
  nameAr: string;
  quantity: number;
};

/**
 * Recompute a digital product's stock to equal the number of available codes.
 * No-op for products that are not digital.
 */
export async function syncDigitalStock(client: DbOrTx, productId: string): Promise<void> {
  const product = await client.query.productsTable.findFirst({
    where: eq(productsTable.id, productId),
  });
  if (!product || product.productType !== "digital") return;

  const [{ count }] = await client
    .select({ count: sql<number>`count(*)` })
    .from(digitalCodesTable)
    .where(sql`${digitalCodesTable.productId} = ${productId} AND ${digitalCodesTable.status} = 'available'`);

  await client
    .update(productsTable)
    .set({ stock: Number(count) })
    .where(eq(productsTable.id, productId));
}

/**
 * Atomically allocate digital codes for the digital items of an order.
 * Uses SELECT ... FOR UPDATE SKIP LOCKED to avoid double-selling a code under
 * concurrent checkouts. Allocated codes are marked sold and linked to the order.
 * Returns the codes that were allocated during this call.
 */
export async function allocateCodesForOrder(
  tx: Tx,
  orderId: string,
  items: OrderItemShape[],
): Promise<DeliveredCode[]> {
  const delivered: DeliveredCode[] = [];
  const touchedProductIds = new Set<string>();

  // Aggregate desired quantity per product so an order with the same product
  // across multiple line items is handled once.
  const desiredByProduct = new Map<string, number>();
  for (const item of items) {
    const qty = Math.max(1, Math.floor(item.quantity));
    desiredByProduct.set(item.productId, (desiredByProduct.get(item.productId) ?? 0) + qty);
  }

  for (const [productId, totalQty] of desiredByProduct) {
    const product = await tx.query.productsTable.findFirst({
      where: eq(productsTable.id, productId),
    });
    if (!product || product.productType !== "digital") continue;

    // Idempotency guard: never allocate more than the purchased quantity, even
    // if this runs again (e.g. admin fulfill after checkout already allocated).
    const [{ count: alreadyAllocated }] = await tx
      .select({ count: sql<number>`count(*)` })
      .from(digitalCodesTable)
      .where(
        sql`${digitalCodesTable.orderId} = ${orderId} AND ${digitalCodesTable.productId} = ${productId} AND ${digitalCodesTable.status} = 'sold'`,
      );
    const remaining = totalQty - Number(alreadyAllocated);
    if (remaining <= 0) continue;

    const rows = await tx.execute(sql`
      SELECT id, secret FROM digital_codes
      WHERE product_id = ${productId} AND status = 'available'
      ORDER BY created_at ASC
      LIMIT ${remaining}
      FOR UPDATE SKIP LOCKED
    `);
    const picked = (rows.rows ?? []) as Array<{ id: string; secret: string }>;

    for (const code of picked) {
      await tx
        .update(digitalCodesTable)
        .set({ status: "sold", orderId, soldAt: new Date() })
        .where(eq(digitalCodesTable.id, code.id));
      delivered.push({ productId, nameAr: product.nameAr, secret: code.secret });
    }
    touchedProductIds.add(productId);
  }

  for (const productId of touchedProductIds) {
    await syncDigitalStock(tx, productId);
  }

  return delivered;
}

/**
 * Load delivered (sold) codes already attached to an order, joined with product
 * names for display.
 */
export async function loadDeliveredCodes(client: DbOrTx, orderId: string): Promise<DeliveredCode[]> {
  const rows = await client
    .select({
      productId: digitalCodesTable.productId,
      secret: digitalCodesTable.secret,
      nameAr: productsTable.nameAr,
    })
    .from(digitalCodesTable)
    .innerJoin(productsTable, eq(digitalCodesTable.productId, productsTable.id))
    .where(eq(digitalCodesTable.orderId, orderId));
  return rows.map((r) => ({ productId: r.productId, nameAr: r.nameAr, secret: r.secret }));
}

export function newCodeId(): string {
  return `dc-${randomUUID().slice(0, 8)}`;
}
