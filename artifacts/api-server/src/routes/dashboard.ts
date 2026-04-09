import { Router } from "express";
import { db } from "@workspace/db";
import { completionsTable, tasksTable } from "@workspace/db";
import { gte } from "drizzle-orm";

const router = Router();

function calcStreak(dates: string[]): { current: number; longest: number } {
  if (dates.length === 0) return { current: 0, longest: 0 };

  const sorted = [...new Set(dates)].sort().reverse();
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const startDate = sorted[0] === today || sorted[0] === yesterday ? sorted[0] : null;
  let current = 0;

  if (startDate) {
    let prevDate = new Date(startDate);
    for (const d of sorted) {
      const curr = new Date(d);
      const diff = Math.round((prevDate.getTime() - curr.getTime()) / 86400000);
      if (diff <= 1) {
        current++;
        prevDate = curr;
      } else {
        break;
      }
    }
  }

  let longest = 1;
  let streak = 1;
  const asc = [...new Set(dates)].sort();
  for (let i = 1; i < asc.length; i++) {
    const prev = new Date(asc[i - 1]);
    const curr = new Date(asc[i]);
    const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diff === 1) {
      streak++;
      longest = Math.max(longest, streak);
    } else {
      streak = 1;
    }
  }
  longest = Math.max(current, longest, dates.length > 0 ? 1 : 0);

  return { current, longest };
}

router.get("/summary", async (_req, res) => {
  const tasks = await db.select().from(tasksTable);
  const allCompletions = await db.select().from(completionsTable);

  const today = new Date().toISOString().split("T")[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];

  const completedTodaySet = new Set(
    allCompletions.filter((c) => c.date === today).map((c) => c.taskId)
  );

  const weeklyDates = allCompletions
    .filter((c) => c.date >= sevenDaysAgo)
    .map((c) => c.date);
  const uniqueWeekDays = new Set(weeklyDates);
  const completionRateThisWeek = uniqueWeekDays.size / 7;

  const allDates = allCompletions.map((c) => c.date);
  const { current, longest } = calcStreak(allDates);

  res.json({
    totalTasks: tasks.length,
    completedToday: completedTodaySet.size,
    currentDailyStreak: current,
    longestDailyStreak: longest,
    totalCompletionsAllTime: allCompletions.length,
    completionRateThisWeek,
  });
});

export default router;
