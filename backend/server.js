require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Health Check Route
app.get("/", (req, res) => {
  res.send("Sentinel Backend Running 🚀");
});

// Analyze Route
app.post("/analyze", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: "No text provided"
      });
    }

    const cleanedText = text
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 4000);

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You are Sentinel AI, a legal tech expert. Analyze privacy policies for hidden risks. Be concise and direct."
          },
          {
            role: "user",
            content: `Analyze this policy. Use this EXACT format:

SUMMARY:
- 3 short bullet points

RISKS:
- Major privacy concerns

TRUST_SCORE:
X/10

Policy text:
${cleanedText}`
          }
        ],
        temperature: 0.3
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 15000
      }
    );

    res.json({
      success: true,
      result: response.data.choices[0].message.content
    });
  } catch (error) {
    console.error(
      "Groq Error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      success: false,
      error: "AI Analysis Failed"
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Sentinel Backend running on port ${PORT}`);
});