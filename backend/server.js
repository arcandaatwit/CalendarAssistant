
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

console.log("Current working directory:", process.cwd());

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config();

// Debug: confirm env loaded
console.log("Loaded DB_PASSWORD:", process.env.DB_PASSWORD);

const app = express();
app.use(cors());
app.use(express.json());

// Import database 
import db from "./src/config/db.js";

// IMPORT AUTH ROUTES 
import authRoutes from "./src/routes/authRoutes.js";
import taskRoutes from "./src/routes/tasksRoutes.js";
import eventRoutes from "./src/routes/eventsRoutes.js";



// authentication routes
app.use("/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/events", eventRoutes);

app.get("/ping", (req, res) => {
    res.json({ message: "backend is running" });
});

// Serve the built frontend (run `npm run build` in the repo root first)
const distPath = path.join(__dirname, "..", "dist");
app.use(express.static(distPath));
app.get(/^(?!\/(api|auth|ping)).*/, (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
});

// FIXED PORT BINDING
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
