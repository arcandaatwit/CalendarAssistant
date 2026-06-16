import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import './index.css';

export default function AddEventPage() {
  const location = useLocation();

  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [eventDescription, setEventDescription] = useState("");

  const [events, setEvents] = useState([]);

  const addEvent = () => {
    if (!eventTitle.trim()) return;

    const newEvent = {
      id: Date.now(),
      title: eventTitle,
      date: eventDate,
      startTime: startTime,
      endTime: endTime,
      description: eventDescription,
    };

    setEvents([...events, newEvent]);

    // clear fields
    setEventTitle("");
    setEventDate("");
    setStartTime("");
    setEndTime("");
    setEventDescription("");
  };

  return (
    <div className="app-container">

      <div className="header-bar">
        <h1>Calendar Assistant</h1>
      </div>

      <div className="page-content">
        <h2 className="page-title">Add an Event</h2>

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

        <h2 className="page-title">Your Events</h2>

        <div className="card-box">
          {events.length === 0 && (
            <p className="empty-text">No events yet — add one above.</p>
          )}

          {events.map((e) => (
            <div key={e.id} className="task-item">
              <div className="task-row">
                <span>{e.title}</span>
              </div>

              <div className="task-meta">
                {e.date && <p>{e.date}</p>}
                {(e.startTime || e.endTime) && (
                  <p>{e.startTime} — {e.endTime}</p>
                )}
                {e.description && <p>{e.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bottom-nav">
        <Link to="/main"     className="nav-btn">Calendar</Link>
        <Link to="/addEvent" className="nav-btn active">Event</Link>
        <Link to="/taskPage" className={`nav-btn ${location.pathname === "/taskPage" ? "active" : ""}`}>Tasks</Link>
        <button className="nav-btn">Profile</button>
      </div>

    </div>
  );
}
