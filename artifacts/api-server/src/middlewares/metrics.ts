import type { Request, Response, NextFunction } from "express";

type ErrorEntry = {
  time: string;
  method: string;
  path: string;
  status: number;
};

const startedAt = Date.now();
let requestCount = 0;
let errorCount = 0;
const ERROR_BUFFER_SIZE = 50;
const errorBuffer: ErrorEntry[] = [];

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  requestCount += 1;
  res.on("finish", () => {
    if (res.statusCode >= 500) {
      errorCount += 1;
      errorBuffer.unshift({
        time: new Date().toISOString(),
        method: req.method,
        path: req.originalUrl.split("?")[0],
        status: res.statusCode,
      });
      if (errorBuffer.length > ERROR_BUFFER_SIZE) errorBuffer.pop();
    }
  });
  next();
}

export function getMetrics() {
  const mem = process.memoryUsage();
  const toMb = (n: number) => Math.round((n / 1024 / 1024) * 10) / 10;
  return {
    uptimeSeconds: Math.round(process.uptime()),
    startedAt: new Date(startedAt).toISOString(),
    requestCount,
    errorCount,
    nodeVersion: process.version,
    memory: {
      rssMb: toMb(mem.rss),
      heapUsedMb: toMb(mem.heapUsed),
      heapTotalMb: toMb(mem.heapTotal),
    },
    recentErrors: errorBuffer.slice(0, 20),
    timestamp: new Date().toISOString(),
  };
}
