import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSettings } from "./App";
import './index.css';

import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

const VIEWS = ["month", "week", "work_week", "day"];
const VIEW_LABELS = { month: "Month", week: "Week", work_week: "3 Day", day: "Day" };

export default function MainPage() {
  const [viewIndex, setViewIndex] = useState(0);
  const location = useLocation();
  const { events, setEvents } = useSettings();

  const calendarEvents = events
    .filter((e) => e.date)
    .map((e) => {
      const start = new Date(`${e.date}T${e.startTime || "00:00"}`);
      const end = e.endTime ? new Date(`${e.date}T${e.endTime}`) : new Date(start.getTime() + 60 * 60000);
      return { title: e.title, start, end };
    });

  const currentView = VIEWS[viewIndex];

  // ⭐ Fetch events from backend
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("/api/events", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        // Convert DB events → the shape addEvent.jsx/the calendar expect
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

        // Keep any Google-sourced events (loaded separately, tagged "google-")
        // instead of clobbering them with this DB-only fetch.
        setEvents((prev) => [
          ...formatted,
          ...prev.filter((e) => String(e.id).startsWith("google-")),
        ]);
      })
      .catch(err => console.error("Error loading events:", err));
  }, []);

  const cycleView = () => {
    setViewIndex((prev) => (prev + 1) % VIEWS.length);
  };

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
            views={VIEWS}
            style={{ height: "100%", width: "100%" }}
          />
        </div>
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
