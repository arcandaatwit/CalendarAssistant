import { useState } from "react";
import { Link } from "react-router-dom";
import { useSettings } from "./App";
import { apiFetch, taskToApiPayload } from "./api";
import "./index.css";

const TYPE_LABELS = {
  todo:      "To-Do",
  reminder:  "Reminder",
  scheduled: "Scheduled",
};

function TasksPage() {
  const { tasks, setTasks, refreshTasks, priorityColors } = useSettings();

  const [taskTitle, setTaskTitle] = useState("");
  const [taskType, setTaskType]   = useState("todo");
  const [taskDate, setTaskDate]   = useState("");
  const [taskTime, setTaskTime]   = useState("");
  const [priority, setPriority]   = useState("medium");

  const addTask = async () => {
    if (!taskTitle.trim()) return;

    if (!localStorage.getItem("token")) {
      alert("You must be logged in.");
      return;
    }

    const payload = taskToApiPayload({
      title: taskTitle,
      type: taskType,
      date: taskType === "todo" ? null : taskDate,
      time: taskType === "todo" ? null : taskTime,
      priority,
      completed: false,
    });

    try {
      await apiFetch("/api/tasks", { method: "POST", body: payload });
      // createTask only returns a status message, not the created row — refetch.
      await refreshTasks();

      setTaskTitle("");
      setTaskType("todo");
      setTaskDate("");
      setTaskTime("");
      setPriority("medium");
    } catch (err) {
      console.error(err);
      alert("Error creating task");
    }
  };

  const toggleComplete = async (task) => {
    const payload = taskToApiPayload({ ...task, completed: !task.completed });
    try {
      await apiFetch(`/api/tasks/${task.id}`, { method: "PUT", body: payload });
      setTasks(tasks.map((t) => t.id === task.id ? { ...t, completed: !t.completed } : t));
    } catch (err) {
      console.error(err);
      alert("Error updating task");
    }
  };

  const deleteTask = async (id) => {
    try {
      await apiFetch(`/api/tasks/${id}`, { method: "DELETE" });
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

          {/* priority */}
          <div className="input-row" style={{ gap: "8px" }}>
            {["high", "medium", "low"].map((p) => (
              <button
                key={p}
                type="button"
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
                      onChange={() => toggleComplete(t)}
                    />
                    <span>{t.title}</span>
                  </label>
                  <div className="task-meta">
                    <span className="task-tag">{TYPE_LABELS[t.type]}</span>
                    <span
                      className="task-tag"
                      style={{ background: priorityColors[t.priority] + "22", color: priorityColors[t.priority] }}
                    >
                      {t.priority}
                    </span>
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
                      onChange={() => toggleComplete(t)}
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
        <Link to="/profile" className="nav-btn">Profile</Link>
      </div>

    </div>
  );
}

export default TasksPage;
