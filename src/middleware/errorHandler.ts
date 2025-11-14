import type { Request, Response, NextFunction } from "express"
import { logger } from "../utils/logger"

/**
 * Global error handler middleware
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error("Error:", err)

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e: any) => e.message)
    return res.status(400).json({
      success: false,
      error: "Validation error",
      details: errors,
    })
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0]
    return res.status(400).json({
      success: false,
      error: `${field} already exists`,
    })
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      error: "Invalid token",
    })
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      error: "Token expired",
    })
  }

  // Multer errors
  if (err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      error: err.message,
    })
  }

  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || "Internal server error",
  })
}