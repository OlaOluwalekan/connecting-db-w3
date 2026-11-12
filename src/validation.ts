export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export interface NewTask {
  title: string;
  done: boolean;
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** POST /tasks body: title is required, done is optional (defaults to false). */
export function validateNewTask(body: unknown): Result<NewTask> {
  if (!isPlainObject(body)) return { ok: false, error: "Request body must be a JSON object" };

  const { title, done } = body;
  if (typeof title !== "string" || title.trim() === "") {
    return { ok: false, error: "title is required and must be a non-empty string" };
  }
  if (done !== undefined && typeof done !== "boolean") {
    return { ok: false, error: "done must be a boolean" };
  }
  return { ok: true, value: { title: title.trim(), done: done ?? false } };
}
