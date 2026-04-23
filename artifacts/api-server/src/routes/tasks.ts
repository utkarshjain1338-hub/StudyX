import { Router } from "express";
import { db } from "@workspace/db";
import { tasksTable, userProfilesTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth, type AuthedRequest } from "../middlewares/requireAuth";
import { CreateTaskBody, UpdateTaskBody, GetTaskParams, DeleteTaskParams, UpdateTaskParams } from "@workspace/api-zod";

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const tasks = await db.select().from(tasksTable)
    .where(eq(tasksTable.userId, userId))
    .orderBy(tasksTable.createdAt);
  res.json(tasks);
});

router.post("/", async (req, res) => {
  const userId = (req as AuthedRequest).userId;

  let body;
  try {
    body = CreateTaskBody.parse(req.body);
  } catch (error) {
    res.status(400).json({ error: "Invalid task payload", details: (error as Error).message });
    return;
  }

  const [task] = await db.insert(tasksTable).values({ ...body, userId }).returning();
  res.status(201).json(task);
});

router.get("/:id", async (req, res) => {
  const userId = (req as unknown as AuthedRequest).userId;
  const { id } = GetTaskParams.parse({ id: Number(req.params.id) });
  const [task] = await db.select().from(tasksTable)
    .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, userId)));
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  res.json(task);
});

router.put("/:id", async (req, res) => {
  const userId = (req as unknown as AuthedRequest).userId;
  const { id } = UpdateTaskParams.parse({ id: Number(req.params.id) });

  let body;
  try {
    body = UpdateTaskBody.parse(req.body);
  } catch (error) {
    res.status(400).json({ error: "Invalid task payload", details: (error as Error).message });
    return;
  }

  const [task] = await db.update(tasksTable).set(body)
    .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, userId)))
    .returning();
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  res.json(task);
});

router.delete("/:id", async (req, res) => {
  const userId = (req as unknown as AuthedRequest).userId;
  const { id } = DeleteTaskParams.parse({ id: Number(req.params.id) });
  await db.delete(tasksTable)
    .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, userId)));
  res.status(204).send();
});

router.post("/:id/review", async (req, res) => {
  const userId = (req as unknown as AuthedRequest).userId;
  const { id } = GetTaskParams.parse({ id: Number(req.params.id) });
  // The ReviewTaskBody schema should be available from api-zod
  // We'll validate manually if it's not exported by name, but Orval usually exports it.
  const { score } = req.body;
  if (typeof score !== "number" || score < 1 || score > 5) {
    res.status(400).json({ error: "Score must be between 1 and 5" });
    return;
  }

  const [task] = await db.select().from(tasksTable)
    .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, userId)));
  
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  // Simplified SuperMemo-2 logic
  // Here, difficultyScore acts as the current interval in days.
  let currentInterval = task.difficultyScore || 0;
  
  if (score >= 3) {
    // Correct response: increase interval
    if (currentInterval === 0) currentInterval = 1;
    else if (currentInterval === 1) currentInterval = 3;
    else currentInterval = Math.round(currentInterval * 1.5); // simpler multiplier
  } else {
    // Incorrect/poor response: reset interval
    currentInterval = 1;
  }

  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + currentInterval);

  const [updatedTask] = await db.update(tasksTable)
    .set({
      difficultyScore: currentInterval,
      lastReviewedAt: new Date(),
      nextReviewAt,
    })
    .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, userId)))
    .returning();

  // Award XP for reviewing (score * 5 XP)
  const xpReward = score * 5;
  await db.insert(userProfilesTable)
    .values({
      userId,
      totalXp: xpReward,
    })
    .onConflictDoUpdate({
      target: userProfilesTable.userId,
      set: { totalXp: sql`${userProfilesTable.totalXp} + ${xpReward}` },
    });

  res.json(updatedTask);
});

export default router;
