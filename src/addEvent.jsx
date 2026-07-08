import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import './index.css';

const CATEGORIES = ["Work", "School", "Personal", "Kids", "Health", "Other"];

const PRIORITY_COLORS = {
  high:   "#d33636",
  medium: "#f7b731",
  low:    "#688bf2",
};

export default function AddEventPage() {
  const location = useLocation();

  const [eventTitle, setEventTitle]         = useState("");
  const [eventDate, setEventDate]           = useState("");
  const [startTime, setStartTime]           = useState("");
  const [endTime, setEndTime]               = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [category, setCategory]             = useState("Personal");
  const [priority, setPriority]             = useState("medium");

  const [events, setEvents] = useState([]);

 const addEvent = async () => {
  if (!eventTitle.trim()) return;

  const token = localStorage.getItem("token");
  if (!token) {
    alert("You must be logged in.");
    return;
  }

  const payload = {
    user_id: 17, // later you can decode from token
    title: eventTitle,
    description: eventDescription,
    date: eventDate,
    start_time: startTime + ":00",
    end_time: endTime + ":00",
    category: category.toLowerCase(),   // "Personal" → "personal"
    priority: priority
  };

  try {
    const res = await fetch("http://localhost:5000/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      alert("Failed to create event");
      console.error(data);
      return;
    }

    // Add returned event to UI
    setEvents([...events, data]);

    // Reset form
    setEventTitle("");
    setEventDate("");
    setStartTime("");
    setEndTime("");
    setEventDescription("");
    setCategory("Personal");
    setPriority("medium");

  } catch (err) {
    console.error(err);
    alert("Error creating event");
  }
};

  const deleteEvent = (id) => {
    setEvents(events.filter((e) => e.id !== id));
  };

  // sort by priority: high first
  const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
  const sortedEvents = [...events].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  );

  return (
    <div className="app-container">

      <div className="header-bar">
        <h1>Calendar Assistant</h1>
      </div>

      <div className="page-content">
        <h2 className="page-title">Events</h2>

        <div className="card-box">
          <div className="input-row">
            <input
              className="input-field"
              type="text"
              placeholder="Event title..."
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
            />
          </div>

          <div className="input-row">
            <input
              className="input-field"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
          </div>

          <div className="input-row">
            <input
              className="input-field"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <input
              className="input-field"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>

          {/* category */}
          <div className="input-row">
            <select
              className="input-field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* priority */}
          <div className="input-row" style={{ gap: "8px" }}>
            {["high", "medium", "low"].map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "10px",
                  border: `2px solid ${PRIORITY_COLORS[p]}`,
                  background: priority === p ? PRIORITY_COLORS[p] : "transparent",
                  color: priority === p ? "white" : PRIORITY_COLORS[p],
                  fontFamily: "inherit",
                  fontSize: "13px",
                  cursor: "pointer",
                  fontWeight: priority === p ? "600" : "400",
                }}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          <div className="input-row">
            <textarea
              className="input-field"
              placeholder="Description (optional)"
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              rows={3}
              style={{ resize: "none" }}
            />
          </div>

          <button className="primary-btn" onClick={addEvent}>
            Add
          </button>
        </div>

        {sortedEvents.length > 0 && (
          <>
            <h2 className="page-title">Your Events</h2>
            <div className="card-box">
              {sortedEvents.map((e) => (
                <div
                  key={e.id}
                  className="task-item"
                  style={{ borderLeft: `4px solid ${PRIORITY_COLORS[e.priority]}`, paddingLeft: "10px" }}
                >
                  <div className="task-row" style={{ justifyContent: "space-between" }}>
                    <span style={{ fontWeight: "500", color: "var(--text-h)" }}>{e.title}</span>
                    <button
                      className="link-btn"
                      style={{ fontSize: "12px", padding: "0" }}
                      onClick={() => deleteEvent(e.id)}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="task-meta">
                    <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                      <span className="task-tag">{e.category}</span>
                      <span
                        className="task-tag"
                        style={{ background: PRIORITY_COLORS[e.priority] + "22", color: PRIORITY_COLORS[e.priority] }}
                      >
                        {e.priority}
                      </span>
                    </div>
                    {e.date && <p>{e.date}{(e.startTime || e.endTime) ? ` · ${e.startTime} — ${e.endTime}` : ""}</p>}
                    {e.description && <p>{e.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {events.length === 0 && (
          <div className="card-box">
            <p className="empty-text">No events yet — add one above.</p>
          </div>
        )}
      </div>

      <div className="bottom-nav">
        <Link to="/main"     className="nav-btn">Calendar</Link>
        <Link to="/addEvent" className="nav-btn active">Event</Link>
        <Link to="/taskPage" className={`nav-btn ${location.pathname === "/taskPage" ? "active" : ""}`}>Task</Link>
        <button className="nav-btn">Profile</button>
      </div>

    </div>
  );
}
