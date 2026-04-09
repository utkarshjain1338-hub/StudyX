import { Router } from "express";
import { db } from "@workspace/db";
import { completionsTable, tasksTable } from "@workspace/db";
import { eq, gte } from "drizzle-orm";
import { requireAuth, type AuthedRequest } from "../middlewares/requireAuth";

const router = Router();

router.use(requireAuth);

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

  let longest = dates.length > 0 ? 1 : 0;
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
  longest = Math.max(current, longest);

  return { current, longest };
}

router.get("/summary", async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const tasks = await db.select().from(tasksTable).where(eq(tasksTable.userId, userId));

  const userTaskIds = tasks.map(t => t.id);
  const allCompletions = await db.select().from(completionsTable);
  const userCompletions = allCompletions.filter(c => userTaskIds.includes(c.taskId));

  const today = new Date().toISOString().split("T")[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];

  const completedTodaySet = new Set(
    userCompletions.filter((c) => c.date === today).map((c) => c.taskId)
  );

  const weeklyDates = userCompletions.filter((c) => c.date >= sevenDaysAgo).map((c) => c.date);
  const uniqueWeekDays = new Set(weeklyDates);
  const completionRateThisWeek = uniqueWeekDays.size / 7;

  const allDates = userCompletions.map((c) => c.date);
  const { current, longest } = calcStreak(allDates);

  res.json({
    totalTasks: tasks.length,
    completedToday: completedTodaySet.size,
    currentDailyStreak: current,
    longestDailyStreak: longest,
    totalCompletionsAllTime: userCompletions.length,
    completionRateThisWeek,
  });
});

export default router;
