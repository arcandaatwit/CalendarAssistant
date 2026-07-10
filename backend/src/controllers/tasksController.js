// controllers/tasksController.js

import db from "../config/db.js";

function mapTask(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    description: row.description,
    location: row.location,
    priority: row.priority,
    flag: row.flag,
    deadline: row.deadline,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

// CREATE TASK (local DB only)
export const createTask = async (req, res) => {
  const {
    user_id,
    title,
    description,
    location,
    priority,
    flag,
    deadline,
    status
  } = req.body;

  if (!user_id || !title) {
    return res.status(400).json({ error: "user_id and title are required" });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.execute(
      `
      INSERT INTO tasks (
        user_id, title, description, location,
        priority, flag, deadline, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        user_id,
        title,
        description || null,
        location || null,
        priority || "medium",
        flag || "none",
        deadline || null,
        status || "pending"
      ]
    );

    const taskId = result.insertId;

    const [rows] = await conn.execute(
      "SELECT * FROM tasks WHERE id = ?",
      [taskId]
    );

    await conn.commit();
    return res.status(201).json(mapTask(rows[0]));

  } catch (err) {
    await conn.rollback();
    console.error(err);
    return res.status(500).json({ error: "Failed to create task" });
  } finally {
    conn.release();
  }
};

// GET ALL TASKS (local DB only)
export const getTasks = async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: "user_id is required" });
  }

  try {
    const [rows] = await db.execute(
      `
      SELECT * FROM tasks
      WHERE user_id = ?
      ORDER BY deadline IS NULL, deadline ASC, created_at DESC
      `,
      [user_id]
    );

    return res.json(rows.map(mapTask));

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

// GET TASK BY ID
export const getTaskById = async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.query;

  try {
    const [rows] = await db.execute(
      "SELECT * FROM tasks WHERE id = ? AND user_id = ?",
      [id, user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    return res.json(mapTask(rows[0]));

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch task" });
  }
};

// UPDATE TASK (local DB only)
export const updateTask = async (req, res) => {
  const { id } = req.params;
  const {
    user_id,
    title,
    description,
    location,
    priority,
    flag,
    deadline,
    status
  } = req.body;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [existingRows] = await conn.execute(
      "SELECT * FROM tasks WHERE id = ? AND user_id = ?",
      [id, user_id]
    );

    if (existingRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Task not found" });
    }

    const existing = mapTask(existingRows[0]);

    await conn.execute(
      `
      UPDATE tasks
      SET title = ?, description = ?, location = ?, priority = ?, flag = ?, deadline = ?, status = ?
      WHERE id = ? AND user_id = ?
      `,
      [
        title ?? existing.title,
        description ?? existing.description,
        location ?? existing.location,
        priority ?? existing.priority,
        flag ?? existing.flag,
        deadline ?? existing.deadline,
        status ?? existing.status,
        id,
        user_id
      ]
    );

    const [rows] = await conn.execute(
      "SELECT * FROM tasks WHERE id = ? AND user_id = ?",
      [id, user_id]
    );

    await conn.commit();
    return res.json(mapTask(rows[0]));

  } catch (err) {
    await conn.rollback();
    console.error(err);
    return res.status(500).json({ error: "Failed to update task" });
  } finally {
    conn.release();
  }
};

// DELETE TASK (local DB only)
export const deleteTask = async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.execute(
      "SELECT * FROM tasks WHERE id = ? AND user_id = ?",
      [id, user_id]
    );

    if (rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Task not found" });
    }

    await conn.execute(
      "DELETE FROM tasks WHERE id = ? AND user_id = ?",
      [id, user_id]
    );

    await conn.commit();
    return res.json({ message: "Task deleted successfully" });

  } catch (err) {
    await conn.rollback();
    console.error(err);
    return res.status(500).json({ error: "Failed to delete task" });
  } finally {
    conn.release();
  }
};
