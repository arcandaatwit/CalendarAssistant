import React from "react";
import "./layout.css";

export default function Layout({ children }) {
  return (
    <div className="layout-container">

      <div className="grid-item item-0 header-bar">
        <h1>Calendar Assistant</h1>
      </div>

      <div className="grid-item item-1 page-content">
        {children}
      </div>

      <div className="grid-item item-2 bottom-nav">
        <button className="nav-btn">Home</button>
        <button className="nav-btn">Calendar</button>
        <button className="nav-btn">Tasks</button>
        <button className="nav-btn">Habits</button>
        <button className="nav-btn">Profile</button>
      </div>

    </div>
  );
}
