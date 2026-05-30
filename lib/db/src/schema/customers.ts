import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const customersTable = pgTable("customers", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  passwordHash: text("password_hash").notNull(),
  city: text("city"),
  address: text("address"),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCustomerSchema = createInsertSchema(customersTable);
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customersTable.$inferSelect;

export const customerSessionsTable = pgTable("customer_sessions", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").notNull().references(() => customersTable.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  userAgent: text("user_agent"),
  ip: text("ip"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCustomerSessionSchema = createInsertSchema(customerSessionsTable);
export type InsertCustomerSession = z.infer<typeof insertCustomerSessionSchema>;
export type CustomerSession = typeof customerSessionsTable.$inferSelect;
