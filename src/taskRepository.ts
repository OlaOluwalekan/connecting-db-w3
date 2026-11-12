import type Database from "better-sqlite3";
import type { NewTask, TaskUpdate } from "./validation";

/** A task as the API sends it to clients. */
export interface Task {
  id: number;
  title: string;
  done: boolean;
}

/** A task as SQLite stores it: booleans are 0/1 integers. */
interface TaskRow {
  id: number;
  title: string;
  done: 0 | 1;
}

const toTask = (row: TaskRow): Task => ({ id: row.id, title: row.title, done: row.done === 1 });

/**
 * All SQL for the tasks table lives here. The routes never touch the
 * database directly, so swapping SQLite for another database only
 * means rewriting this file.
 */
export class TaskRepository {
  private readonly stmts;

  constructor(db: Database.Database) {
    this.stmts = {
      findAll: db.prepare<[], TaskRow>("SELECT id, title, done FROM tasks ORDER BY id"),
      findById: db.prepare<[number], TaskRow>("SELECT id, title, done FROM tasks WHERE id = ?"),
      insert: db.prepare<[{ title: string; done: number }], TaskRow>(
        "INSERT INTO tasks (title, done) VALUES (@title, @done) RETURNING id, title, done",
      ),
      // COALESCE keeps the current value for any field the client didn't send.
      update: db.prepare<[{ id: number; title: string | null; done: number | null }], TaskRow>(
        `UPDATE tasks
            SET title = COALESCE(@title, title),
                done  = COALESCE(@done, done)
          WHERE id = @id
      RETURNING id, title, done`,
      ),
      delete: db.prepare<[number]>("DELETE FROM tasks WHERE id = ?"),
    };
  }

  /** Returns the updated task, or undefined if no task has that id. */
  update(id: number, changes: TaskUpdate): Task | undefined {
    const row = this.stmts.update.get({
      id,
      title: changes.title ?? null,
      done: changes.done === undefined ? null : changes.done ? 1 : 0,
    });
    return row && toTask(row);
  }

  /** Returns true if a task was deleted, false if no task has that id. */
  delete(id: number): boolean {
    return this.stmts.delete.run(id).changes > 0;
  }

  create(task: NewTask): Task {
    const row = this.stmts.insert.get({ title: task.title, done: task.done ? 1 : 0 })!;
    return toTask(row);
  }

  findAll(): Task[] {
    return this.stmts.findAll.all().map(toTask);
  }

  findById(id: number): Task | undefined {
    const row = this.stmts.findById.get(id);
    return row && toTask(row);
  }
}
