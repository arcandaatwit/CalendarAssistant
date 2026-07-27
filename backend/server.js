import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import geminiRoutes from "./src/routes/geminiRoutes.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config();
console.log("Loaded ENV:");
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET);
console.log("GOOGLE_CALLBACK_URL:", process.env.GOOGLE_CALLBACK_URL);
console.log("JWT_SECRET:", process.env.JWT_SECRET);
console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY);
import passport from "./src/middleware/googleAuth.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// ⭐ Passport ONLY — no sessions
app.use(passport.initialize());

// ROUTES
import authRoutes from "./src/routes/authRoutes.js";
import googleAuthRoutes from "./src/routes/googleAuthRoutes.js";   
import taskRoutes from "./src/routes/tasksRoutes.js";
import eventRoutes from "./src/routes/eventsRoutes.js";
import googleSyncRoutes from "./src/routes/googleSyncRoutes.js"; 
import chatRoutes from "./src/routes/chatRoutes.js";



// ⭐ auth routes
app.use("/auth", authRoutes);
app.use("/auth", googleAuthRoutes);  

// task and event routes 
app.use("/api/tasks", taskRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/chat", chatRoutes);

//google sync routes
app.use("/api/google-sync", googleSyncRoutes);   

// Gemini chat route
app.use("/api/gemini", geminiRoutes);

app.get("/ping", (req, res) => {
  res.json({ message: "backend is running" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
