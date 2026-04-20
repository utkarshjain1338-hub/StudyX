import { Router } from "express";
import { db } from "@workspace/db";
import { completionsTable, tasksTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthedRequest } from "../middlewares/requireAuth";

const router = Router();

router.use(requireAuth);

function calcStreak(dates: string[]): { current: number; longest: number } {
  if (dates.length === 0) return { current: 0, longest: 0 };

  const sorted = [...new Set(dates)].sort().reverse();
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  let current = 0;
  const startDate = sorted[0] === today || sorted[0] === yesterday ? sorted[0] : null;

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

router.get("/daily", async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const userTasks = await db.select({ id: tasksTable.id }).from(tasksTable)
    .where(eq(tasksTable.userId, userId));
  const userTaskIds = userTasks.map(t => t.id);

  const completions = await db.select({ date: completionsTable.date, taskId: completionsTable.taskId })
    .from(completionsTable);
  const dates = completions.filter(c => userTaskIds.includes(c.taskId)).map(c => c.date);

  const { current, longest } = calcStreak(dates);
  const today = new Date().toISOString().split("T")[0];
  const isActiveToday = dates.includes(today);
  const lastActiveDate = dates.length > 0 ? [...new Set(dates)].sort().reverse()[0] : null;

  res.json({ currentStreak: current, longestStreak: longest, lastActiveDate, isActiveToday });
});

router.get("/tasks", async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const tasks = await db.select().from(tasksTable).where(eq(tasksTable.userId, userId))
    .orderBy(tasksTable.createdAt);
  const allCompletions = await db.select().from(completionsTable);
  const today = new Date().toISOString().split("T")[0];

  const result = tasks.map((task) => {
    const taskDates = allCompletions.filter((c) => c.taskId === task.id).map((c) => c.date);
    const { current, longest } = calcStreak(taskDates);
    const isCompletedToday = taskDates.includes(today);
    const lastCompletedDate = taskDates.length > 0 ? [...new Set(taskDates)].sort().reverse()[0] : null;
    return {
      taskId: task.id,
      taskName: task.name,
      taskColor: task.color,
      targetMinutesPerDay: task.targetMinutesPerDay ?? null,
      currentStreak: current,
      longestStreak: longest,
      isCompletedToday,
      lastCompletedDate,
    };
  });

  res.json(result);
});

export default router;
