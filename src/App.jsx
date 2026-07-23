import { createContext, useContext, useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./login";
import MainPage from "./main";
import AddEventPage from "./addEvent";
import Tasks from "./taskPage";
import ProfilePage from "./profile";
import './index.css';

const DEFAULT_PRIORITY_COLORS = { high: "#d33636", medium: "#f7b731", low: "#688bf2" };
const DEFAULT_CATEGORIES = ["Work", "School", "Personal", "Kids", "Health", "Other"];

function load(key, fallback) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; }
  catch { return fallback; }
}

export function usePersisted(key, fallback) {
  const [val, setVal] = useState(() => load(key, fallback));
  const set = (v) => { setVal(v); localStorage.setItem(key, JSON.stringify(v)); };
  return [val, set];
}

export const SettingsContext = createContext(null);
export function useSettings() { return useContext(SettingsContext); }

function App() {
  const [priorityColors, setPriorityColors] = usePersisted("priorityColors", DEFAULT_PRIORITY_COLORS);
  const [categories, setCategories]         = usePersisted("categories", DEFAULT_CATEGORIES);
  const [theme, setTheme]                   = usePersisted("theme", "spring");
  const [events, setEvents]                 = useState([]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    // Google OAuth redirects back to /main?token=... — grab it before anything else runs.
    const params = new URLSearchParams(window.location.search);
    const tokenFromRedirect = params.get("token");
    if (tokenFromRedirect) {
      localStorage.setItem("token", tokenFromRedirect);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    // Google-sourced events are read-only and never stored in our DB — they
    // get appended on top of whatever's already loaded, tagged with a
    // "google-" id prefix so the UI can tell them apart.
    fetch("/api/google-events", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        if (!data?.connected || !data.events?.length) return;
        setEvents((prev) => [
          ...prev.filter((e) => !String(e.id).startsWith("google-")),
          ...data.events.map((ev) => ({
            id: String(ev.id).startsWith("google-") ? ev.id : `google-${ev.id}`,
            title: ev.title,
            description: ev.description || "",
            date: ev.date,
            startTime: ev.startTime || ev.start_time?.slice(0, 5) || "",
            endTime: ev.endTime || ev.end_time?.slice(0, 5) || "",
            category: ev.category || "google",
            priority: ev.priority || "medium",
          })),
        ]);
      })
      .catch((err) => console.error("Error loading Google Calendar events:", err));
  }, []);

  return (
    <SettingsContext.Provider value={{
      priorityColors, setPriorityColors,
      categories, setCategories,
      theme, setTheme,
      events, setEvents,
    }}>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/addEvent" element={<AddEventPage />} />
        <Route path="/taskPage" element={<Tasks />}/>
        <Route path="/profile" element={<ProfilePage />}/>
      </Routes>
    </SettingsContext.Provider>
  );
}

export default App;

