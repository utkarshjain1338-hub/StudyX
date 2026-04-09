import { pgTable, serial, integer, text, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { tasksTable } from "./tasks";

export const completionsTable = pgTable("completions", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull().references(() => tasksTable.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  minutesStudied: integer("minutes_studied"),
  notes: text("notes"),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
});

export const insertCompletionSchema = createInsertSchema(completionsTable).omit({ id: true, completedAt: true });
export type InsertCompletion = z.infer<typeof insertCompletionSchema>;
export type Completion = typeof completionsTable.$inferSelect;
