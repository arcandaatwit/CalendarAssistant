import db from "../config/db.js";

class Event {
  static async upsert(data) {
    const {
      googleId,
      userId,
      title,
      description,
      start,
      end,
      updatedAt
    } = data;

    // Check if event exists
    const [existing] = await db.execute(
      "SELECT id FROM events WHERE google_id = ? AND user_id = ?",
      [googleId, userId]
    );

    if (existing.length > 0) {
      // Update
      await db.execute(
        `UPDATE events 
         SET title = ?, description = ?, start = ?, end = ?, updated_at = ?
         WHERE google_id = ? AND user_id = ?`,
        [title, description, start, end, updatedAt, googleId, userId]
      );
    } else {
      // Insert
      await db.execute(
        `INSERT INTO events 
         (google_id, user_id, title, description, start, end, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [googleId, userId, title, description, start, end, updatedAt]
      );
    }
  }
}

export default Event;
