import mongoose from "mongoose"
import { logger } from "../utils/logger"

/**
 * Connect to MongoDB database
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb+srv://mucyoblaise86:ufPi0WVuWhpUyiEn@cluster0.oce66.mongodb.net/hong-kong-db?retryWrites=true&w=majority&appName=Cluster0"

    await mongoose.connect(mongoUri)

    logger.info(`MongoDB connected: ${mongoose.connection.host}`)
  } catch (error) {
    logger.error("MongoDB connection error:", error)
    process.exit(1)
  }
}

export const connectDB = connectDatabase

// Handle connection events
mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected")
})

mongoose.connection.on("error", (error) => {
  logger.error("MongoDB error:", error)
})
