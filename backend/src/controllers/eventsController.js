import db from "../config/db.js";

function mapEvent(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    description: row.description,
    date: row.date,
    start_time: row.start_time,
    end_time: row.end_time,
    category: row.category,
    priority: row.priority,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

// CREATE EVENT
export const createEvent = async (req, res) => {
  const {
    user_id,
    title,
    description,
    date,
    start_time,
    end_time,
    category,
    priority
  } = req.body;

  if (!user_id || !title || !date || !start_time || !end_time || !category) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO events (user_id, title, description, date, start_time, end_time, category, priority)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, title, description, date, start_time, end_time, category, priority]
    );

    return res.json({
      id: result.insertId,
      user_id,
      title,
      description,
      date,
      start_time,
      end_time,
      category,
      priority
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create event" });
  }
};

// GET ALL EVENTS
export const getEvents = async (req, res) => {
  const user_id = req.user.id;

  try {
    const [rows] = await db.execute(
      "SELECT * FROM events WHERE user_id = ? ORDER BY date ASC, start_time ASC",
      [user_id]
    );

    return res.json(rows.map(mapEvent));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch events" });
  }
};

// GET EVENT BY ID
export const getEventById = async (req, res) => {
  const user_id = req.user.id;
  const { id } = req.params;

  try {
    const [rows] = await db.execute(
      "SELECT * FROM events WHERE id = ? AND user_id = ?",
      [id, user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    return res.json(mapEvent(rows[0]));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch event" });
  }
};

// UPDATE EVENT
export const updateEvent = async (req, res) => {
  const user_id = req.user.id;
  const { id } = req.params;

  const {
    title,
    description,
    date,
    start_time,
    end_time,
    category,
    priority
  } = req.body;

  try {
    await db.execute(
      `UPDATE events
       SET title=?, description=?, date=?, start_time=?, end_time=?, category=?, priority=?
       WHERE id=? AND user_id=?`,
      [title, description, date, start_time, end_time, category, priority, id, user_id]
    );

    return res.json({ message: "Event updated successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update event" });
  }
};

// DELETE EVENT
export const deleteEvent = async (req, res) => {
  const user_id = req.user.id;
  const { id } = req.params;

  try {
    await db.execute(
      "DELETE FROM events WHERE id = ? AND user_id = ?",
      [id, user_id]
    );

    return res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to delete event" });
  }
};
