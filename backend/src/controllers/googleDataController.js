import db from "../config/db.js";
import { fetchGoogleEvents, fetchGoogleTasks } from "../services/googleDataService.js";

async function getRefreshToken(userId) {
  const [rows] = await db.execute(
    "SELECT google_refresh_token FROM users WHERE id = ?",
    [userId]
  );
  return rows[0]?.google_refresh_token || null;
}

export const getGoogleEvents = async (req, res) => {
  try {
    const refreshToken = await getRefreshToken(req.user.id);
    if (!refreshToken) {
      return res.json({ connected: false, events: [] });
    }

    const events = await fetchGoogleEvents(refreshToken);
    return res.json({ connected: true, events });
  } catch (err) {
    console.error("Google events fetch failed:", err);
    return res.status(502).json({ error: "Failed to fetch Google Calendar events." });
  }
};

export const getGoogleTasks = async (req, res) => {
  try {
    const refreshToken = await getRefreshToken(req.user.id);
    if (!refreshToken) {
      return res.json({ connected: false, tasks: [] });
    }

    const tasks = await fetchGoogleTasks(refreshToken);
    return res.json({ connected: true, tasks });
  } catch (err) {
    console.error("Google tasks fetch failed:", err);
    return res.status(502).json({ error: "Failed to fetch Google Tasks." });
  }
};
