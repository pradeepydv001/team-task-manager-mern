import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5001;


if (!process.env.MONGO_URI) {
  console.warn("Warning: MONGO_URI not set - using fallback for testing");
  process.env.MONGO_URI = "mongodb://localhost:27017/ttm";
}

if (!process.env.JWT_SECRET) {
  console.warn("Warning: JWT_SECRET not set - using fallback for testing");
  process.env.JWT_SECRET = "fallback-secret-for-testing-only";
}

connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use. Stop the existing process or use another PORT.`);
    } else {
      console.error(`Server failed to start: ${error.message}`);
    }
    process.exit(1);
  });
});
