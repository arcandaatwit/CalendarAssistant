import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
console.log("Current working directory:", process.cwd());

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend folder
dotenv.config({ path: path.join(__dirname, '.env') });

// Debug: confirm env loaded
console.log("Loaded DB_PASSWORD:", process.env.DB_PASSWORD);

const app = express();
app.use(cors());
app.use(express.json());

// Import database 
import { db } from './src/config/db.js';

// IMPORT AUTH ROUTES 
import authRoutes from "./src/routes/authRoutes.js";

// authentication routes
app.use("/auth", authRoutes);

app.get("/ping", (req, res) => {
    res.json({ message: "backend is running" });
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
