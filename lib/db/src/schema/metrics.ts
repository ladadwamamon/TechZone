import { pgTable, text, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const webVitalsTable = pgTable("web_vitals", {
  id: text("id").primaryKey(),
  metric: text("metric").notNull(),
  value: doublePrecision("value").notNull(),
  rating: text("rating"),
  path: text("path"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWebVitalSchema = createInsertSchema(webVitalsTable);
export type InsertWebVital = z.infer<typeof insertWebVitalSchema>;
export type WebVital = typeof webVitalsTable.$inferSelect;
