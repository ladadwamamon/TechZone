import type { Request, RequestHandler } from "express";
import { CUSTOMER_SESSION_COOKIE, resolveCustomerSession } from "../lib/customer-session";

function readCustomerToken(req: Request): string | null {
  const signed = req.signedCookies?.[CUSTOMER_SESSION_COOKIE];
  if (typeof signed === "string" && signed.length > 0) return signed;
  return null;
}

export const requireCustomer: RequestHandler = async (req, res, next) => {
  const token = readCustomerToken(req);
  if (!token) {
    res.status(401).json({ error: "غير مصرّح. يجب تسجيل الدخول." });
    return;
  }
  const resolved = await resolveCustomerSession(token);
  if (!resolved) {
    res.status(401).json({ error: "انتهت الجلسة. يرجى تسجيل الدخول مجدداً." });
    return;
  }
  req.customer = { id: resolved.customer.id, email: resolved.customer.email, fullName: resolved.customer.fullName };
  next();
};

export async function optionalCustomerId(req: Request): Promise<string | null> {
  const token = readCustomerToken(req);
  if (!token) return null;
  const resolved = await resolveCustomerSession(token);
  return resolved?.customer.id ?? null;
}
