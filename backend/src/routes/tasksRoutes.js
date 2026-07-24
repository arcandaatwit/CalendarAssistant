import express from "express";
import {
    createTask,
    getTasks,
    getTask,
    updateTask,
    deleteTask
} from "../controllers/tasksController.js";

import authenticateUser from "../middleware/authMiddleware.js";


const router = express.Router();

// All task routes require authentication
router.use(authenticateUser);

// GET all tasks for the authenticated user
router.get("/", getTasks);

// GET a single task by ID
router.get("/:id", getTask);

// CREATE a new task
router.post("/", createTask);

// UPDATE a task
router.put("/:id", updateTask);

// DELETE a task
router.delete("/:id", deleteTask);

export default router;
