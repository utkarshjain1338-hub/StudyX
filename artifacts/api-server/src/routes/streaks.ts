import { Router } from "express";
import { db } from "@workspace/db";
import { completionsTable, tasksTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";

const router = Router();

function calcStreak(dates: string[]): { current: number; longest: number } {
  if (dates.length === 0) return { current: 0, longest: 0 };

  const sorted = [...new Set(dates)].sort().reverse();

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  let current = 0;
  let longest = 0;
  let streak = 0;

  const startDate = sorted[0] === today || sorted[0] === yesterday ? sorted[0] : null;
  if (!startDate) return { current: 0, longest: calcLongest(sorted) };

  let prevDate = new Date(startDate);
  for (const d of sorted) {
    const curr = new Date(d);
    const diff = Math.round((prevDate.getTime() - curr.getTime()) / 86400000);
    if (diff <= 1) {
      streak++;
      prevDate = curr;
    } else {
      break;
    }
  }
  current = streak;

  longest = calcLongest(sorted);

  return { current, longest: Math.max(current, longest) };
}

function calcLongest(sortedDesc: string[]): number {
  if (sortedDesc.length === 0) return 0;
  let longest = 1;
  let streak = 1;
  const sorted = [...sortedDesc].sort();
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diff === 1) {
      streak++;
      longest = Math.max(longest, streak);
    } else {
      streak = 1;
    }
  }
  return longest;
}

router.get("/daily", async (_req, res) => {
  const completions = await db
    .select({ date: completionsTable.date })
    .from(completionsTable);

  const dates = completions.map((c) => c.date);
  const { current, longest } = calcStreak(dates);
  const today = new Date().toISOString().split("T")[0];
  const isActiveToday = dates.includes(today);
  const lastActiveDate = dates.length > 0 ? [...new Set(dates)].sort().reverse()[0] : null;

  res.json({ currentStreak: current, longestStreak: longest, lastActiveDate, isActiveToday });
});

router.get("/tasks", async (_req, res) => {
  const tasks = await db.select().from(tasksTable).orderBy(tasksTable.createdAt);
  const allCompletions = await db.select().from(completionsTable);
  const today = new Date().toISOString().split("T")[0];

  const result = tasks.map((task) => {
    const taskDates = allCompletions
      .filter((c) => c.taskId === task.id)
      .map((c) => c.date);
    const { current, longest } = calcStreak(taskDates);
    const isCompletedToday = taskDates.includes(today);
    const lastCompletedDate = taskDates.length > 0 ? [...new Set(taskDates)].sort().reverse()[0] : null;

    return {
      taskId: task.id,
      taskName: task.name,
      taskColor: task.color,
      currentStreak: current,
      longestStreak: longest,
      isCompletedToday,
      lastCompletedDate,
    };
  });

  res.json(result);
});

export default router;
