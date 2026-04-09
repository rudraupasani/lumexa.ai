import axios from "axios";
import dotenv from "dotenv";
import Cerebras from '@cerebras/cerebras_cloud_sdk';

dotenv.config();

// 🧩 In-memory conversation store
let conversationHistory = [];

export const generateAIResponse = async (req, res) => {
  try {
    const userPrompt = req.body.prompt;
    const mode = req.body.mode || "chat";

    if (!userPrompt?.trim()) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // ➕ Store user message
    conversationHistory.push({
      role: "user",
      content: userPrompt
    });

    // ✂️ Keep only last 100 messages
    conversationHistory = conversationHistory.slice(-100);

    // 🧠 Build CONTEXT from history
    const context = conversationHistory
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n");

    // ⚙️ Enhanced System Prompt
    const FinalPrompt = `
You are Lumexa, a conversational assistant

Your responses should feel like they are written by a calm, intelligent human — clear, natural, and helpful.

Behavior rules:
- Medium-length, clear paragraphs
- Conversational and easy to read
- No tables or structured layouts
- Markdown only for code blocks when necessary
- No emojis unless user tone is casual
- Never mention being an AI, model, or system

Adapt tone and depth to ${mode.toUpperCase()} mode.

--- CONTEXT ---
${context}

--- USER QUERY ---
${userPrompt}
`;

    // 🚀 Cerebras API Request
    const response = await axios.post(
      "https://api.cerebras.ai/v1/chat/completions",
      {
        model: "llama3.1-8b",
        messages: [
          { role: "system", content: FinalPrompt }
        ],
        temperature: 0.6,
        max_tokens: 800,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CEREBRAS_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const aiText =
      response.data?.choices?.[0]?.message?.content ||
      "⚠️ No response from Lumexa.";

    // ➕ Store assistant reply
    conversationHistory.push({
      role: "assistant",
      content: aiText
    });

    // ✂️ Keep last 100 again
    conversationHistory = conversationHistory.slice(-100);

    res.status(200).json({
      success: true,
      model: "gpt-oss-120b",
      response: aiText,
      memory: conversationHistory
    });

  } catch (error) {
    console.error("Cerebras API Error:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: "⚠️ Error generating AI response",
      error: error.response?.data || error.message
    });
  }
};
