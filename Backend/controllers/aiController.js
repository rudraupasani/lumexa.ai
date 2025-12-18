import axios from "axios";
import dotenv from "dotenv";
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

    // 🗃️ Store user message
    conversationHistory.push({ role: "user", content: userPrompt });
    if (conversationHistory.length > 100) {
      conversationHistory = conversationHistory.slice(-100);
    }

    // 🧩 Prepare short context
    const context = conversationHistory
      .slice(-20)
      .map(
        (msg) => `${msg.role === "user" ? "User" : "Lumexa"}: ${msg.content}`
      )
      .join("\n");

    // ⚙️ Enhanced System Prompt
   const FinalPrompt = `
You are **Lumexa**, a conversational assistant built by **Optivex Technologies**.

--- BEHAVIOR ---
- Respond like a helpful human, not a textbook
- Default to short paragraphs or bullet points
- ❌ Do NOT use markdown tables unless the user explicitly asks
- Use markdown ONLY for code blocks or small lists
- Keep answers natural and chat-like

--- QUALITY RULES ---
- Be factual and clear
- No fluff or repetition
- Adapt tone to ${mode.toUpperCase()} MODE
- Never mention being an AI model

--- CONVERSATION CONTEXT ---
${context}

--- USER PROMPT ---
${userPrompt}
`;


    // 🚀 Cerebras API Request
    const response = await axios.post(
      "https://api.cerebras.ai/v1/chat/completions",
      {
        model: "gpt-oss-120b",
        messages: [
          { role: "system", content: FinalPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.6,
        max_tokens: 800
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CEREBRAS_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiText =
      response.data?.choices?.[0]?.message?.content ||
      "⚠️ No response from Lumexa.";

    // 💾 Store AI response
    conversationHistory.push({ role: "assistant", content: aiText });

    res.status(200).json({
      success: true,
      model: "cerebras-llama3.1-70b",
      response: aiText,
      memory: conversationHistory.slice(-100),
    });
  } catch (error) {
    console.error("Cerebras API Error:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: "⚠️ Error generating AI response",
      error: error.response?.data || error.message,
    });
  }
};
