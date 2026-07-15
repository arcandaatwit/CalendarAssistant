import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { generateSuggestions } from "./probability";
import "../index.css";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// TODO: replace with real events fetched from the database / Google Calendar API
const MOCK_HISTORY = [];

export default function SchedulerPage() {
  const location = useLocation();
  const [lookahead, setLookahead] = useState(14); // 7 or 14 days
  const [suggestions, setSuggestions] = useState([]);
  const [ran, setRan] = useState(false);

  const runScheduler = () => {
    // TODO: swap MOCK_HISTORY for real fetched events
    const results = generateSuggestions(MOCK_HISTORY, lookahead);
    setSuggestions(results);
    setRan(true);
  };

  return (
    <div className="app-container">

      <div className="header-bar">
        <h1>Calendar Assistant</h1>
      </div>

      <div className="page-content" style={{ padding: "20px", overflowY: "auto" }}>
        <h2 style={{ marginBottom: "4px" }}>Smart Scheduler</h2>
        <p style={{ fontSize: "13px", color: "var(--text-secondary, #888)", marginBottom: "20px" }}>
          Analyzes your calendar history to suggest likely busy windows.
        </p>

        {/* Controls */}
        <div className="card-box" style={{ marginBottom: "16px" }}>
          <h3 style={{ marginBottom: "12px" }}>Lookahead Window</h3>
          <div className="input-row" style={{ gap: "8px" }}>
            {[7, 14].map((d) => (
              <button
                key={d}
                onClick={() => setLookahead(d)}
                className={lookahead === d ? "primary-btn" : "secondary-btn"}
                style={{ flex: 1 }}
              >
                {d} days
              </button>
            ))}
          </div>
          <button className="primary-btn" style={{ marginTop: "12px" }} onClick={runScheduler}>
            Generate Suggestions
          </button>
        </div>

        {/* Results */}
        {ran && suggestions.length === 0 && (
          <div className="card-box">
            <p className="empty-text">
              Not enough calendar history yet — add more events and try again.
            </p>
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="card-box">
            <h3 style={{ marginBottom: "12px" }}>Top Suggested Slots</h3>
            {suggestions.slice(0, 10).map((s, i) => (
              <div key={i} className="task-item">
                <div className="task-row" style={{ justifyContent: "space-between" }}>
                  <span style={{ fontWeight: "500" }}>
                    {DAY_NAMES[s.date.getDay()]} {s.date.toLocaleDateString()} · {s.date.getHours()}:00
                  </span>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary, #888)" }}>
                    {Math.round(s.score * 100)}% likely
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bottom-nav">
        <Link to="/main"      className={`nav-btn ${location.pathname === "/main"      ? "active" : ""}`}>Home</Link>
        <Link to="/addEvent"  className={`nav-btn ${location.pathname === "/addEvent"  ? "active" : ""}`}>Event</Link>
        <Link to="/taskPage"  className={`nav-btn ${location.pathname === "/taskPage"  ? "active" : ""}`}>Tasks</Link>
        <Link to="/profile"   className={`nav-btn ${location.pathname === "/profile"   ? "active" : ""}`}>Profile</Link>
      </div>

    </div>
  );
}


//pseudo code for the generateSuggestions function
/*
# ---------- 1. Data model ----------
Task = {
    "id": str, "type": str, "duration_min": int,
    "fixed": bool,            # True = can't move (e.g. a meeting)
    "deadline": datetime|None,
    "priority": float
}

TimeSlot = {"start": datetime, "end": datetime}

HistoryEntry = {
    "task_type": str, "start": datetime, "day_of_week": int,
    "preceded_by": str|None, "outcome": "kept"|"moved"|"skipped",
    "energy_after": float|None   # optional self-report
}

# ---------- 2. Learn a scoring function from history ----------
def build_preference_model(history):
    # simplest version: success rate by (task_type, hour_bucket, prev_task_type)
    stats = defaultdict(lambda: {"success": 0, "total": 0})
    for h in history:
        key = (h.task_type, hour_bucket(h.start), h.preceded_by)
        stats[key]["total"] += 1
        if h.outcome == "kept":
            stats[key]["success"] += 1
    return stats   # -> lookup table of success probabilities

def score_slot(task, slot, prev_task, model, weights):
    key = (task.type, hour_bucket(slot.start), prev_task.type if prev_task else None)
    fit = model[key]["success"] / max(model[key]["total"], 1) if key in model else 0.5  # prior

    productivity = fit if task.type in DEEP_WORK_TYPES else 0.5
    conflict_penalty = 0 if slot_is_free(slot) else -1
    balance_penalty = -overload_score(slot.start.date(), task, current_schedule)

    return (weights["fit"]      * fit
          + weights["prod"]     * productivity
          + weights["conflict"] * conflict_penalty
          + weights["balance"]  * balance_penalty)

# ---------- 3. Generate candidate schedules (genetic / local search) ----------
def generate_schedule(tasks, model, weights, n_candidates=5, generations=200):
    population = [random_valid_schedule(tasks) for _ in range(30)]

    for gen in range(generations):
        scored = [(s, total_score(s, model, weights)) for s in population]
        scored.sort(key=lambda x: -x[1])
        survivors = [s for s, _ in scored[:10]]

        population = survivors[:]
        while len(population) < 30:
            parent_a, parent_b = random.sample(survivors, 2)
            child = crossover(parent_a, parent_b)   # merge task placements
            child = mutate(child)                   # swap/shift a task's slot
            if is_valid(child):                     # respects hard constraints
                population.append(child)

    scored = sorted(population, key=lambda s: -total_score(s, model, weights))
    return dedupe_similar(scored)[:n_candidates]     # return a diverse top-N, not just #1

def total_score(schedule, model, weights):
    return sum(score_slot(t, s, prev, model, weights)
               for t, s, prev in schedule.placements)

# ---------- 4. Present options + capture feedback ----------
def on_user_action(task, chosen_slot, action):
    # action: "accepted" | "moved" | "skipped"
    history.append(HistoryEntry(
        task_type=task.type, start=chosen_slot.start,
        day_of_week=chosen_slot.start.weekday(),
        preceded_by=prev_task_type(chosen_slot),
        outcome="kept" if action == "accepted" else action
    ))
    # optional: online update instead of full retrain
    update_model_incrementally(model, task, chosen_slot, action)

# ---------- 5. Retrain periodically ----------
def nightly_job():
    global model
    model = build_preference_model(history)   # or partial re-weight with recency decay


*/