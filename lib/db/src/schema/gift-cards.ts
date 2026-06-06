import { pgTable, text, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { customersTable } from "./customers";

export const GIFT_CARD_STATUS = ["active", "redeemed", "expired", "cancelled"] as const;
export type GiftCardStatus = (typeof GIFT_CARD_STATUS)[number];

export const giftCardsTable = pgTable("gift_cards", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("active"),
  customerId: text("customer_id").references(() => customersTable.id),
  redeemedAt: timestamp("redeemed_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertGiftCardSchema = createInsertSchema(giftCardsTable);
export type InsertGiftCard = z.infer<typeof insertGiftCardSchema>;
export type GiftCard = typeof giftCardsTable.$inferSelect;
