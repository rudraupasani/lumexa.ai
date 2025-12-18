const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectToMongo = require("./DB/db");

// connectToMongo();

dotenv.config();
const app = express();

// ✅ Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Import routes (make sure it's exported properly)
const aiRoutes = require("./routes/aiRoutes");
const webSearchRoutes = require("./routes/searchRoutes");

// ✅ Use routes
app.use("/api", aiRoutes);
app.use("/api", webSearchRoutes);

// ✅ Root endpoint
app.get("/", (req, res) => {
  res.send("✅ Backend is running fine!");
});



// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
