import express from "express";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { sendMessage } from "../controllers/chatController.js";

const router = express.Router();

router.use(authenticateUser);

router.post("/", sendMessage);

export default router;
