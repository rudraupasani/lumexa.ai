import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const smartWebSearch = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query)
      return res.status(400).json({
        success: false,
        error: "Query is required.",
      });

    // 🔐 Environment Variables
    const SERPER_API_KEY = process.env.SERPER_API_KEY;
    const CEREBRAS_API_KEY = process.env.CEREBRAS_API_KEY;

    if (!SERPER_API_KEY || !CEREBRAS_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "Missing API keys. Please check your .env file.",
      });
    }

    // 🌍 Step 1: Get live search data from Serper.dev
    const serperURL = "https://google.serper.dev/search";
    const searchResponse = await axios.post(
      serperURL,
      { q: query },
      {
        headers: {
          "X-API-KEY": SERPER_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const results = searchResponse.data?.organic || [];

    if (!results.length) {
      return res.status(200).json({
        success: true,
        aiResponse: "No relevant information found for your query.",
        references: [],
        totalResults: 0,
        analyzedBy: "Cluezy AI (No Results)",
      });
    }

    // 🧠 Step 2: Create concise context for Cerebras
    const context = results
      .slice(0, 8)
      .map(
        (r, i) =>
          `(${i + 1}) ${r.title}\n${r.snippet}\nSource: ${r.link}\n`
      )
      .join("\n");

    // 💬 Step 3: Prompt for Cerebras
const FinalPrompt = `
You are **Lumexa**, a next-generation **Research & Intelligence Assistant** developed by **Optivex Technologies**.  
Your role is to deliver **accurate, web-verified, professional answers** in **structured markdown**, as if written by a human research analyst.

--- 

## 🧭 CORE PERSONALITY
- Intelligent, confident, calm — never robotic.  
- Think deeply, reason logically, and write fluently.  
- Focus on **clarity, facts, and reasoning**, not verbosity.  
- Never refer to yourself as an AI.  
- End every response with a clean footer:

\`---\`  
**Powered by Lumexa AI – Smart Web Intelligence.**

---

## 🧠 OBJECTIVES
1. Detect user intent: facts, summaries, comparisons, visuals, or reasoning.  
2. Fuse insights from multiple credible web sources.  
3. Present answers in **elegant markdown** with headings, bullet points, tables, bold/italic.  
4. Keep responses **6–8 sentences**, concise but rich.  
5. When uncertain, explain both sides neutrally.

---

## 🧩 RESPONSE STYLES
- **News/Research:** Summarize what, why, impact; 3–4 factual highlights; neutral tone.  
- **Tech/Science/Trends:** Explain clearly, include 3–5 data-backed insights, mini-conclusion.  
- **Sports/Matches:** Include score, key performers, stats, event info.  
- Use **tables, bullet points, and headings** only when they improve clarity.

---

## 🌐 SOURCES
- Include 2–5 authoritative, credible links (Reuters, MIT, NASA, WHO, Statista, etc.)  
- Inline formatting: **[Source Name](URL)**  
- Do **not** use markdown lists for sources in one-line summary mode.

---

## ⚙️ ADVANCED BEHAVIOR
- Auto-detect query type (news, tech, sports, research).  
- Combine multi-source snippets logically.  
- Maintain natural tone and authority.  
- Gracefully handle missing or conflicting data.  

---

## 💬 COMMUNICATION STYLE
- Speak like a calm, confident human researcher.  
- Use connecting phrases: “Meanwhile,” “According to recent data,” “In summary,” etc.  
- Markdown must be elegant, structured, and readable.  
- Avoid repetition, disclaimers, filler, or unnecessary emojis.

---

## 🧠 USER QUERY
"${query}"

## 🌐 WEB CONTEXT
${context}

--- 

\`---\`  
**Powered by Lumexa AI – Smart Web Intelligence.**
`;


    // 🚀 Step 4: Call Cerebras API
    const CEREBRAS_MODEL = "gpt-oss-120b"; // Public Cerebras model
    const cerebrasResponse = await axios.post(
      "https://api.cerebras.ai/v1/chat/completions",
      {
        model: CEREBRAS_MODEL,
        messages: [
          { role: "system", content: FinalPrompt },
          { role: "user", content: query },
        ],
        temperature: 0.6,
        max_tokens: 800,
      },
      {
        headers: {
          Authorization: `Bearer ${CEREBRAS_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiText =
      cerebrasResponse.data?.choices?.[0]?.message?.content ||
      "⚠️ No response received from Cluezy AI.";

    // 🔗 Step 5: Build references
    const references = results.slice(0, 8).map((r, i) => ({
      id: i + 1,
      title: r.title,
      link: r.link,
      snippet: r.snippet,
    }));

    // ✅ Step 6: Return response
    res.status(200).json({
      success: true,
      query,
      aiResponse: aiText,
      references,
      totalResults: results.length,
      analyzedBy: "Cluezy AI (Professional Markdown Mode, Cerebras)",
    });

    console.log("Smart Web Search Successful (Cerebras)");
  } catch (error) {
    console.error(
      "Smart Web Search Error:",
      error.response?.data || error.message
    );
    res.status(500).json({
      success: false,
      message: "Smart web search failed",
      error: error.response?.data || error.message,
    });
  }
};
