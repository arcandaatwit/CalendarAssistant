import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSettings, usePersisted } from "./App";
import { findOpenSlots } from "./scheduler/probability";
import "./index.css";

function pad(n) { return String(n).padStart(2, "0"); }
function toDateInput(date) { return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`; }
function toTimeInput(date) { return `${pad(date.getHours())}:${pad(date.getMinutes())}`; }

export default function AddEventPage() {
  const location = useLocation();
  const { priorityColors, categories, events, setEvents } = useSettings();
  const safeEvents = Array.isArray(events) ? events : [];

  const [tasks] = usePersisted("tasks", []);

  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [category, setCategory] = useState("Personal");
  const [priority, setPriority] = useState("medium");

  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsRan, setSuggestionsRan] = useState(false);

  // -----------------------------
  // SCHEDULER
  // -----------------------------
  const scheduleForMe = () => {
    let durationMinutes = 60;

    if (startTime && endTime) {
      const [sh, sm] = startTime.split(":").map(Number);
      const [eh, em] = endTime.split(":").map(Number);
      const diff = (eh * 60 + em) - (sh * 60 + sm);
      if (diff > 0) durationMinutes = diff;
    }

    setSuggestions(findOpenSlots({ events: safeEvents, tasks, durationMinutes }));
    setSuggestionsRan(true);
  };

  const applySuggestion = (slot) => {
    setEventDate(toDateInput(slot.date));
    setStartTime(toTimeInput(slot.date));
    setEndTime(toTimeInput(new Date(slot.date.getTime() + slot.durationMinutes * 60000)));
    setSuggestions([]);
    setSuggestionsRan(false);
  };

  // -----------------------------
  // ADD EVENT
  // -----------------------------
  const addEvent = async () => {
    if (!eventTitle.trim()) return;
    if (!eventDate) return alert("Please select a date.");
    if (!startTime || !endTime) return alert("Please select start and end time.");

    const token = localStorage.getItem("token");
    if (!token) return alert("You must be logged in.");

    const normalizedStart = startTime.length === 5 ? startTime + ":00" : startTime;
    const normalizedEnd = endTime.length === 5 ? endTime + ":00" : endTime;

    const payload = {
      title: eventTitle,
      description: eventDescription,
      date: eventDate,
      start_time: normalizedStart,
      end_time: normalizedEnd,
      category: category.toLowerCase(),
      priority
    };

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        console.error(data);
        return alert("Failed to create event");
      }

      setEvents([...safeEvents, data]);

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

  // -----------------------------
  // DELETE EVENT
  // -----------------------------
  const deleteEvent = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("You must be logged in.");

    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) {
        console.error(data);
        return alert("Failed to delete event");
      }

      setEvents(safeEvents.filter(e => e.id !== id));

    } catch (err) {
      console.error(err);
      alert("Error deleting event");
    }
  };

  // -----------------------------
  // SORT EVENTS BY PRIORITY
  // -----------------------------
  const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
  const sortedEvents = [...safeEvents].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  );

  // -----------------------------
  // RENDER
  // -----------------------------
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

          <div className="input-row">
            <button type="button" className="secondary-btn" style={{ flex: 1 }} onClick={scheduleForMe}>
              Schedule for me
            </button>
          </div>

          {suggestions.length > 0 && (
            <div className="input-row" style={{ flexWrap: "wrap", gap: "6px" }}>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  className="secondary-btn"
                  style={{ flex: "1 1 45%" }}
                  onClick={() => applySuggestion(s)}
                >
                  {s.date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} · {toTimeInput(s.date)}
                </button>
              ))}
            </div>
          )}

          {suggestionsRan && suggestions.length === 0 && (
            <p className="empty-text">No open slots found in the next 14 days.</p>
          )}

          <div className="input-row">
            <select
              className="input-field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="input-row" style={{ gap: "8px" }}>
            {["high", "medium", "low"].map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "10px",
                  border: `2px solid ${priorityColors[p]}`,
                  background: priority === p ? priorityColors[p] : "transparent",
                  color: priority === p ? "white" : priorityColors[p],
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
                  style={{ borderLeft: `4px solid ${priorityColors[e.priority]}`, paddingLeft: "10px" }}
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
                        style={{ background: priorityColors[e.priority] + "22", color: priorityColors[e.priority] }}
                      >
                        {e.priority}
                      </span>
                    </div>

                    {e.date && (
                      <p>
                        {e.date}
                        {(e.start_time || e.end_time) ? ` · ${e.start_time} — ${e.end_time}` : ""}
                      </p>
                    )}

                    {e.description && <p>{e.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {safeEvents.length === 0 && (
          <div className="card-box">
            <p className="empty-text">No events yet — add one above.</p>
          </div>
        )}
      </div>

      <div className="bottom-nav">
        <Link to="/main" className="nav-btn">Calendar</Link>
        <Link to="/addEvent" className="nav-btn active">Event</Link>
        <Link to="/taskPage" className={`nav-btn ${location.pathname === "/taskPage" ? "active" : ""}`}>Task</Link>
        <Link to="/profile" className={`nav-btn ${location.pathname === "/profile" ? "active" : ""}`}>Profile</Link>
      </div>

    </div>
  );
}
