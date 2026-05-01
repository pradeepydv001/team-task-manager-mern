import mongoose from "mongoose";

export default async function connectDB() {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    console.warn("Warning: Server starting without database connection");
    // Don't exit - allow server to start for CORS testing
  }
}
