import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./index.css";

const TYPE_LABELS = {
  todo:      "To-Do",
  reminder:  "Reminder",
  scheduled: "Scheduled",
};

function TasksPage() {
  const [taskTitle, setTaskTitle] = useState("");
  const [taskType, setTaskType]   = useState("todo");
  const [taskDate, setTaskDate]   = useState("");
  const [taskTime, setTaskTime]   = useState("");

  const [tasks, setTasks] = useState([]);

  const addTask = () => {
    if (!taskTitle.trim()) return;

    const newTask = {
      id: Date.now(),
      title: taskTitle,
      type: taskType,
      date: taskDate,
      time: taskTime,
      completed: false,
    };

    setTasks([...tasks, newTask]);

    setTaskTitle("");
    setTaskType("todo");
    setTaskDate("");
    setTaskTime("");
  };

  const toggleComplete = (id) => {
    setTasks(tasks.map((t) => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
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
                      onChange={() => toggleComplete(t.id)}
                    />
                    <span>{t.title}</span>
                  </label>
                  <div className="task-meta">
                    <span className="task-tag">{TYPE_LABELS[t.type]}</span>
                    {t.date && <span> · {t.date}{t.time ? ` at ${t.time}` : ""}</span>}
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
                      onChange={() => toggleComplete(t.id)}
                    />
                    <span className="task-done">{t.title}</span>
                  </label>
                  <div className="task-meta" style={{ display: "flex", justifyContent: "space-between" }}>
                    <span className="task-tag">{TYPE_LABELS[t.type]}</span>
                    <button
                      className="link-btn"
                      style={{ fontSize: "12px", padding: "0" }}
                      onClick={() => deleteTask(t.id)}
                    >
                      Remove
                    </button>
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
        <button className="nav-btn">Profile</button>
      </div>

    </div>
  );
}

export default TasksPage;
