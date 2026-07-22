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
  const location = useLocation();
  const { events, setEvents } = useSettings();

  const safeEvents = Array.isArray(events) ? events : [];

  // -----------------------------
  // HOLIDAYS FOR CURRENT YEAR
  // -----------------------------
  const currentYear = new Date().getFullYear();
  const HOLIDAYS = getUSHolidays(currentYear);

  const holidayEvents = HOLIDAYS.map(h => ({
    id: `holiday-${h.date}`,
    title: h.title,
    start: new Date(`${h.date}T00:00`),
    end: new Date(`${h.date}T23:59`)
  }));

  // -----------------------------
  // MERGE BACKEND EVENTS + HOLIDAYS
  // -----------------------------
  const calendarEvents = [
    ...safeEvents.map(e => {
      const dateOnly = e.date.includes("T") ? e.date.split("T")[0] : e.date;
      const startTime = e.start_time?.slice(0, 5);
      const endTime = e.end_time?.slice(0, 5);

      return {
        id: e.id,
        title: e.title,
        start: new Date(`${dateOnly}T${startTime}`),
        end: new Date(`${dateOnly}T${endTime}`)
      };
    }),

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
        const backendEvents =
          Array.isArray(data)
            ? data
            : Array.isArray(data.events)
              ? data.events
              : [];

        setEvents(backendEvents);
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
  // RENDER
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
