import { google } from "googleapis";

function buildOAuthClient(refreshToken) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return oauth2Client;
}

const PAST_HISTORY_DAYS = 90;

function mapGoogleEvent(ev) {
  const startISO = ev.start.dateTime || ev.start.date;
  const endISO = ev.end?.dateTime || ev.end?.date || startISO;
  const date = startISO.split("T")[0];
  const start_time = startISO.includes("T") ? startISO.split("T")[1].slice(0, 5) : "00:00";
  const end_time = endISO.includes("T") ? endISO.split("T")[1].slice(0, 5) : "23:59";

  return {
    id: `google-${ev.id}`,
    title: ev.summary || "(untitled)",
    description: ev.description || "",
    date,
    start_time,
    end_time,
    category: "google",
    priority: "medium",
  };
}

// Fetches Google Calendar events — both past (for the scheduler's history
// scoring) and upcoming (for conflict-avoidance) — mapped into the same
// shape eventsController.mapEvent returns, so the frontend needs no
// special-casing. Past and upcoming are fetched as two separate calls so a
// busy history can't crowd out `maxResults` and cut off upcoming events,
// which matter more for conflict-avoidance.
export async function fetchGoogleEvents(refreshToken) {
  const auth = buildOAuthClient(refreshToken);
  const calendar = google.calendar({ version: "v3", auth });

  const now = new Date();
  const pastStart = new Date(now.getTime() - PAST_HISTORY_DAYS * 24 * 60 * 60 * 1000);

  const [upcoming, past] = await Promise.all([
    calendar.events.list({
      calendarId: "primary",
      singleEvents: true,
      orderBy: "startTime",
      timeMin: now.toISOString(),
      maxResults: 50,
    }),
    calendar.events.list({
      calendarId: "primary",
      singleEvents: true,
      orderBy: "startTime",
      timeMin: pastStart.toISOString(),
      timeMax: now.toISOString(),
      maxResults: 100,
    }),
  ]);

  const items = [...(past.data.items || []), ...(upcoming.data.items || [])];
  const seen = new Set();

  return items
    .filter((ev) => ev.start && (ev.start.dateTime || ev.start.date) && !seen.has(ev.id) && seen.add(ev.id))
    .map(mapGoogleEvent);
}

// Fetches Google Tasks, mapped into the same shape tasksController's rows
// use (title/type/date/time/priority/completed), so ChatWidget/taskPage/main
// can treat them like any other task.
export async function fetchGoogleTasks(refreshToken) {
  const auth = buildOAuthClient(refreshToken);
  const tasksApi = google.tasks({ version: "v1", auth });

  const res = await tasksApi.tasks.list({
    tasklist: "@default",
    showCompleted: false,
    maxResults: 50,
  });

  return (res.data.items || []).map((t) => {
    const due = t.due ? t.due.split("T")[0] : null;
    return {
      id: `google-${t.id}`,
      title: t.title || "(untitled)",
      type: due ? "Scheduled" : "To-Do",
      date: due,
      time: null,
      priority: "medium",
      completed: t.status === "completed",
    };
  });
}
