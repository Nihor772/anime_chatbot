// api/chat.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { character, message } = req.body;
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

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
            content: `You are ${character} from an anime. Reply in their voice, tone, and personality. Keep it short and snappy (under 2 sentences).`
          },
          { role: "user", content: message }
        ],
        max_tokens: 100
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Groq API Error:", data);
      return res.status(response.status).json({ error: data.error?.message || "API Error" });
    }

    res.status(200).json({
      reply: data.choices?.[0]?.message?.content || "⚠️ No reply received."
    });
  } catch (err) {
    console.error("❌ Server Error:", err);
    res.status(500).json({ error: "Failed to fetch from Groq API" });
  }
}
