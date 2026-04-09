import { Router } from "express";
import { db } from "@workspace/db";
import { completionsTable, tasksTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import {
  MarkCompletionBody,
  ListCompletionsQueryParams,
  DeleteCompletionParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const taskIdRaw = req.query.taskId;
  const dateRaw = req.query.date;
  const params = {
    taskId: taskIdRaw ? Number(taskIdRaw) : undefined,
    date: typeof dateRaw === "string" ? dateRaw : undefined,
  };

  let query = db.select().from(completionsTable).$dynamic();

  const conditions = [];
  if (params.taskId !== undefined) {
    conditions.push(eq(completionsTable.taskId, params.taskId));
  }
  if (params.date !== undefined) {
    conditions.push(eq(completionsTable.date, params.date));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const completions = await query.orderBy(completionsTable.completedAt);
  res.json(completions);
});

router.post("/", async (req, res) => {
  const body = MarkCompletionBody.parse(req.body);

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
  res.status(201).json(completion);
});

router.delete("/:id", async (req, res) => {
  const { id } = DeleteCompletionParams.parse({ id: Number(req.params.id) });
  await db.delete(completionsTable).where(eq(completionsTable.id, id));
  res.status(204).send();
});

export default router;
