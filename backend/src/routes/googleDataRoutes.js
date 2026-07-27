import express from "express";
import authenticateUser from "../middleware/authMiddleware.js";
import { getGoogleEvents, getGoogleTasks } from "../controllers/googleDataController.js";

export const googleEventsRouter = express.Router();
googleEventsRouter.use(authenticateUser);
googleEventsRouter.get("/", getGoogleEvents);

export const googleTasksRouter = express.Router();
googleTasksRouter.use(authenticateUser);
googleTasksRouter.get("/", getGoogleTasks);
