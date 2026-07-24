// src/services/googleSyncService.js
import { google } from "googleapis";
import Event from "../database/eventModel.js";
import Task from "../database/taskModel.js";

export const syncGoogleData = async (refreshToken, userId) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  const tasksApi = google.tasks({ version: "v1", auth: oauth2Client });

  // 1️⃣ Fetch Google Calendar events
  const eventsRes = await calendar.events.list({
    calendarId: "primary",
    singleEvents: true,
    orderBy: "startTime"
  });

  const events = eventsRes.data.items || [];

  // 2️⃣ Fetch Google Tasks
  const tasksRes = await tasksApi.tasks.list({
    tasklist: "@default"
  });

  const googleTasks = tasksRes.data.items || [];

  // 3️⃣ Save events to DB
  const formattedEvents = [];

  for (const ev of events) {
    const startISO = ev.start?.dateTime || ev.start?.date;
    const endISO = ev.end?.dateTime || ev.end?.date;

    // ⭐ Extract date + time
    const date = startISO.split("T")[0];
    const start_time = startISO.split("T")[1]?.slice(0, 5) || "00:00";
    const end_time = endISO.split("T")[1]?.slice(0, 5) || start_time;

    // Save to DB
    await Event.upsert({
      googleId: ev.id,
      userId,
      title: ev.summary || "",
      description: ev.description || "",
      start: startISO,
      end: endISO,
      updatedAt: ev.updated
    });

    // Return formatted event for frontend
    formattedEvents.push({
      title: ev.summary || "",
      date,
      start_time,
      end_time
    });
  }

  // 4️⃣ Save tasks to DB
  for (const t of googleTasks) {
    await Task.upsert({
      googleId: t.id,
      userId,
      title: t.title || "",
      notes: t.notes || "",
      dueDate: t.due || null,
      status: t.status || "needsAction",
      updatedAt: t.updated
    });
  }

  return { events: formattedEvents, tasks: googleTasks };
};
