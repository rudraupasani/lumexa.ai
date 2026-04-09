const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cron = require("node-cron");
const axios = require("axios");

dotenv.config();
const app = express();

// ✅ Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Import routes
const aiRoutes = require("./routes/aiRoutes");
const webSearchRoutes = require("./routes/searchRoutes");
const pdfRoutes = require("./routes/pdfroutes");

// ✅ Use routes
app.use("/api", aiRoutes);
app.use("/api", webSearchRoutes);
app.use("/api", pdfRoutes);

// ✅ Root / health-check endpoint
app.get("/", (req, res) => {
  res.send("✅ Backend is running fine!");
});

// ✅ Keep-alive cron — pings this server every 10 minutes to prevent cold starts
const SELF_URL = process.env.SELF_URL

cron.schedule("*/10 * * * *", async () => {
  const timestamp = new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" });
  try {
    const res = await axios.get(SELF_URL);
    console.log(`🟢 [${timestamp}] Keep-alive ping OK — ${SELF_URL} responded: "${res.data}"`);
  } catch (err) {
    console.error(`🔴 [${timestamp}] Keep-alive ping FAILED — ${err.message}`);
  }
});

console.log(`⏰ Keep-alive cron scheduled (every 10 min) → ${SELF_URL}`);

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
