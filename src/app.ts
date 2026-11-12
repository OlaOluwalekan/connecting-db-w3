import express, { type Request, type Response } from "express";
import type Database from "better-sqlite3";
import { TaskRepository } from "./taskRepository";

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

  return app;
}
