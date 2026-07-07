import express from "express";
import { authenticateUser } from "../middleware/authMiddleware.js";

import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent
} from "../controllers/eventsController.js";

const router = express.Router();

// All event routes require authentication
router.use(authenticateUser);

// GET all events for logged-in user
router.get("/", getEvents);

// GET single event
router.get("/:id", getEventById);

// CREATE event
router.post("/", createEvent);

// UPDATE event
router.put("/:id", updateEvent);

// DELETE event
router.delete("/:id", deleteEvent);

export default router;
