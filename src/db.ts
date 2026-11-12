import path from "node:path";
import Database from "better-sqlite3";

// tasks.db lives in the project root (one level above src/ and dist/).
// Set DB_PATH to use a different file, e.g. DB_PATH=test.db.
export const DB_PATH = process.env.DB_PATH ?? path.join(__dirname, "..", "tasks.db");

const SEED_TASKS = [
  { title: "Buy milk", done: 0 },
  { title: "Learn SQL", done: 0 },
  { title: "Finish Assignment 1", done: 1 },
];

/**
 * Opens (and creates, if missing) the SQLite database file,
 * creates the tasks table if it doesn't exist, and inserts the
 * example tasks only when the table is empty.
 */
export function openDatabase(file: string = DB_PATH): Database.Database {
  const db = new Database(file);

  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id    INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT    NOT NULL,
      done  BOOLEAN NOT NULL DEFAULT 0 CHECK (done IN (0, 1))
    )
  `);

  const { count } = db.prepare("SELECT COUNT(*) AS count FROM tasks").get() as { count: number };
  if (count === 0) {
    const insert = db.prepare("INSERT INTO tasks (title, done) VALUES (@title, @done)");
    db.transaction(() => SEED_TASKS.forEach((t) => insert.run(t)))();
    console.log(`Seeded ${SEED_TASKS.length} example tasks`);
  }

  return db;
}
