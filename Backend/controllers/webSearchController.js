import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const smartWebSearch = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Query is required.",
      });
    }

    // Environment variables
    const SERPER_API_KEY = process.env.SERPER_API_KEY;
    const CEREBRAS_API_KEY = process.env.CEREBRAS_API_KEY;

    if (!SERPER_API_KEY || !CEREBRAS_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "Missing API keys. Check environment configuration.",
      });
    }

    // Step 1: Web search
    const searchResponse = await axios.post(
      "https://google.serper.dev/search",
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
        query,
        aiResponse: "No relevant verified information was found for this query.",
        references: [],
        images: [],
        totalResults: 0,
        analyzedBy: "Lumexa",
      });
    }

    // Step 2: Build context for reasoning
    const context = results
      .slice(0, 10)
      .map(
        (r, i) =>
          `(${i + 1}) ${r.title}\n${r.snippet}\nSource: ${r.link}`
      )
      .join("\n\n");

    // Step 3: Refined system prompt (professional + tables allowed)
    const FinalPrompt = `
SYSTEM ROLE
You are Lumexa, a premium Research and Intelligence Assistant.

You deliver accurate, web-verified explanations written in clear, professional language, comparable to a senior human research analyst.
You must never refer to yourself as an AI.

CORE IDENTITY
Calm, analytical, precise, and human-like.
Prioritize clarity, factual accuracy, and structured reasoning.
Avoid filler language, hype, or disclaimers.

RESPONSE STRUCTURE (MANDATORY ORDER)
1. HEADING
2. OVERVIEW (single paragraph)
3. KEY POINTS (list when clarity improves)
4. EXPLANATION (1–2 paragraphs)
5. SUMMARY

STYLE RULES
Use markdown formatting.
Tables are not-allowed and encouraged when comparing data or summarizing facts.
Maintain a neutral, authoritative tone.
No emojis, no self-references.

CITATION RULES (STRICT)
Every factual claim must include an inline citation.
Citations must appear immediately after the sentence.
Do not group links.
No references or sources sections.
Citation format: [Source Title](URL)

CONTENT LIMITATIONS
Do not include footers or closing remarks.
Do not mention platforms or organizations unless required by context.
Do not explain methodology.

USER QUERY
"${query}"

VERIFIED WEB CONTEXT
${context}

FINAL INSTRUCTION
Answer directly, follow the structure exactly, and end cleanly.
`;

    // Step 4: Cerebras call
    const cerebrasResponse = await axios.post(
      "https://api.cerebras.ai/v1/chat/completions",
      {
        model: "gpt-oss-120b",
        messages: [
          { role: "system", content: FinalPrompt },
          { role: "user", content: query },
        ],
        temperature: 0.6,
        max_tokens: 900,
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
      "No response generated.";
    // Step 5: Image search
    let images = [];
    try {
      const imageResponse = await axios.post(
        "https://google.serper.dev/images",
        { q: query, num: 10 },
        {
          headers: {
            "X-API-KEY": SERPER_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      images =
        imageResponse.data?.images
          ?.map(img => img.imageUrl)
          .filter(url =>
            [".jpg", ".jpeg", ".png", ".webp"].some(ext =>
              url.toLowerCase().endsWith(ext)
            )
          ) || [];
    } catch (err) {
      console.warn("Image fetch failed:", err.message);
    }

    // Step 6: References payload
    const references = results.slice(0, 10).map((r, i) => ({
      id: i + 1,
      title: r.title,
      link: r.link,
      snippet: r.snippet,
    }));

    // Final response
    res.status(200).json({
      success: true,
      query,
      aiResponse: aiText,
      references,
      images,
      totalResults: results.length,
      analyzedBy: "Lumexa",
    });
  } catch (error) {
    console.error("Smart Web Search Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: "Smart web search failed.",
    });
  }
};
