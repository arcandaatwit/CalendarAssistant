// controllers/tasksController.js
import db from "../config/db.js";

// Normalize To‑Do tasks (ignore date/time)
function normalizeTaskByType(task) {
    if (task.type === "To-Do") {
        task.date = null;
        task.time = null;
    }
    return task;
}

// Validate task fields
function validateTask(task) {
    const validTypes = ["To-Do", "Reminder", "Scheduled"];

    if (!validTypes.includes(task.type)) {
        return "Invalid task type.";
    }

    if (!task.title) {
        return "Title is required.";
    }

    if (task.type === "Reminder" || task.type === "Scheduled") {
        if (!task.date || !task.time) {
            return "Reminder/Scheduled tasks require date and time.";
        }
    }

    return null;
}

// ------------------------------------------------------------
// CREATE TASK
// ------------------------------------------------------------
export const createTask = async (req, res) => {
    try {
        let { title, type, date, time, priority, user_id } = req.body;

        let task = { title, type, date, time, priority, user_id };

        task = normalizeTaskByType(task);

        const error = validateTask(task);
        if (error) return res.status(400).json({ error });

        const sql = `
            INSERT INTO tasks (title, type, date, time, priority, user_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        await db.query(sql, [
            task.title,
            task.type,
            task.date,
            task.time,
            task.priority || "medium",
            task.user_id
        ]);

        res.status(201).json({ message: "Task created successfully." });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error creating task." });
    }
};

// ------------------------------------------------------------
// UPDATE TASK
// ------------------------------------------------------------
export const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        let { title, type, date, time, completed, priority } = req.body;

        let task = { title, type, date, time, completed, priority };

        task = normalizeTaskByType(task);

        const error = validateTask(task);
        if (error) return res.status(400).json({ error });

        const sql = `
            UPDATE tasks
            SET title = ?, type = ?, date = ?, time = ?, completed = ?, priority = ?
            WHERE id = ?
        `;

        await db.query(sql, [
            task.title,
            task.type,
            task.date,
            task.time,
            task.completed ?? 0,
            task.priority || "medium",
            id
        ]);

        res.json({ message: "Task updated successfully." });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error updating task." });
    }
};

// ------------------------------------------------------------
// GET ALL TASKS FOR USER
// ------------------------------------------------------------
export const getTasks = async (req, res) => {
    try {
        const user_id = req.user.id;

        const sql = `
            SELECT * FROM tasks
            WHERE user_id = ?
            ORDER BY created_at DESC
        `;

        const [rows] = await db.query(sql, [user_id]);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error fetching tasks." });
    }
};

// ------------------------------------------------------------
// GET SINGLE TASK
// ------------------------------------------------------------
export const getTask = async (req, res) => {
    try {
        const { id } = req.params;

        const sql = `SELECT * FROM tasks WHERE id = ?`;

        const [rows] = await db.query(sql, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Task not found." });
        }

        res.json(rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error fetching task." });
    }
};

// ------------------------------------------------------------
// DELETE TASK
// ------------------------------------------------------------
export const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        const sql = `DELETE FROM tasks WHERE id = ?`;

        await db.query(sql, [id]);

        res.json({ message: "Task deleted successfully." });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error deleting task." });
    }
};
