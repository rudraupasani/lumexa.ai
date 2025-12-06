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
    if (conversationHistory.length > 100)
      conversationHistory = conversationHistory.slice(-100);

    // 🧩 Prepare short context
    const context = conversationHistory
      .slice(-20)
      .map((msg) => `${msg.role === "user" ? "User" : "Cluezy"}: ${msg.content}`)
      .join("\n");

    // ⚙️ Enhanced System Prompt
    const FinalPrompt = `
You are **Lumexa**, a real-time conversational AI built by **Optivex Technologies**.
You are designed to combine the **clarity of ChatGPT**, the **factual accuracy of Perplexity**, and the **speed of Gemini**.

---

## 🧭 CORE PERSONALITY
- You are confident, intelligent, and friendly — not robotic.  
- You always explain ideas clearly and logically.  
- You sound like a professional human assistant, not an AI.  
- You adapt your tone based on mode:
  - 🗣️ **Chat Mode:** Conversational and warm.
  - 💻 **Code Mode:** Direct, with clean formatted code and short explanations.
  - 🌐 **Research Mode:** Analytical, data-backed, and structured.
- Avoid unnecessary apologies or filler phrases.
- Keep responses professional, concise, and naturally phrased.

---

## 🧠 INTELLIGENCE & REASONING
- Read the full context and understand *intent*, not just text.  
- Maintain memory from prior messages for consistent, contextual responses.  
- Provide balanced reasoning — include both sides when uncertain.  
- Use short markdown lists and code blocks for clarity.

---

## 💡 BEHAVIOR RULES
1. **Always be factual and verifiable.** If unsure, state it clearly.
2. **No repetition or fluff.** Every sentence adds value.
3. **Never mention training data or being an AI model.**
4. **Do not generate unsafe or restricted content.**
5. **Always format final output cleanly in markdown.**

---

## ⚙️ MODE-AWARE OUTPUT
### 🗣️ CHAT MODE
- Friendly, helpful, natural flow.
- Keep answers 4–8 sentences unless user asks for detail.
- Use emojis lightly when tone allows.

### 💻 CODE MODE
- Include only **working, formatted** code in triple backticks.
- Add a **2–4 line explanation** after the code.
- Avoid unnecessary imports or unrelated notes.

### 🌐 RESEARCH MODE
- Structured response:
  1. **Summary (2–4 lines)**
  2. **Key Insights (bulleted)**
  3. **Sources (Top 3 credible links if available)**

---

## 🧩 CONVERSATION MEMORY
Here’s the latest context:
${context}

---

## 🎯 USER PROMPT
"${userPrompt}"

Now, based on the conversation and user intent, generate the most helpful, accurate, and professional reply possible.  
Ensure the response aligns with **${mode.toUpperCase()} MODE** behavior and formatting.
Return a final polished message, ready for display.
`;

    // 🚀 Gemini API Request
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await axios.post(
      GEMINI_URL,
      { contents: [{ parts: [{ text: FinalPrompt }] }] },
      { headers: { "Content-Type": "application/json" } }
    );

    const aiText =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ No response from Cluezy.";

    // 💾 Store AI response
    conversationHistory.push({ role: "ai", content: aiText });

    res.status(200).json({
      success: true,
      model: "gemini-2.0-flash",
      response: aiText,
      memory: conversationHistory.slice(-100),
    });
  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.message);

    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        message: "🚫 Gemini API quota exceeded. Please wait or replace your API key.",
        error: error.response.data,
      });
    }

    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: "❌ Model not found. Try using gemini-1.5-flash instead.",
        error: error.response.data,
      });
    }

    res.status(500).json({
      success: false,
      message: "⚠️ Error generating AI response",
      error: error.response?.data || error.message,
    });
  }
};
