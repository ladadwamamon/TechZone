import { Router, type IRouter, type Response } from "express";
import { randomUUID } from "crypto";
import { db } from "@workspace/db";
import { adminAccountsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { AdminLoginBody, SetupFirstAdminBody } from "@workspace/api-zod";
import { hashPassword, verifyPassword } from "../../lib/password";
import { createSession, destroySession, SESSION_COOKIE } from "../../lib/session";
import { permissionsForRole } from "../../lib/rbac";
import { requireAuth } from "../../middlewares/auth";
import type { AdminAccount } from "@workspace/db";

const router: IRouter = Router();

const isProduction = process.env.NODE_ENV === "production";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function setSessionCookie(res: Response, token: string): void {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    signed: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: SESSION_TTL_MS,
    path: "/",
  });
}

function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    signed: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
  });
}

function toPublic(a: AdminAccount) {
  return {
    id: a.id,
    username: a.username,
    fullName: a.fullName,
    email: a.email ?? null,
    role: a.role,
    isActive: a.isActive,
    lastLoginAt: a.lastLoginAt ? a.lastLoginAt.toISOString() : null,
    createdAt: a.createdAt.toISOString(),
  };
}

// POST /admin/auth/setup — create first super-admin only when none exist
router.post("/admin/auth/setup", async (req, res) => {
  const parsed = SetupFirstAdminBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة" });

  const existing = await db.select({ count: sql<number>`count(*)` }).from(adminAccountsTable);
  if (Number(existing[0]?.count ?? 0) > 0) {
    return res.status(403).json({ error: "تم إعداد الحساب الإداري مسبقاً" });
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const id = randomUUID();
  const [created] = await db.insert(adminAccountsTable).values({
    id,
    username: parsed.data.username,
    fullName: parsed.data.fullName,
    email: parsed.data.email ?? null,
    passwordHash,
    role: "super_admin",
    isActive: true,
  }).returning();

  req.log.info({ adminId: id }, "First super-admin created");
  res.status(201).json(toPublic(created));
});

// POST /admin/auth/login
router.post("/admin/auth/login", async (req, res) => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة" });

  const admin = await db.query.adminAccountsTable.findFirst({
    where: eq(adminAccountsTable.username, parsed.data.username),
  });

  if (!admin || !admin.isActive) {
    return res.status(401).json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" });
  }

  const valid = await verifyPassword(parsed.data.password, admin.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" });
  }

  const { token } = await createSession(admin.id, {
    userAgent: req.headers["user-agent"] ?? null,
    ip: req.ip ?? null,
  });
  setSessionCookie(res, token);

  await db.update(adminAccountsTable)
    .set({ lastLoginAt: new Date() })
    .where(eq(adminAccountsTable.id, admin.id));

  req.log.info({ adminId: admin.id }, "Admin logged in");

  res.json({
    admin: toPublic(admin),
    permissions: permissionsForRole(admin.role),
  });
});

// POST /admin/auth/logout
router.post("/admin/auth/logout", async (req, res) => {
  const token = req.signedCookies?.[SESSION_COOKIE];
  if (typeof token === "string" && token.length > 0) {
    await destroySession(token);
  }
  clearSessionCookie(res);
  res.json({ success: true, message: "تم تسجيل الخروج" });
});

// GET /admin/auth/me
router.get("/admin/auth/me", requireAuth, async (req, res) => {
  const admin = await db.query.adminAccountsTable.findFirst({
    where: eq(adminAccountsTable.id, req.admin!.id),
  });
  if (!admin) return res.status(401).json({ error: "غير مصرّح" });
  res.json({
    admin: toPublic(admin),
    permissions: permissionsForRole(admin.role),
  });
});

export default router;
