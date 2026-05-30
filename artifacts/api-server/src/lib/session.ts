import { createHash, randomBytes } from "crypto";
import { db } from "@workspace/db";
import { adminSessionsTable, adminAccountsTable } from "@workspace/db";
import { eq, lt } from "drizzle-orm";

export const SESSION_COOKIE = "tz_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(
  adminId: string,
  meta: { userAgent?: string | null; ip?: string | null },
): Promise<{ token: string; expiresAt: Date }> {
  const token = randomBytes(32).toString("hex");
  const id = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(adminSessionsTable).values({
    id,
    adminId,
    expiresAt,
    userAgent: meta.userAgent ?? null,
    ip: meta.ip ?? null,
  });
  return { token, expiresAt };
}

export async function resolveSession(token: string) {
  const id = hashToken(token);
  const session = await db.query.adminSessionsTable.findFirst({
    where: eq(adminSessionsTable.id, id),
  });
  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await db.delete(adminSessionsTable).where(eq(adminSessionsTable.id, id));
    return null;
  }
  const admin = await db.query.adminAccountsTable.findFirst({
    where: eq(adminAccountsTable.id, session.adminId),
  });
  if (!admin || !admin.isActive) return null;
  return { session, admin };
}

export async function destroySession(token: string): Promise<void> {
  const id = hashToken(token);
  await db.delete(adminSessionsTable).where(eq(adminSessionsTable.id, id));
}

export async function destroyAllSessionsForAdmin(adminId: string): Promise<void> {
  await db.delete(adminSessionsTable).where(eq(adminSessionsTable.adminId, adminId));
}

export async function purgeExpiredSessions(): Promise<void> {
  await db.delete(adminSessionsTable).where(lt(adminSessionsTable.expiresAt, new Date()));
}
