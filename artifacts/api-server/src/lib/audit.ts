import type { Request } from "express";
import { randomUUID } from "crypto";
import { db } from "@workspace/db";
import { auditLogTable } from "@workspace/db";

export async function writeAudit(
  req: Request,
  params: {
    action: string;
    entityType: string;
    entityId?: string | null;
    details?: unknown;
  },
): Promise<void> {
  try {
    await db.insert(auditLogTable).values({
      id: randomUUID(),
      adminId: req.admin?.id ?? null,
      adminUsername: req.admin?.username ?? null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId ?? null,
      details: params.details ?? null,
      ip: req.ip ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to write audit log entry");
  }
}
