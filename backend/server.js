const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;
// Replace with your actual key or use process.env.GROQ_API_KEY
const GROQ_API_KEY = "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"; 

app.post("/analyze", async (req, res) => {
  try {
    let { text } = req.body;
    if (!text) return res.status(400).json({ error: "No text provided" });

    // Clean text: remove extra whitespace to save tokens
    const cleanedText = text.replace(/\s+/g, ' ').trim().slice(0, 4000);

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are Sentinel AI, a legal tech expert. Analyze privacy policies for hidden risks. Be concise and direct."
          },
          {
            role: "user",
            content: `Analyze this policy. Use this EXACT format:
            
            SUMMARY: (3 short bullets)
            RISKS: (List major privacy concerns)
            TRUST_SCORE: (X/10)

            Policy text: ${cleanedText}`
          }
        ],
        temperature: 0.3, // Lower temp = more consistent results
      },
      {
        headers: { Authorization: `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
        timeout: 15000
      }
    );

    res.json({ success: true, result: response.data.choices[0].message.content });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ success: false, error: "AI Analysis failed" });
  }
});

app.listen(PORT, () => console.log(`🚀 Sentinel Backend: http://localhost:${PORT}`));