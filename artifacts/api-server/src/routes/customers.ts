import { Router, type IRouter, type Response } from "express";
import { randomUUID } from "crypto";
import { db } from "@workspace/db";
import { customersTable, ordersTable, customerWishlistTable, productsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { CustomerRegisterBody, CustomerLoginBody, CustomerUpdateProfileBody, CustomerWishlistAddBody } from "@workspace/api-zod";
import { hashPassword, verifyPassword } from "../lib/password";
import {
  createCustomerSession,
  destroyCustomerSession,
  resolveCustomerSession,
  CUSTOMER_SESSION_COOKIE,
  CUSTOMER_SESSION_TTL_MS,
} from "../lib/customer-session";
import { requireCustomer } from "../middlewares/customer-auth";
import { mapOrderWithCodes } from "./admin/helpers";
import { rateLimit, recordLoginFailure, recordLoginSuccess, isIpBlocked } from "../middlewares/rate-limit";
import type { Customer } from "@workspace/db";

const router: IRouter = Router();

const isProduction = process.env.NODE_ENV === "production";

function setCustomerCookie(res: Response, token: string): void {
  res.cookie(CUSTOMER_SESSION_COOKIE, token, {
    httpOnly: true,
    signed: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: CUSTOMER_SESSION_TTL_MS,
    path: "/",
  });
}

function clearCustomerCookie(res: Response): void {
  res.clearCookie(CUSTOMER_SESSION_COOKIE, {
    httpOnly: true,
    signed: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
  });
}

function toPublic(c: Customer) {
  return {
    id: c.id,
    email: c.email,
    fullName: c.fullName,
    phone: c.phone ?? null,
    city: c.city ?? null,
    address: c.address ?? null,
    isActive: c.isActive,
    lastLoginAt: c.lastLoginAt ? c.lastLoginAt.toISOString() : null,
    createdAt: c.createdAt.toISOString(),
  };
}

// POST /customers/register
router.post("/customers/register", rateLimit({ max: 5, windowMs: 60_000 }), async (req, res) => {
  const ip = req.ip ?? "unknown";
  if (isIpBlocked(ip)) {
    return res.status(429).json({ error: "تم حظر الإيبي التالي ملائمياً بسبب الإجراءات المتكررة. يرجى الانتظار 5 دقائق." });
  }
  const parsed = CustomerRegisterBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة", details: parsed.error.issues });

  const email = parsed.data.email.trim().toLowerCase();
  const existing = await db.query.customersTable.findFirst({ where: eq(customersTable.email, email) });
  if (existing) return res.status(409).json({ error: "هذا البريد الإلكتروني مسجّل مسبقاً" });

  const passwordHash = await hashPassword(parsed.data.password);
  const id = `cust-${randomUUID().slice(0, 8)}`;
  const [created] = await db.insert(customersTable).values({
    id,
    email,
    fullName: parsed.data.fullName,
    phone: parsed.data.phone ?? null,
    passwordHash,
    isActive: true,
  }).returning();

  const { token } = await createCustomerSession(created.id, {
    userAgent: req.headers["user-agent"] ?? null,
    ip: req.ip ?? null,
  });
  setCustomerCookie(res, token);
  req.log.info({ customerId: id }, "Customer registered");
  res.status(201).json(toPublic(created));
});

// POST /customers/login
router.post("/customers/login", rateLimit({ max: 10, windowMs: 60_000 }), async (req, res) => {
  const ip = req.ip ?? "unknown";
  if (isIpBlocked(ip)) {
    return res.status(429).json({ error: "تم حظر الإيبي التالي ملائمياً بسبب الإجراءات المتكررة. يرجى الانتظار 5 دقائق." });
  }

  const parsed = CustomerLoginBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة" });

  const email = parsed.data.email.trim().toLowerCase();
  const customer = await db.query.customersTable.findFirst({ where: eq(customersTable.email, email) });
  if (!customer || !customer.isActive) {
    recordLoginFailure(ip);
    return res.status(401).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
  }
  const valid = await verifyPassword(parsed.data.password, customer.passwordHash);
  if (!valid) {
    recordLoginFailure(ip);
    return res.status(401).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
  }

  recordLoginSuccess(ip);

  const { token } = await createCustomerSession(customer.id, {
    userAgent: req.headers["user-agent"] ?? null,
    ip: req.ip ?? null,
  });
  setCustomerCookie(res, token);
  await db.update(customersTable).set({ lastLoginAt: new Date() }).where(eq(customersTable.id, customer.id));
  req.log.info({ customerId: customer.id }, "Customer logged in");
  res.json(toPublic(customer));
});

// POST /customers/logout
router.post("/customers/logout", async (req, res) => {
  const token = req.signedCookies?.[CUSTOMER_SESSION_COOKIE];
  if (typeof token === "string" && token.length > 0) {
    await destroyCustomerSession(token);
  }
  clearCustomerCookie(res);
  res.json({ success: true, message: "تم تسجيل الخروج" });
});

// GET /customers/me
router.get("/customers/me", async (req, res) => {
  const token = req.signedCookies?.[CUSTOMER_SESSION_COOKIE];
  if (typeof token !== "string" || token.length === 0) {
    return res.status(401).json({ error: "غير مصرّح" });
  }
  const resolved = await resolveCustomerSession(token);
  if (!resolved) return res.status(401).json({ error: "غير مصرّح" });
  res.json(toPublic(resolved.customer));
});

// PUT /customers/me
router.put("/customers/me", requireCustomer, async (req, res) => {
  const parsed = CustomerUpdateProfileBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة", details: parsed.error.issues });

  const values: Record<string, unknown> = {};
  for (const key of ["fullName", "phone", "city", "address"] as const) {
    if (parsed.data[key] !== undefined) values[key] = parsed.data[key];
  }
  const [updated] = await db.update(customersTable).set(values).where(eq(customersTable.id, req.customer!.id)).returning();
  res.json(toPublic(updated));
});

// GET /customers/orders
router.get("/customers/orders", requireCustomer, async (req, res) => {
  const rows = await db.select().from(ordersTable)
    .where(eq(ordersTable.customerId, req.customer!.id))
    .orderBy(desc(ordersTable.createdAt));
  res.json(await Promise.all(rows.map(mapOrderWithCodes)));
});

async function listWishlistIds(customerId: string): Promise<string[]> {
  const rows = await db
    .select({ productId: customerWishlistTable.productId })
    .from(customerWishlistTable)
    .where(eq(customerWishlistTable.customerId, customerId))
    .orderBy(desc(customerWishlistTable.createdAt));
  return rows.map((r) => r.productId);
}

// GET /customers/wishlist
router.get("/customers/wishlist", requireCustomer, async (req, res) => {
  res.json({ productIds: await listWishlistIds(req.customer!.id) });
});

// POST /customers/wishlist
router.post("/customers/wishlist", requireCustomer, async (req, res) => {
  const parsed = CustomerWishlistAddBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة", details: parsed.error.issues });

  const customerId = req.customer!.id;
  const { productId } = parsed.data;

  const [product] = await db.select({ id: productsTable.id }).from(productsTable).where(eq(productsTable.id, productId));
  if (!product) return res.status(404).json({ error: "المنتج غير موجود" });

  await db
    .insert(customerWishlistTable)
    .values({ id: randomUUID(), customerId, productId })
    .onConflictDoNothing({ target: [customerWishlistTable.customerId, customerWishlistTable.productId] });

  res.json({ productIds: await listWishlistIds(customerId) });
});

// DELETE /customers/wishlist/:productId
router.delete("/customers/wishlist/:productId", requireCustomer, async (req, res) => {
  const customerId = req.customer!.id;
  const productId = String(req.params.productId);
  await db
    .delete(customerWishlistTable)
    .where(and(eq(customerWishlistTable.customerId, customerId), eq(customerWishlistTable.productId, productId)));
  res.json({ productIds: await listWishlistIds(customerId) });
});

export default router;
