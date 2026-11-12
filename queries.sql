-- Stage 4: first SQL queries, run by hand against tasks.db
-- (e.g. in DB Browser for SQLite → "Execute SQL" tab).
-- The API reads straight from the database, so GET /tasks reflects
-- every change made here immediately — no server restart needed.

-- List every task
SELECT * FROM tasks;

-- Show only completed tasks
SELECT * FROM tasks WHERE done = 1;

-- Count all tasks
SELECT COUNT(*) FROM tasks;

-- Mark every task as completed
UPDATE tasks SET done = 1;

-- Delete all completed tasks (after the UPDATE above, this empties the table!)
DELETE FROM tasks WHERE done = 1;
