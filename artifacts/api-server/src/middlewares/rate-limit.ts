import type { Request, Response, NextFunction } from "express";

interface Bucket {
  count: number;
  resetAt: number;
  blockedUntil: number | null;
  failures: number;
}

const store = new Map<string, Bucket>();
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 5; // 5 requests per window
const MAX_FAILURES = 5; // after 5 login failures, block for 5 minutes
const BLOCK_DURATION_MS = 300_000; // 5 minutes

function getBucket(key: string): Bucket {
  const now = Date.now();
  const existing = store.get(key);
  if (existing && existing.resetAt > now) {
    return existing;
  }
  const bucket: Bucket = {
    count: 0,
    resetAt: now + WINDOW_MS,
    blockedUntil: null,
    failures: 0,
  };
  store.set(key, bucket);
  return bucket;
}

/** Clean up stale entries every 5 minutes */
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of store.entries()) {
    if (bucket.resetAt < now && (!bucket.blockedUntil || bucket.blockedUntil < now)) {
      store.delete(key);
    }
  }
}, 300_000);

export function rateLimit({ windowMs = WINDOW_MS, max = MAX_REQUESTS }: { windowMs?: number; max?: number } = {}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.ip ?? "unknown"}:${req.method}:${req.path}`;
    const now = Date.now();
    const bucket = getBucket(key);
    if (bucket.blockedUntil && bucket.blockedUntil > now) {
      const retryAfter = Math.ceil((bucket.blockedUntil - now) / 1000);
      res.setHeader("Retry-After", retryAfter);
      res.status(429).json({ error: "كثرة محاولات. يرجى الانتظار قليلاً." });
      return;
    }
    if (now > bucket.resetAt) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }
    bucket.count += 1;
    if (bucket.count > max) {
      bucket.blockedUntil = now + BLOCK_DURATION_MS;
      res.status(429).json({ error: "تم تجاوز الحد الأقصى للمحاولات. يرجى الانتظار 5 دقائق." });
      return;
    }
    next();
  };
}

export function recordLoginFailure(ip: string): void {
  const key = `${ip}:failures`;
  const bucket = getBucket(key);
  bucket.failures += 1;
  if (bucket.failures >= MAX_FAILURES) {
    bucket.blockedUntil = Date.now() + BLOCK_DURATION_MS;
  }
}

export function recordLoginSuccess(ip: string): void {
  const key = `${ip}:failures`;
  const bucket = store.get(key);
  if (bucket) {
    bucket.failures = 0;
    bucket.blockedUntil = null;
  }
}

export function isIpBlocked(ip: string): boolean {
  const key = `${ip}:failures`;
  const bucket = store.get(key);
  if (!bucket || !bucket.blockedUntil) return false;
  return bucket.blockedUntil > Date.now();
}
