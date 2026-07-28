import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSettings, TASK_TYPE_TO_API } from "./App";
import ChatWidget from "./ChatWidget";
import "./index.css";

const TYPE_LABELS = {
  todo:      "To-Do",
  reminder:  "Reminder",
  scheduled: "Scheduled",
};

// task.date comes back as a full ISO timestamp once it crosses JSON
// (e.g. "2026-07-28T04:00:00.000Z"); task.time as "HH:MM:SS". Format both
// down to just what's worth showing.
function formatDate(value) {
  if (!value) return "";
  const dateOnly = String(value).slice(0, 10);
  const d = new Date(`${dateOnly}T00:00`);
  if (isNaN(d.getTime())) return dateOnly;
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(value) {
  if (!value) return "";
  const [h, m] = String(value).slice(0, 5).split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return value;
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function TasksPage() {
  const [taskTitle, setTaskTitle] = useState("");
  const [taskType, setTaskType]   = useState("todo");
  const [taskDate, setTaskDate]   = useState("");
  const [taskTime, setTaskTime]   = useState("");

  const { tasks, setTasks, refreshTasks } = useSettings();

  // Routes remount this component fresh on every navigation, so this refetches
  // whichever account's token is current — fixes tasks staying stale across
  // a sign-out/sign-in that didn't do a full page reload.
  useEffect(() => {
    refreshTasks();
  }, []);

  const addTask = async () => {
    if (!taskTitle.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in.");
      return;
    }

    const payload = {
      title: taskTitle,
      type: TASK_TYPE_TO_API[taskType] || "To-Do",
      date: taskType === "todo" ? null : taskDate,
      time: taskType === "todo" ? null : taskTime,
      priority: "medium",
    };

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        alert("Failed to create task");
        return;
      }

      // createTask only returns a status message, not the created row — refetch.
      refreshTasks();

      setTaskTitle("");
      setTaskType("todo");
      setTaskDate("");
      setTaskTime("");
    } catch (err) {
      console.error(err);
      alert("Error creating task");
    }
  };

  const toggleComplete = async (task) => {
    const token = localStorage.getItem("token");
    const payload = {
      title: task.title,
      type: TASK_TYPE_TO_API[task.type] || "To-Do",
      date: task.date,
      time: task.time,
      priority: task.priority,
      completed: task.completed ? 0 : 1,
    };

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        alert("Failed to update task");
        return;
      }

      setTasks(tasks.map((t) => t.id === task.id ? { ...t, completed: !t.completed } : t));
    } catch (err) {
      console.error(err);
      alert("Error updating task");
    }
  };

  const deleteTask = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        alert("Failed to delete task");
        return;
      }

      setTasks(tasks.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
      alert("Error deleting task");
    }
  };

  const pending   = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) =>  t.completed);

  return (
    <div className="app-container">

      <div className="header-bar">
        <h1>Calendar Assistant</h1>
      </div>

      <div className="page-content">
        <h2 className="page-title">Add a Task</h2>

        <div className="card-box">
          <div className="input-row">
            <input
              className="input-field"
              type="text"
              placeholder="What do you need to do?"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />
          </div>

          <div className="input-row">
            <select
              className="input-field"
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
            >
              <option value="todo">To-Do</option>
              <option value="reminder">Reminder</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>

          {/* only show date/time for reminders and scheduled tasks */}
          {(taskType === "reminder" || taskType === "scheduled") && (
            <div className="input-row">
              <input
                className="input-field"
                type="date"
                value={taskDate}
                onChange={(e) => setTaskDate(e.target.value)}
              />
              <input
                className="input-field"
                type="time"
                value={taskTime}
                onChange={(e) => setTaskTime(e.target.value)}
              />
            </div>
          )}

          <button className="primary-btn" onClick={addTask}>
            Add
          </button>
        </div>

        {/* pending tasks */}
        {pending.length > 0 && (
          <>
            <h2 className="page-title">To Do</h2>
            <div className="card-box">
              {pending.map((t) => (
                <div key={t.id} className="task-item">
                  <label className="task-row">
                    <input
                      type="checkbox"
                      checked={t.completed}
                      disabled={String(t.id).startsWith("google-")}
                      onChange={() => toggleComplete(t)}
                    />
                    <span>{t.title}</span>
                  </label>
                  <div className="task-meta">
                    <span className="task-tag">{TYPE_LABELS[t.type]}</span>
                    {t.date && <span> · {formatDate(t.date)}{t.time ? ` at ${formatTime(t.time)}` : ""}</span>}
                    {String(t.id).startsWith("google-") && <span className="task-tag">Google Tasks</span>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* completed tasks */}
        {completed.length > 0 && (
          <>
            <h2 className="page-title">Done</h2>
            <div className="card-box">
              {completed.map((t) => (
                <div key={t.id} className="task-item">
                  <label className="task-row">
                    <input
                      type="checkbox"
                      checked={t.completed}
                      disabled={String(t.id).startsWith("google-")}
                      onChange={() => toggleComplete(t)}
                    />
                    <span className="task-done">{t.title}</span>
                  </label>
                  <div className="task-meta" style={{ display: "flex", justifyContent: "space-between" }}>
                    <span className="task-tag">{TYPE_LABELS[t.type]}</span>
                    {!String(t.id).startsWith("google-") && (
                      <button
                        className="link-btn"
                        style={{ fontSize: "12px", padding: "0" }}
                        onClick={() => deleteTask(t.id)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tasks.length === 0 && (
          <div className="card-box">
            <p className="empty-text">No tasks yet — add one above.</p>
          </div>
        )}
      </div>

      <div className="bottom-nav">
        <Link to="/main"     className="nav-btn">Calendar</Link>
        <Link to="/addEvent" className="nav-btn">Event</Link>
        <Link to="/taskPage" className="nav-btn active">Tasks</Link>
        <Link to="/profile" className="nav-btn">Profile</Link>
      </div>

      <ChatWidget />

    </div>
  );
}

export default TasksPage;
