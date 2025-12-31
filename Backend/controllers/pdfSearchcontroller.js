const axios = require("axios");

exports.searchPDFs = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Query is required",
      });
    }

    const SERPER_API_KEY = process.env.SERPER_API_KEY;
    if (!SERPER_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "Missing SERPER_API_KEY",
      });
    }

    // ✅ Force Google to return PDFs
    const pdfQuery = `${query} filetype:pdf`;

    const response = await axios.post(
      "https://google.serper.dev/search",
      {
        q: pdfQuery,
        num: 20,
      },
      {
        headers: {
          "X-API-KEY": SERPER_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const results = response.data?.organic || [];

    // ✅ Strict PDF filtering
    const pdfs = results
      .filter(
        (r) =>
          typeof r.link === "string" &&
          r.link.toLowerCase().endsWith(".pdf")
      )
      .map((r, i) => ({
        id: i + 1,
        title: r.title || "Untitled PDF",
        link: r.link,
        snippet: r.snippet || "",
      }));

    return res.status(200).json({
      success: true,
      query,
      totalPDFs: pdfs.length,
      pdfs,
      analyzedBy: "Lumexa",
    });
  } catch (error) {
    console.error("PDF Search Error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      error: "PDF search failed",
    });
  }
};
