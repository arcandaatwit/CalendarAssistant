import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSettings } from "./App";
import "./index.css";

import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

// -----------------------------
// LOCALIZER
// -----------------------------
const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

// -----------------------------
// CALENDAR VIEWS
// -----------------------------
const VIEWS = ["month", "week", "work_week", "day"];
const VIEW_LABELS = {
  month: "Month",
  week: "Week",
  work_week: "3 Day",
  day: "Day"
};

// -----------------------------
// HOLIDAY HELPERS
// -----------------------------
function getNthWeekdayOfMonth(year, month, weekday, nth) {
  const date = new Date(year, month - 1, 1);
  let count = 0;

  while (date.getMonth() === month - 1) {
    if (date.getDay() === weekday) {
      count++;
      if (count === nth) {
        return date.toISOString().split("T")[0];
      }
    }
    date.setDate(date.getDate() + 1);
  }
}

function getLastWeekdayOfMonth(year, month, weekday) {
  const date = new Date(year, month, 0); // last day of month
  while (date.getDay() !== weekday) {
    date.setDate(date.getDate() - 1);
  }
  return date.toISOString().split("T")[0];
}

function getUSHolidays(year) {
  return [
    { title: "New Year's Day", date: `${year}-01-01` },
    { title: "Martin Luther King Jr. Day", date: getNthWeekdayOfMonth(year, 1, 1, 3) },
    { title: "Presidents' Day", date: getNthWeekdayOfMonth(year, 2, 1, 3) },
    { title: "Memorial Day", date: getLastWeekdayOfMonth(year, 5, 1) },
    { title: "Independence Day", date: `${year}-07-04` },
    { title: "Labor Day", date: getNthWeekdayOfMonth(year, 9, 1, 1) },
    { title: "Columbus Day", date: getNthWeekdayOfMonth(year, 10, 1, 2) },
    { title: "Veterans Day", date: `${year}-11-11` },
    { title: "Thanksgiving", date: getNthWeekdayOfMonth(year, 11, 4, 4) },
    { title: "Christmas Day", date: `${year}-12-25` }
  ];
}

// -----------------------------
// MAIN COMPONENT
// -----------------------------
export default function MainPage() {
  const [viewIndex, setViewIndex] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const location = useLocation();
  const { events, setEvents, tasks } = useSettings();

  const safeEvents = Array.isArray(events) ? events : [];
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  // -----------------------------
  // HOLIDAYS FOR CURRENT YEAR
  // -----------------------------
  const currentYear = new Date().getFullYear();
  const HOLIDAYS = getUSHolidays(currentYear);

  const holidayEvents = HOLIDAYS.map(h => ({
    id: `holiday-${h.date}`,
    title: h.title,
    start: new Date(`${h.date}T00:00`),
    end: new Date(`${h.date}T23:59`),
    resource: { type: "holiday" }
  }));

  // -----------------------------
  // SCHEDULED/REMINDER TASKS CALENDAR BLOCKS
  // -----------------------------
  const taskEvents = safeTasks
    .filter((t) => t.date && !t.completed)
    .map((t) => {
      const dateOnly = t.date.includes("T") ? t.date.split("T")[0] : t.date;
      const time = t.time?.slice(0, 5) || "09:00";
      const start = new Date(`${dateOnly}T${time}`);
      const end = new Date(start.getTime() + 30 * 60000);

      return {
        id: `task-${t.id}`,
        title: `Task: ${t.title}`,
        start,
        end,
        resource: { type: "task", taskType: t.type, priority: t.priority }
      };
    });

  // -----------------------------
  // MERGE BACKEND EVENTS + TASKS + HOLIDAYS
  // -----------------------------
  const calendarEvents = [
    ...safeEvents.map(e => {
      const dateOnly = e.date.includes("T") ? e.date.split("T")[0] : e.date;
      const startTime = e.startTime;
      const endTime = e.endTime;

      return {
        id: e.id,
        title: e.title,
        start: new Date(`${dateOnly}T${startTime}`),
        end: new Date(`${dateOnly}T${endTime}`),
        resource: { type: "event", description: e.description, category: e.category, priority: e.priority }
      };
    }),

    ...taskEvents,
    ...holidayEvents
  ];

  const currentView = VIEWS[viewIndex];

  // -----------------------------
  // SAVE TOKEN FROM GOOGLE REDIRECT
  // -----------------------------
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      window.history.replaceState({}, document.title, "/main");
    }
  }, []);

  // -----------------------------
  // FETCH EVENTS FROM BACKEND
  // -----------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("/api/events", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        // Convert DB eventstothe shape addEvent.jsx/the calendar expect
        const formatted = data.map(ev => ({
          id: ev.id,
          title: ev.title,
          description: ev.description || "",
          date: ev.date,
          startTime: ev.start_time?.slice(0, 5),
          endTime: ev.end_time?.slice(0, 5),
          category: ev.category,
          priority: ev.priority,
        }));

        // Keep any Google-sourced events (loaded separately, tagged "google-").
        setEvents((prev) => [
          ...formatted,
          ...prev.filter((e) => String(e.id).startsWith("google-")),
        ]);
      })
      .catch(err => console.error("Error loading events:", err));
  }, [location.pathname]);

  // -----------------------------
  // VIEW CYCLER
  // -----------------------------
  const cycleView = () => {
    setViewIndex(prev => (prev + 1) % VIEWS.length);
  };

  // -----------------------------
  // SHOW
  // -----------------------------
  return (
    <div className="app-container">

      <div className="header-bar">
        <h1>Calendar Assistant</h1>
      </div>

      <div className="page-content">
        <div className="calendar-box">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            view={currentView}
            onView={(v) => setViewIndex(VIEWS.indexOf(v))}
            onSelectEvent={(event) => setSelectedEvent(event)}
            views={VIEWS}
            style={{ height: "100%", width: "100%" }}
          />
        </div>

        {selectedEvent && (
          <div className="card-box" style={{ marginTop: "16px" }}>
            <div className="task-row" style={{ justifyContent: "space-between" }}>
              <span style={{ fontWeight: "600", color: "var(--text-h)" }}>{selectedEvent.title}</span>
              <button
                className="link-btn"
                style={{ fontSize: "12px", padding: "0" }}
                onClick={() => setSelectedEvent(null)}
              >
                Close
              </button>
            </div>

            <div className="task-meta">
              <p>
                {selectedEvent.start.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                {" · "}
                {selectedEvent.start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                {" – "}
                {selectedEvent.end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
              </p>

              {(selectedEvent.resource?.category || selectedEvent.resource?.priority) && (
                <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                  {selectedEvent.resource?.category && (
                    <span className="task-tag">{selectedEvent.resource.category}</span>
                  )}
                  {selectedEvent.resource?.priority && (
                    <span className="task-tag">{selectedEvent.resource.priority}</span>
                  )}
                </div>
              )}

              {selectedEvent.resource?.description && <p>{selectedEvent.resource.description}</p>}
            </div>
          </div>
        )}
      </div>

      <div className="bottom-nav">
        <button className="nav-btn active" onClick={cycleView}>
          {VIEW_LABELS[currentView]}
        </button>
        <Link to="/addEvent" className={`nav-btn ${location.pathname === "/addEvent" ? "active" : ""}`}>Event</Link>
        <Link to="/taskPage" className={`nav-btn ${location.pathname === "/taskPage" ? "active" : ""}`}>Tasks</Link>
        <Link to="/profile" className={`nav-btn ${location.pathname === "/profile" ? "active" : ""}`}>Profile</Link>
      </div>

    </div>
  );
}
