import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { generateSuggestions } from "./probability";
import "../index.css";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// TODO: replace with real events fetched from the database / Google Calendar API
const MOCK_HISTORY = [];

export default function SchedulerPage() {
  const location = useLocation();
  const [lookahead, setLookahead] = useState(14); // 7 or 14 days
  const [suggestions, setSuggestions] = useState([]);
  const [ran, setRan] = useState(false);

  const runScheduler = () => {
    // TODO: swap MOCK_HISTORY for real fetched events
    const results = generateSuggestions(MOCK_HISTORY, lookahead);
    setSuggestions(results);
    setRan(true);
  };

  return (
    <div className="app-container">

      <div className="header-bar">
        <h1>Calendar Assistant</h1>
      </div>

      <div className="page-content" style={{ padding: "20px", overflowY: "auto" }}>
        <h2 style={{ marginBottom: "4px" }}>Smart Scheduler</h2>
        <p style={{ fontSize: "13px", color: "var(--text-secondary, #888)", marginBottom: "20px" }}>
          Analyzes your calendar history to suggest likely busy windows.
        </p>

        {/* Controls */}
        <div className="card-box" style={{ marginBottom: "16px" }}>
          <h3 style={{ marginBottom: "12px" }}>Lookahead Window</h3>
          <div className="input-row" style={{ gap: "8px" }}>
            {[7, 14].map((d) => (
              <button
                key={d}
                onClick={() => setLookahead(d)}
                className={lookahead === d ? "primary-btn" : "secondary-btn"}
                style={{ flex: 1 }}
              >
                {d} days
              </button>
            ))}
          </div>
          <button className="primary-btn" style={{ marginTop: "12px" }} onClick={runScheduler}>
            Generate Suggestions
          </button>
        </div>

        {/* Results */}
        {ran && suggestions.length === 0 && (
          <div className="card-box">
            <p className="empty-text">
              Not enough calendar history yet — add more events and try again.
            </p>
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="card-box">
            <h3 style={{ marginBottom: "12px" }}>Top Suggested Slots</h3>
            {suggestions.slice(0, 10).map((s, i) => (
              <div key={i} className="task-item">
                <div className="task-row" style={{ justifyContent: "space-between" }}>
                  <span style={{ fontWeight: "500" }}>
                    {DAY_NAMES[s.date.getDay()]} {s.date.toLocaleDateString()} · {s.date.getHours()}:00
                  </span>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary, #888)" }}>
                    {Math.round(s.score * 100)}% likely
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bottom-nav">
        <Link to="/main"      className={`nav-btn ${location.pathname === "/main"      ? "active" : ""}`}>Home</Link>
        <Link to="/addEvent"  className={`nav-btn ${location.pathname === "/addEvent"  ? "active" : ""}`}>Event</Link>
        <Link to="/taskPage"  className={`nav-btn ${location.pathname === "/taskPage"  ? "active" : ""}`}>Tasks</Link>
        <Link to="/profile"   className={`nav-btn ${location.pathname === "/profile"   ? "active" : ""}`}>Profile</Link>
      </div>

    </div>
  );
}
