import type { Response, NextFunction } from "express"
import type { AuthRequest } from "../types"
import { verifyAccessToken } from "../services/token"

/**
 * Middleware to authenticate JWT token
 */
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "No token provided",
      })
    }

    const token = authHeader.substring(7)

    // Verify token
    const decoded = verifyAccessToken(token)

    // Attach user to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    }

    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired token",
    })
  }
}

/**
 * Middleware to check if user has admin role
 */
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
    })
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: "Admin access required",
    })
  }

  next()
}
