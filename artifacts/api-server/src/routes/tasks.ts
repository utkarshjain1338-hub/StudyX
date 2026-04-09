import { Router } from "express";
import { db } from "@workspace/db";
import { tasksTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
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
  const body = CreateTaskBody.parse(req.body);
  const [task] = await db.insert(tasksTable).values({ ...body, userId }).returning();
  res.status(201).json(task);
});

router.get("/:id", async (req, res) => {
  const userId = (req as AuthedRequest).userId;
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
  const userId = (req as AuthedRequest).userId;
  const { id } = UpdateTaskParams.parse({ id: Number(req.params.id) });
  const body = UpdateTaskBody.parse(req.body);
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
  const userId = (req as AuthedRequest).userId;
  const { id } = DeleteTaskParams.parse({ id: Number(req.params.id) });
  await db.delete(tasksTable)
    .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, userId)));
  res.status(204).send();
});

export default router;
