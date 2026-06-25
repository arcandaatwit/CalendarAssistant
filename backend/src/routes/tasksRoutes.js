// routes/tasksRoutes.js

import express from "express";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask
} from "../controllers/tasksController.js";

import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

// All task routes require authentication
router.use(authenticateUser);

// GET all tasks (local + optional Google)
router.get("/", getTasks);

// GET single task
router.get("/:id", getTaskById);

// CREATE task
router.post("/", createTask);

// UPDATE task
router.put("/:id", updateTask);

// DELETE task
router.delete("/:id", deleteTask);

export default router;
