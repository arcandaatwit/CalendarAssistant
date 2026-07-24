import express from "express";
import { askGemini } from "../controllers/geminiController.js";

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    const reply = await askGemini(message);
    res.json({ reply });
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ error: "Gemini error" });
  }
});

export default router;
