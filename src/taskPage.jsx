import React, { useState } from "react";
import "./index.css";

function TasksPage() {
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [taskTime, setTaskTime] = useState("");
  const [taskLocation, setTaskLocation] = useState("");
  const [taskType, setTaskType] = useState("task"); // option of making task or habit 

  const [tasks, setTasks] = useState([]);

  const addTask = () => {
    if (!taskTitle.trim()) return;

    const newTask = {
      id: Date.now(),
      title: taskTitle,
      date: taskDate,
      time: taskTime,
      location: taskLocation,
      type: taskType,
      completed: false,
    };

    setTasks([...tasks, newTask]);

    // clear fields
    setTaskTitle("");
    setTaskDate("");
    setTaskTime("");
    setTaskLocation("");
    setTaskType("task");
  };

  const toggleComplete = (id) => {
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  return (
    <div className="app-container">
      <h2 className="page-title">Create a Task</h2>

      <div className="card-box">
        <div className="input-row">
          <input
            className="input-field"
            type="text"
            placeholder="Task title..."
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
          />
        </div>

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

        <div className="input-row">
          <input
            className="input-field"
            type="text"
            placeholder="Location (optional)"
            value={taskLocation}
            onChange={(e) => setTaskLocation(e.target.value)}
          />
        </div>

        <div className="input-row">
          <select
            className="input-field"
            value={taskType}
            onChange={(e) => setTaskType(e.target.value)}
          >
            <option value="task">Task (To‑Do)</option> 
            <option value="event">Event (Calendar)</option>
            <option value="habit">Habit (Tracker)</option> 
          </select>
        </div>

        <button className="primary-btn" onClick={addTask}> 
          Add
        </button>
      </div>

      <h2 className="page-title">Your Tasks</h2>

      <div className="card-box">
        {tasks.length === 0 && (
          <p className="empty-text">No tasks yet — add one above.</p>
        )}

        {tasks.map((t) => (
          <div key={t.id} className="task-item">
            <label className="task-row">
              <input
                type="checkbox"
                checked={t.completed}
                onChange={() => toggleComplete(t.id)}
              />
              <span className={t.completed ? "task-done" : ""}>
                {t.title}
              </span>
            </label>

            <div className="task-meta">
              {t.date && <p>{t.date}</p>}
              {t.time && <p>{t.time}</p>}
              {t.location && <p>{t.location}</p>}
              <p className="task-tag">{t.type}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bottom-nav">
        <button className="nav-btn">Home</button>
        <button className="nav-btn">Calendar</button>
        <button className="nav-btn">Tasks</button>
        <button className="nav-btn">Profile</button>
      </div>
    </div>
  );
}

export default TasksPage;
