// Shared helpers for talking to the backend API.

export function getUserIdFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id ?? null;
  } catch {
    return null;
  }
}

export function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || `Request failed: ${res.status}`);
  }

  return data;
}

// MySQL DATE/DATETIME columns are serialized as full ISO strings
// (e.g. "2026-07-20T00:00:00.000Z") once they cross JSON keep just the
// calendar date portion.
function toDateOnly(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

// TIME columns come back as "HH:MM:SS" strings trim to "HH:MM" for <input type="time">.
function toHHMM(value) {
  if (!value) return "";
  return String(value).slice(0, 5);
}

export function mapEventFromApi(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || "",
    date: toDateOnly(row.date),
    startTime: toHHMM(row.start_time),
    endTime: toHHMM(row.end_time),
    category: row.category,
    priority: row.priority,
  };
}

export function eventToApiPayload({ title, description, date, startTime, endTime, category, priority }) {
  return {
    user_id: getUserIdFromToken(),
    title,
    description,
    date,
    start_time: startTime.length === 5 ? `${startTime}:00` : startTime,
    end_time: endTime.length === 5 ? `${endTime}:00` : endTime,
    category,
    priority,
  };
}

// Backend validates task type as "To-Do"/"Reminder"/"Scheduled"; the rest of
// the frontend uses lowercase "todo"/"reminder"/"scheduled" bridge here.
const TASK_TYPE_TO_API = { todo: "To-Do", reminder: "Reminder", scheduled: "Scheduled" };
const TASK_TYPE_FROM_API = { "To-Do": "todo", "Reminder": "reminder", "Scheduled": "scheduled" };

export function mapTaskFromApi(row) {
  return {
    id: row.id,
    title: row.title,
    type: TASK_TYPE_FROM_API[row.type] || "todo",
    date: toDateOnly(row.date),
    time: toHHMM(row.time),
    priority: row.priority || "medium",
    completed: !!row.completed,
  };
}

export function taskToApiPayload({ title, type, date, time, priority, completed }) {
  return {
    user_id: getUserIdFromToken(),
    title,
    type: TASK_TYPE_TO_API[type] || "To-Do",
    date: date || null,
    time: time || null,
    priority: priority || "medium",
    completed: completed ?? false,
  };
}
