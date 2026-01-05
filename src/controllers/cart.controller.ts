import type { Response } from "express"
import { User } from "../models/User"
import { Product } from "../models/Product"
import type { AuthRequest } from "../types"

/**
 * Cart controller - handles user cart operations
 */
export class CartController {
  /**
   * Add item to cart
   * POST /cart
   */
  async addItem(req: AuthRequest, res: Response) {
    try {
      const { productId, quantity = 1 } = req.body
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

      // Check if item already in cart
      const existingItemIndex = user.cart.findIndex((item) => item.productId.toString() === productId)

      if (existingItemIndex > -1) {
        // Update quantity
        user.cart[existingItemIndex].quantity += quantity
      } else {
        // Add new item
        user.cart.push({
          productId,
          quantity,
          priceAtAddTime: product.price,
        })
      }

      await user.save()

      res.json({
        success: true,
        message: "Item added to cart",
        data: user.cart,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      })
    }
  }

  /**
   * Get user's cart
   * GET /cart
   */
  async getCart(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id

      const user = await User.findById(userId).populate("cart.productId", "name price images brand")

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        })
      }

      // Calculate totals
      const subtotal = user.cart.reduce((sum, item) => sum + item.priceAtAddTime * item.quantity, 0)

      res.json({
        success: true,
        data: {
          items: user.cart,
          subtotal,
          itemCount: user.cart.length,
        },
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      })
    }
  }

  /**
   * Update cart item quantity
   * PUT /cart/:itemId
   */
  async updateItem(req: AuthRequest, res: Response) {
    try {
      const { itemId } = req.params
      const { quantity } = req.body
      const userId = req.user?.id

      if (quantity < 1) {
        return res.status(400).json({
          success: false,
          error: "Quantity must be at least 1",
        })
      }

      const user = await User.findById(userId)
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        })
      }

      // Find cart item
      const cartItem = user.cart.id(itemId)
      if (!cartItem) {
        return res.status(404).json({
          success: false,
          error: "Cart item not found",
        })
      }

      // Update quantity
      cartItem.quantity = quantity
      await user.save()

      res.json({
        success: true,
        message: "Cart item updated",
        data: user.cart,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      })
    }
  }

  /**
   * Remove item from cart
   * DELETE /cart/:itemId
   */
  async removeItem(req: AuthRequest, res: Response) {
    try {
      const { itemId } = req.params
      const userId = req.user?.id

      const user = await User.findById(userId)
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        })
      }

      // Remove item using pull (Mongoose subdocument method)
      user.cart.pull(itemId)
      await user.save()

      res.json({
        success: true,
        message: "Item removed from cart",
        data: user.cart,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      })
    }
  }
}
