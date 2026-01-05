import type { Response } from "express"
import { User } from "../models/User"
import { Product } from "../models/Product"
import type { AuthRequest } from "../types"

/**
 * Wishlist controller - handles user wishlist operations
 */
export class WishlistController {
  /**
   * Add item to wishlist
   * POST /wishlist
   */
  async addItem(req: AuthRequest, res: Response) {
    try {
      const { productId } = req.body
      const userId = req.user?.id

      // Find product
      const product = await Product.findById(productId)
      if (!product) {
        return res.status(404).json({
          success: false,
          error: "Product not found",
        })
      }

      // Find user
      const user = await User.findById(userId)
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        })
      }

      // Check if already in wishlist
      if (user.wishlist.includes(productId)) {
        return res.status(400).json({
          success: false,
          error: "Product already in wishlist",
        })
      }

      // Add to wishlist
      user.wishlist.push(productId)
      await user.save()

      res.json({
        success: true,
        message: "Item added to wishlist",
        data: user.wishlist,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      })
    }
  }

  /**
   * Get user's wishlist
   * GET /wishlist
   */
  async getWishlist(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id

      const user = await User.findById(userId).populate("wishlist", "name price images brand rating")

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        })
      }

      res.json({
        success: true,
        data: user.wishlist,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      })
    }
  }

  /**
   * Remove item from wishlist
   * DELETE /wishlist/:productId
   */
  async removeItem(req: AuthRequest, res: Response) {
    try {
      const { productId } = req.params
      const userId = req.user?.id

      const user = await User.findById(userId)
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        })
      }

      // Remove from wishlist
      user.wishlist = user.wishlist.filter((id) => id.toString() !== productId)
      await user.save()

      res.json({
        success: true,
        message: "Item removed from wishlist",
        data: user.wishlist,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      })
    }
  }
}
