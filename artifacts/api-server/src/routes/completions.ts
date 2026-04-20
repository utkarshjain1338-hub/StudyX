import { Router } from "express";
import { db } from "@workspace/db";
import { completionsTable, tasksTable, userProfilesTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth, type AuthedRequest } from "../middlewares/requireAuth";
import {
  MarkCompletionBody,
  DeleteCompletionParams,
} from "@workspace/api-zod";

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const taskIdRaw = req.query.taskId;
  const dateRaw = req.query.date;
  const taskId = taskIdRaw ? Number(taskIdRaw) : undefined;
  const date = typeof dateRaw === "string" ? dateRaw : undefined;

  const userTasks = await db.select({ id: tasksTable.id })
    .from(tasksTable)
    .where(eq(tasksTable.userId, userId));
  const userTaskIds = userTasks.map(t => t.id);

  if (userTaskIds.length === 0) {
    res.json([]);
    return;
  }

  let completions = await db.select().from(completionsTable)
    .orderBy(completionsTable.completedAt);

  completions = completions.filter(c => userTaskIds.includes(c.taskId));

  if (taskId !== undefined) {
    completions = completions.filter(c => c.taskId === taskId);
  }
  if (date !== undefined) {
    completions = completions.filter(c => c.date === date);
  }

  res.json(completions);
});

router.post("/", async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const body = MarkCompletionBody.parse(req.body);

  const [task] = await db.select().from(tasksTable)
    .where(and(eq(tasksTable.id, body.taskId), eq(tasksTable.userId, userId)));
  if (!task) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const existing = await db
    .select()
    .from(completionsTable)
    .where(
      and(
        eq(completionsTable.taskId, body.taskId),
        eq(completionsTable.date, body.date)
      )
    );

  if (existing.length > 0) {
    res.status(201).json(existing[0]);
    return;
  }

  const [completion] = await db.insert(completionsTable).values(body).returning();

  // Award XP for completion (default 10 XP if not specified on task)
  const xpReward = task.xpReward || 10;
  await db.insert(userProfilesTable)
    .values({
      userId,
      totalXp: xpReward,
    })
    .onConflictDoUpdate({
      target: userProfilesTable.userId,
      set: { totalXp: sql`${userProfilesTable.totalXp} + ${xpReward}` },
    });

  res.status(201).json(completion);
});

router.delete("/:id", async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const { id } = DeleteCompletionParams.parse({ id: Number(req.params.id) });

  const [completion] = await db.select().from(completionsTable)
    .where(eq(completionsTable.id, id));
  if (completion) {
    const [task] = await db.select().from(tasksTable)
      .where(and(eq(tasksTable.id, completion.taskId), eq(tasksTable.userId, userId)));
    if (!task) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
  }

  await db.delete(completionsTable).where(eq(completionsTable.id, id));
  res.status(204).send();
});

export default router;
