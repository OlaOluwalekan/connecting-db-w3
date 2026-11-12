import { createApp } from "./app";
import { DB_PATH, openDatabase } from "./db";

const PORT = Number(process.env.PORT ?? 3000);

const db = openDatabase();
const app = createApp(db);

const server = app.listen(PORT, () => {
  console.log(`Using database ${DB_PATH}`);
  console.log(`Task API listening on http://localhost:${PORT}`);
});

// Close the database cleanly on Ctrl+C / container stop.
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    server.close();
    db.close();
    process.exit(0);
  });
}
