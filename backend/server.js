

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/", (req, res) => {
    res.send("Sentinel AI Backend Running ✅");
});

app.post("/analyze", async (req, res) => {
    try {
        const policyText = req.body.text;

        if (!policyText || policyText.length < 50) {
            return res.status(400).json({
                response: "Not enough text to analyze."
            });
        }

        console.log("📄 Policy received. Sending to Ollama...");

        const prompt = `
You are Sentinel AI, a privacy risk analyzer.

Analyze the privacy policy and respond STRICTLY in this format:

Summary:
- point
- point
- point

Risks:
- risk
- risk

Score: X/10

Rules:
- Score 0 = very safe
- Score 10 = very risky
- Be strict and realistic
- No extra text

Privacy Policy:
${policyText.slice(0, 8000)}
`;

        const ollamaResponse = await axios.post(
            "http://localhost:11434/api/generate",
            {
                model: "llama3",
                prompt: prompt,
                stream: false
            },
            {
                timeout: 120000
            }
        );

        const result =
            ollamaResponse.data.response ||
            "No response from model.";

        console.log("✅ Summary generated");

        res.json({ response: result });

    } catch (error) {
        console.error("❌ Backend Error:", error.message);

        res.status(500).json({
            response: "AI processing failed."
        });
    }
});

app.listen(5000, () => {
    console.log("🚀 Sentinel Backend running on http://localhost:5000");
});