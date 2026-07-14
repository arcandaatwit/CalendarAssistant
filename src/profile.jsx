import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useSettings } from "./App";
import "./index.css";

export default function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { priorityColors, setPriorityColors, categories, setCategories } = useSettings();
  const [newTag, setNewTag] = useState("");

  const token = localStorage.getItem("token");
  const googleToken = localStorage.getItem("access_token");

  const addTag = () => {
    const t = newTag.trim();
    if (!t || categories.includes(t)) return;
    setCategories([...categories, t]);
    setNewTag("");
  };

  return (
    <div className="app-container">

      <div className="header-bar">
        <h1>Calendar Assistant</h1>
      </div>

      <div className="page-content" style={{ padding: "20px", overflowY: "auto" }}>
        <h2 style={{ marginBottom: "20px" }}>Profile &amp; Settings</h2>

        {/* Account */}
        <div className="card-box" style={{ marginBottom: "16px" }}>
          <h3 style={{ marginBottom: "8px" }}>Account</h3>
          <p style={{ fontSize: "14px", color: "var(--text-secondary, #888)" }}>
            {googleToken ? "Signed in with Google" : token ? "Signed in with email" : "Not signed in"}
          </p>
          <button className="secondary-btn" style={{ marginTop: "12px" }} onClick={() => {
            localStorage.removeItem("token"); localStorage.removeItem("access_token"); navigate("/");
          }}>Sign Out</button>
        </div>

        {/* Priority Colors */}
        <div className="card-box" style={{ marginBottom: "16px" }}>
          <h3 style={{ marginBottom: "12px" }}>Priority Colors</h3>
          {["high", "medium", "low"].map((level) => (
            <div key={level} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ fontSize: "14px", textTransform: "capitalize", color: priorityColors[level], fontWeight: "600" }}>{level}</span>
              <input
                type="color"
                value={priorityColors[level]}
                onChange={(e) => setPriorityColors({ ...priorityColors, [level]: e.target.value })}
                style={{ width: "40px", height: "32px", border: "none", borderRadius: "6px", cursor: "pointer", background: "none" }}
              />
            </div>
          ))}
        </div>

        {/* Categories / Tags */}
        <div className="card-box" style={{ marginBottom: "16px" }}>
          <h3 style={{ marginBottom: "12px" }}>Event Categories</h3>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
            {categories.map((tag) => (
              <span
                key={tag}
                className="task-tag"
                style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px" }}
              >
                {tag}
                <button
                  onClick={() => setCategories(categories.filter((c) => c !== tag))}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", padding: "0", lineHeight: 1, color: "inherit", opacity: 0.6 }}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>

          <div className="input-row" style={{ marginBottom: 0 }}>
            <input
              className="input-field"
              type="text"
              placeholder="New category..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTag()}
            />
            <button className="secondary-btn" style={{ whiteSpace: "nowrap" }} onClick={addTag}>
              Add
            </button>
          </div>
        </div>

        {/* About */}
        <div className="card-box">
          <h3 style={{ marginBottom: "8px" }}>About</h3>
          <p style={{ fontSize: "14px", color: "var(--text-secondary, #888)" }}>Calendar Assistant v1.0</p>
        </div>
      </div>

      <div className="bottom-nav">
        <Link to="/main"     className={`nav-btn ${location.pathname === "/main"     ? "active" : ""}`}>Home</Link>
        <Link to="/addEvent" className={`nav-btn ${location.pathname === "/addEvent" ? "active" : ""}`}>Event</Link>
        <Link to="/taskPage" className={`nav-btn ${location.pathname === "/taskPage" ? "active" : ""}`}>Tasks</Link>
        <Link to="/profile"  className={`nav-btn ${location.pathname === "/profile"  ? "active" : ""}`}>Profile</Link>
      </div>

    </div>
  );
}
