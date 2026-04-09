import { Router } from "express";
import { db } from "@workspace/db";
import { tasksTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateTaskBody, UpdateTaskBody, GetTaskParams, DeleteTaskParams, UpdateTaskParams } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const tasks = await db.select().from(tasksTable).orderBy(tasksTable.createdAt);
  res.json(tasks);
});

router.post("/", async (req, res) => {
  const body = CreateTaskBody.parse(req.body);
  const [task] = await db.insert(tasksTable).values(body).returning();
  res.status(201).json(task);
});

router.get("/:id", async (req, res) => {
  const { id } = GetTaskParams.parse({ id: Number(req.params.id) });
  const [task] = await db.select().from(tasksTable).where(eq(tasksTable.id, id));
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  res.json(task);
});

router.put("/:id", async (req, res) => {
  const { id } = UpdateTaskParams.parse({ id: Number(req.params.id) });
  const body = UpdateTaskBody.parse(req.body);
  const [task] = await db.update(tasksTable).set(body).where(eq(tasksTable.id, id)).returning();
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  res.json(task);
});

router.delete("/:id", async (req, res) => {
  const { id } = DeleteTaskParams.parse({ id: Number(req.params.id) });
  await db.delete(tasksTable).where(eq(tasksTable.id, id));
  res.status(204).send();
});

export default router;
