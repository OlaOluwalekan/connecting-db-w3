import express, { type NextFunction, type Request, type Response } from "express";
import type Database from "better-sqlite3";
import { TaskRepository } from "./taskRepository";
import { validateNewTask, validateTaskUpdate } from "./validation";

const NOT_FOUND = { error: "Task not found" };

/** Parses the :id route param; returns undefined if it isn't a positive integer. */
function parseId(req: Request): number | undefined {
  const raw = req.params.id;
  if (typeof raw !== "string" || !/^\d+$/.test(raw)) return undefined;
  const id = Number(raw);
  return Number.isSafeInteger(id) && id > 0 ? id : undefined;
}

export function createApp(db: Database.Database) {
  const tasks = new TaskRepository(db);
  const app = express();
  app.use(express.json());

  // GET /tasks — every task
  app.get("/tasks", (_req: Request, res: Response) => {
    res.json(tasks.findAll());
  });

  // GET /tasks/:id — one task, or 404
  app.get("/tasks/:id", (req: Request, res: Response) => {
    const id = parseId(req);
    const task = id === undefined ? undefined : tasks.findById(id);
    if (!task) return res.status(404).json(NOT_FOUND);
    res.json(task);
  });

  // POST /tasks — create a task, 201 with the new row, or 400
  app.post("/tasks", (req: Request, res: Response) => {
    const result = validateNewTask(req.body);
    if (!result.ok) return res.status(400).json({ error: result.error });
    res.status(201).json(tasks.create(result.value));
  });

  // PUT /tasks/:id — update title and/or done; 404 for unknown ids, 400 for bad bodies
  app.put("/tasks/:id", (req: Request, res: Response) => {
    const id = parseId(req);
    if (id === undefined) return res.status(404).json(NOT_FOUND);
    const result = validateTaskUpdate(req.body);
    if (!result.ok) return res.status(400).json({ error: result.error });
    const task = tasks.update(id, result.value);
    if (!task) return res.status(404).json(NOT_FOUND);
    res.json(task);
  });

  // DELETE /tasks/:id — 204 on success, 404 for unknown ids
  app.delete("/tasks/:id", (req: Request, res: Response) => {
    const id = parseId(req);
    if (id === undefined || !tasks.delete(id)) return res.status(404).json(NOT_FOUND);
    res.status(204).end();
  });

  // Malformed JSON bodies → 400; anything else unexpected → 500. Always JSON.
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof SyntaxError && "body" in err) {
      return res.status(400).json({ error: "Request body is not valid JSON" });
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
