// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
  console.error("❌ ERROR: Missing GROQ_API_KEY in .env file");
  process.exit(1);
}

app.post("/chat", async (req, res) => {
  const { character, message } = req.body;

  if (!character || !message) {
    return res.status(400).json({ error: "Character and message are required" });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are ${character} from an anime. Reply in their tone and personality, but keep it extremely short (max 1 sentence).`
          },
          { role: "user", content: message }
        ],
        max_tokens: 50 // extra strict so it never rambles
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Groq API Error:", data);
      return res.status(response.status).json({ error: data.error?.message || JSON.stringify(data) });
    }

    res.json({
      reply: data.choices?.[0]?.message?.content || "⚠️ No reply received from Groq API."
    });
  } catch (err) {
    console.error("❌ Server Error:", err);
    res.status(500).json({ error: "Failed to fetch from Groq API" });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
