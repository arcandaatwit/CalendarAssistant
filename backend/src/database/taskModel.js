import db from "../config/db.js";

class Task {
  static async upsert(data) {
    const {
      googleId,
      userId,
      title,
      notes,
      dueDate,
      status,
      updatedAt
    } = data;

    // Check if task exists
    const [existing] = await db.execute(
      "SELECT id FROM tasks WHERE google_id = ? AND user_id = ?",
      [googleId, userId]
    );

    if (existing.length > 0) {
      // Update
      await db.execute(
        `UPDATE tasks 
         SET title = ?, notes = ?, due_date = ?, status = ?, updated_at = ?
         WHERE google_id = ? AND user_id = ?`,
        [title, notes, dueDate, status, updatedAt, googleId, userId]
      );
    } else {
      // Insert
      await db.execute(
        `INSERT INTO tasks 
         (google_id, user_id, title, notes, due_date, status, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [googleId, userId, title, notes, dueDate, status, updatedAt]
      );
    }
  }
}

export default Task;
