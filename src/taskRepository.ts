import type Database from "better-sqlite3";

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
    };
  }

  findAll(): Task[] {
    return this.stmts.findAll.all().map(toTask);
  }

  findById(id: number): Task | undefined {
    const row = this.stmts.findById.get(id);
    return row && toTask(row);
  }
}
