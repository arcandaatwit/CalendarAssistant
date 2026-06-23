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
  const [events, setEvents] = useState([]);
  const location = useLocation();
  const { events } = useSettings();

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

    fetch("http://localhost:5000/api/events", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        // Convert DB events → react-big-calendar format
        const formatted = data.map(ev => ({
          title: ev.title,
          start: new Date(ev.date + "T" + ev.start_time),
          end: new Date(ev.date + "T" + ev.end_time)
        }));

        setEvents(formatted);
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
