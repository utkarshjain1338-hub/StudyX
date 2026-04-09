import { Router } from "express";
import { db } from "@workspace/db";
import { completionsTable } from "@workspace/db";
import { gte } from "drizzle-orm";
import { sql } from "drizzle-orm";

const router = Router();

router.get("/weekly", async (_req, res) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];

  const completions = await db
    .select()
    .from(completionsTable)
    .where(gte(completionsTable.date, sevenDaysAgo));

  const byDate: Record<string, { completedCount: number; totalMinutes: number; taskIds: number[] }> = {};

  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().split("T")[0];
    byDate[d] = { completedCount: 0, totalMinutes: 0, taskIds: [] };
  }

  for (const c of completions) {
    if (!byDate[c.date]) continue;
    byDate[c.date].completedCount++;
    byDate[c.date].totalMinutes += c.minutesStudied ?? 0;
    if (!byDate[c.date].taskIds.includes(c.taskId)) {
      byDate[c.date].taskIds.push(c.taskId);
    }
  }

  const result = Object.entries(byDate).map(([date, data]) => ({
    date,
    ...data,
  }));

  res.json(result);
});

export default router;
