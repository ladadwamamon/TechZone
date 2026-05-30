import { pgTable, text, jsonb, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ADMIN_ROLES = ["super_admin", "content_editor", "order_manager"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const adminAccountsTable = pgTable("admin_accounts", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  fullName: text("full_name").notNull(),
  email: text("email"),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("content_editor"),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAdminAccountSchema = createInsertSchema(adminAccountsTable);
export type InsertAdminAccount = z.infer<typeof insertAdminAccountSchema>;
export type AdminAccount = typeof adminAccountsTable.$inferSelect;

export const adminSessionsTable = pgTable("admin_sessions", {
  id: text("id").primaryKey(),
  adminId: text("admin_id").notNull().references(() => adminAccountsTable.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  userAgent: text("user_agent"),
  ip: text("ip"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAdminSessionSchema = createInsertSchema(adminSessionsTable);
export type InsertAdminSession = z.infer<typeof insertAdminSessionSchema>;
export type AdminSession = typeof adminSessionsTable.$inferSelect;

export const siteSettingsTable = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  updatedBy: text("updated_by"),
});

export const insertSiteSettingSchema = createInsertSchema(siteSettingsTable);
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;
export type SiteSetting = typeof siteSettingsTable.$inferSelect;

export const mediaTable = pgTable("media", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type"),
  sizeBytes: integer("size_bytes"),
  altText: text("alt_text"),
  folder: text("folder").notNull().default("general"),
  uploadedBy: text("uploaded_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMediaSchema = createInsertSchema(mediaTable);
export type InsertMedia = z.infer<typeof insertMediaSchema>;
export type Media = typeof mediaTable.$inferSelect;

export const auditLogTable = pgTable("audit_log", {
  id: text("id").primaryKey(),
  adminId: text("admin_id"),
  adminUsername: text("admin_username"),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  details: jsonb("details"),
  ip: text("ip"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogTable);
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogTable.$inferSelect;
