import { pgTable, text, decimal, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { customersTable } from "./customers";

export const SUBSCRIPTION_PERIOD = ["monthly", "quarterly", "yearly"] as const;
export type SubscriptionPeriod = (typeof SUBSCRIPTION_PERIOD)[number];

export const SUBSCRIPTION_STATUS = ["active", "cancelled", "expired", "pending"] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUS)[number];

export const subscriptionPlansTable = pgTable("subscription_plans", {
  id: text("id").primaryKey(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  slug: text("slug").notNull().unique(),
  descriptionAr: text("description_ar"),
  descriptionEn: text("description_en"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  period: text("period").notNull().default("monthly"),
  features: jsonb("features"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlansTable);
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type SubscriptionPlan = typeof subscriptionPlansTable.$inferSelect;

export const customerSubscriptionsTable = pgTable("customer_subscriptions", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").notNull().references(() => customersTable.id, { onDelete: "cascade" }),
  planId: text("plan_id").notNull().references(() => subscriptionPlansTable.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"),
  startedAt: timestamp("started_at"),
  expiresAt: timestamp("expires_at"),
  renewCount: integer("renew_count").notNull().default(0),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCustomerSubscriptionSchema = createInsertSchema(customerSubscriptionsTable);
export type InsertCustomerSubscription = z.infer<typeof insertCustomerSubscriptionSchema>;
export type CustomerSubscription = typeof customerSubscriptionsTable.$inferSelect;
