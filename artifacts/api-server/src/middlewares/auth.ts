import type { Request, RequestHandler } from "express";
import { SESSION_COOKIE, resolveSession } from "../lib/session";
import { hasPermission, type Permission } from "../lib/rbac";

function readSessionToken(req: Request): string | null {
  const signed = req.signedCookies?.[SESSION_COOKIE];
  if (typeof signed === "string" && signed.length > 0) return signed;
  return null;
}

export const requireAuth: RequestHandler = async (req, res, next) => {
  const token = readSessionToken(req);
  if (!token) {
    res.status(401).json({ error: "غير مصرّح. يجب تسجيل الدخول." });
    return;
  }
  const resolved = await resolveSession(token);
  if (!resolved) {
    res.status(401).json({ error: "انتهت الجلسة. يرجى تسجيل الدخول مجدداً." });
    return;
  }
  req.admin = {
    id: resolved.admin.id,
    username: resolved.admin.username,
    fullName: resolved.admin.fullName,
    role: resolved.admin.role,
  };
  next();
}

export function requirePermission(permission: Permission): RequestHandler {
  return (req, res, next) => {
    if (!req.admin) {
      res.status(401).json({ error: "غير مصرّح. يجب تسجيل الدخول." });
      return;
    }
    if (!hasPermission(req.admin.role, permission)) {
      res.status(403).json({ error: "ليس لديك صلاحية لتنفيذ هذه العملية." });
      return;
    }
    next();
  };
}
