import type { Request, Response } from "express"
import { User } from "../models/User"
import { Product } from "../models/Product"
import { Brand } from "../models/Brand"

/**
 * Admin controller - handles admin dashboard operations
 */
export class AdminController {
  /**
   * Get admin dashboard overview
   * GET /admin/overview
   */
  async getOverview(req: Request, res: Response) {
    try {
      // Get counts
      const [userCount, productCount, brandCount, adminCount] = await Promise.all([
        User.countDocuments({ role: "user" }),
        Product.countDocuments(),
        Brand.countDocuments(),
        User.countDocuments({ role: "admin" }),
      ])

      // Get recent products
      const recentProducts = await Product.find().sort({ createdAt: -1 }).limit(5)

      // Get recent users
      const recentUsers = await User.find({ role: "user" })
        .select("-password -refreshTokens")
        .sort({ createdAt: -1 })
        .limit(5)

      res.json({
        success: true,
        data: {
          counts: {
            users: userCount,
            products: productCount,
            brands: brandCount,
            admins: adminCount,
          },
          recentProducts,
          recentUsers,
        },
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      })
    }
  }
}
