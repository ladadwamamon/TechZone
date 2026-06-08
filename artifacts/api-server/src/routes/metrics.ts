import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";
import { db, webVitalsTable } from "@workspace/db";
import { ReportWebVitalsBody } from "@workspace/api-zod";

const router: IRouter = Router();

const ALLOWED_METRICS = new Set(["LCP", "CLS", "INP", "FCP", "TTFB", "FID"]);
const MAX_VALUE = 3_600_000;

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 60;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_MAX;
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of hits) {
    if (now > entry.resetAt) hits.delete(ip);
  }
}, RATE_WINDOW_MS).unref();

router.post("/metrics/web-vitals", async (req, res) => {
  const ip = req.ip ?? "unknown";
  if (rateLimited(ip)) {
    return res.status(429).json({ error: "طلبات كثيرة جداً" });
  }

  const parsed = ReportWebVitalsBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة" });

  const { metric, value, rating, path } = parsed.data;
  if (!ALLOWED_METRICS.has(metric) || !Number.isFinite(value) || value < 0 || value > MAX_VALUE) {
    return res.status(400).json({ error: "قياس غير صالح" });
  }

  await db.insert(webVitalsTable).values({
    id: randomUUID(),
    metric,
    value,
    rating: rating ?? null,
    path: path ? path.slice(0, 256) : null,
  });

  res.json({ success: true, message: "تم التسجيل" });
});

export default router;
