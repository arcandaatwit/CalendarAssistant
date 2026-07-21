import express from "express";
import { syncGoogle } from "../controllers/googleSyncController.js";
import authenticateUser from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/sync", authenticateUser, syncGoogle);

export default router;
