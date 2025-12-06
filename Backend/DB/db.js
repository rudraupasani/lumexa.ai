const mongoose = require("mongoose");
const env = require("dotenv")
const mongoURI = process.env.MONGO_URI || "mongodb+srv://rudraupasani7:<30903000>@cluster0.3bsm7lr.mongodb.net/?appName=Cluster0";
env.config();

const connectToMongo = () => {
  mongoose.connect(mongoURI, {
  })
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((error) => {
      console.error("MongoDB connection error:", error);
    });
};

module.exports = connectToMongo;
