import db from "../config/db.js";

function formatSchedule(events, tasks) {
  const eventLines = events.length
    ? events.map((e) =>
        `- ${e.date} ${e.start_time}-${e.end_time}: ${e.title}` +
        (e.category ? ` (${e.category}, ${e.priority} priority)` : ` (${e.priority} priority)`)
      ).join("\n")
    : "None.";

  const taskLines = tasks.length
    ? tasks.map((t) =>
        `- ${t.title} (${t.priority} priority${t.flag && t.flag !== "none" ? `, ${t.flag}` : ""})` +
        (t.deadline ? ` — due ${t.deadline}` : "") +
        ` [${t.status}]`
      ).join("\n")
    : "None.";

  return `Upcoming events:\n${eventLines}\n\nOpen tasks:\n${taskLines}`;
}

export const sendMessage = async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: "Chat assistant isn't configured yet." });
  }

  const { message, history } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: "message is required" });
  }

  const user_id = req.user.id;

  try {
    const [events] = await db.execute(
      `SELECT title, description, date, start_time, end_time, category, priority
       FROM events WHERE user_id = ? AND date >= CURDATE()
       ORDER BY date ASC, start_time ASC LIMIT 20`,
      [user_id]
    );

    const [tasks] = await db.execute(
      `SELECT title, description, location, priority, flag, deadline, status
       FROM tasks WHERE user_id = ? AND status != 'completed'
       ORDER BY deadline IS NULL, deadline ASC LIMIT 20`,
      [user_id]
    );

    const scheduleSummary = formatSchedule(events, tasks);

    const contents = [
      ...(Array.isArray(history) ? history : []).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.text }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{
              text: "You are a helpful scheduling assistant inside a calendar app called Calendar Assistant. " +
                "Answer questions about the user's schedule using the data below, and help with general " +
                "planning questions. Keep replies concise.\n\n" + scheduleSummary,
            }],
          },
        }),
      }
    );

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      console.error("Gemini API error:", data);
      return res.status(502).json({ error: "Chat assistant is unavailable right now." });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) {
      return res.status(502).json({ error: "Chat assistant gave an empty response." });
    }

    return res.json({ reply });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Chat request failed." });
  }
};
