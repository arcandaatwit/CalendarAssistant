import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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

// sample events — replace with google calendar api data later
const events = [
  {
    title: "Sample Event",
    start: new Date(2026, 5, 10, 10, 0),
    end: new Date(2026, 5, 10, 12, 0),
  },
];

const VIEWS = ["month", "week", "work_week", "day"];
const VIEW_LABELS = { month: "Month", week: "Week", work_week: "3 Day", day: "Day" };

export default function MainPage() {
  const [viewIndex, setViewIndex] = useState(0);
  const location = useLocation();

  const currentView = VIEWS[viewIndex];

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
            events={events}
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
        <button className="nav-btn">Profile</button>
      </div>

    </div>
  );
}
