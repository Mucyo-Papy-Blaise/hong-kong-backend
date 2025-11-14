import dotenv from "dotenv"
import { createApp } from "./app"
import { connectDatabase } from "./config/database"
import { configureCloudinary } from "./config/cloudinary"
import { logger } from "./utils/logger"

// Load environment variables
dotenv.config()

const PORT = process.env.PORT || 5000

/**
 * Start the server
 */
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase()

    // Configure Cloudinary
    configureCloudinary()

    // Create Express app
    const app = createApp()

    // Start listening
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`)
      logger.info(`Environment: ${process.env.NODE_ENV || "development"}`)
      logger.info(`API Documentation: http://localhost:${PORT}/docs`)
    })
  } catch (error) {
    logger.error("Failed to start server:", error)
    process.exit(1)
  }
}

startServer()
