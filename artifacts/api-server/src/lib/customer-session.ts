import { createHash, randomBytes } from "crypto";
import { db } from "@workspace/db";
import { customerSessionsTable, customersTable } from "@workspace/db";
import { eq, lt } from "drizzle-orm";

export const CUSTOMER_SESSION_COOKIE = "tz_customer_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createCustomerSession(
  customerId: string,
  meta: { userAgent?: string | null; ip?: string | null },
): Promise<{ token: string; expiresAt: Date }> {
  const token = randomBytes(32).toString("hex");
  const id = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(customerSessionsTable).values({
    id,
    customerId,
    expiresAt,
    userAgent: meta.userAgent ?? null,
    ip: meta.ip ?? null,
  });
  return { token, expiresAt };
}

export async function resolveCustomerSession(token: string) {
  const id = hashToken(token);
  const session = await db.query.customerSessionsTable.findFirst({
    where: eq(customerSessionsTable.id, id),
  });
  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await db.delete(customerSessionsTable).where(eq(customerSessionsTable.id, id));
    return null;
  }
  const customer = await db.query.customersTable.findFirst({
    where: eq(customersTable.id, session.customerId),
  });
  if (!customer || !customer.isActive) return null;
  return { session, customer };
}

export async function destroyCustomerSession(token: string): Promise<void> {
  const id = hashToken(token);
  await db.delete(customerSessionsTable).where(eq(customerSessionsTable.id, id));
}

export async function purgeExpiredCustomerSessions(): Promise<void> {
  await db.delete(customerSessionsTable).where(lt(customerSessionsTable.expiresAt, new Date()));
}

export const CUSTOMER_SESSION_TTL_MS = SESSION_TTL_MS;
