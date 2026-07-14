import { createContext, useContext, useState } from "react";
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
  const [events, setEvents]                 = useState([]);

  return (
    <SettingsContext.Provider value={{ priorityColors, setPriorityColors, categories, setCategories, events, setEvents }}>
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

