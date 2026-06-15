import React from "react";
import './index.css';

export default function AddEvent() {
  return (
    <div className="add-event-container">
      <h2 className="page-title">Add New Event</h2>

      <div className="form-group">
        <label>Event Title</label>
        <input type="text" placeholder="Enter event name" />
      </div>

      <div className="form-group">
        <label>Date</label>
        <input type="date" />
      </div>

      <div className="form-group">
        <label>Start Time</label>
        <input type="time" />
      </div>

      <div className="form-group">
        <label>End Time</label>
        <input type="time" />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea placeholder="Optional details"></textarea>
      </div>

      <button className="save-btn">Save Event</button>
    </div>
  );
}
