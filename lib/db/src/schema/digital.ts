import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { productsTable } from "./products";

export const DIGITAL_CODE_STATUS = ["available", "sold"] as const;
export type DigitalCodeStatus = (typeof DIGITAL_CODE_STATUS)[number];

export const digitalCodesTable = pgTable("digital_codes", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => productsTable.id, { onDelete: "cascade" }),
  secret: text("secret").notNull(),
  status: text("status").notNull().default("available"),
  orderId: text("order_id"),
  soldAt: timestamp("sold_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDigitalCodeSchema = createInsertSchema(digitalCodesTable);
export type InsertDigitalCode = z.infer<typeof insertDigitalCodeSchema>;
export type DigitalCode = typeof digitalCodesTable.$inferSelect;
