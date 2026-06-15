import React from "react";
import {Link} from "react-router-dom";
import "./main.css";

import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";

// Setup datetime for in us
const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

//Events for google calendar sample for now
const events = [
  {
    title: "Sample Event",
    start: new Date(2026, 5, 10, 10, 0),
    end: new Date(2026, 5, 10, 12, 0),
  },
];

export default function MainPage() {
  return (
    <div className="app-container">
      {/* Calendar Section */}
      <div className="calendar-container">
        <h2 className="calendar-title">Your Calendar</h2>

        <div className="calendar-box">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%", width: "100%" }}
            views={["month"]} // Only show month view
          />
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <Link to="/main" className="nav-btn">Home</Link>
        <Link to="/main" className="nav-btn">Calendar</Link>
        <Link to="/taskPage" className="nav-btn">Tasks</Link>
        <button className="nav-btn">Profile</button>
      </div>
    </div>
  );
}
