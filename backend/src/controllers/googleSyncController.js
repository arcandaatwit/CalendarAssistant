// src/controllers/googleSyncController.js
import { syncGoogleData } from "../services/googleSyncService.js";

export const syncGoogle = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!req.user.googleRefreshToken) {
      return res.status(200).json({ message: "No Google account linked" });
    }

    const userId = req.user.id;
    const refreshToken = req.user.googleRefreshToken;

    const result = await syncGoogleData(refreshToken, userId);

    res.json({
      message: "Google sync complete",
      events: result.events,
      tasks: result.tasks
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Google sync failed" });
  }
};
