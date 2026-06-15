import React, { useState } from "react";
import "./app.css";

export default function TasksPage() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);

  const addTask = () => {
    if (!task.trim()) return;
    setTasks([...tasks, task]);
    setTask("");
  };

  return (
    <div className="app-container">
      {/* Tasks Section */}
      <div className="tasks-container">
        <h2 className="tasks-title">Your Tasks</h2>

        <div className="tasks-box">
          <div className="input-row">
            <input
              className="task-input"
              type="text"
              placeholder="Enter a new task..."
              value={task}
              onChange={(e) => setTask(e.target.value)}
            />
            <button className="add-btn" onClick={addTask}>
              Add
            </button>
          </div>

          <div className="task-list">
            {tasks.length === 0 && (
              <p className="empty-text">No tasks yet — addadd one above.</p>
            )}

            {tasks.map((t, index) => (
              <div key={index} className="task-item">
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <button className="nav-btn">Home</button>
        <button className="nav-btn">Calendar</button>
        <button className="nav-btn">Tasks</button>
        <button className="nav-btn">Profile</button>
      </div>
    </div>
  );
}
//export default Tasks;
