import type { Request, Response } from "express"
import { Brand } from "../models/Brand"
import { Product } from "../models/Product"
import { uploadSingleImage } from "../services/cloudinary"

/**
 * Brand controller - handles brand CRUD operations
 */
export class BrandController {
  /**
   * Get all brands
   * GET /brands
   */
  async getAll(req: Request, res: Response) {
    try {
      const brands = await Brand.find().sort({ name: 1 })

      res.json({
        success: true,
        data: brands,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      })
    }
  }

  /**
   * Get single brand by ID
   * GET /brands/:id
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params

      const brand = await Brand.findById(id)

      if (!brand) {
        return res.status(404).json({
          success: false,
          error: "Brand not found",
        })
      }

      res.json({
        success: true,
        data: brand,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      })
    }
  }

  /**
   * Create new brand (admin only)
   * POST /brands
   */
  async create(req: Request, res: Response) {
    try {
      const file = req.file

      // Upload logo to Cloudinary
      let logoUrl = ""
      if (file) {
        logoUrl = await uploadSingleImage(file.buffer, "eyewear/brands")
      }

      // Create slug from name
      const slug = req.body.name.toLowerCase().replace(/\s+/g, "-")

      // Create brand
      const brand = await Brand.create({
        ...req.body,
        logo: logoUrl,
        slug,
      })

      res.status(201).json({
        success: true,
        message: "Brand created successfully",
        data: brand,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      })
    }
  }

  /**
   * Update brand (admin only)
   * PUT /brands/:id
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      const file = req.file

      // Find existing brand
      const brand = await Brand.findById(id)
      if (!brand) {
        return res.status(404).json({
          success: false,
          error: "Brand not found",
        })
      }

      // Upload new logo if provided
      let logoUrl = brand.logo
      if (file) {
        logoUrl = await uploadSingleImage(file.buffer, "eyewear/brands")
      }

      // Update slug if name changed
      const slug = req.body.name ? req.body.name.toLowerCase().replace(/\s+/g, "-") : brand.slug

      // Update brand
      const updatedBrand = await Brand.findByIdAndUpdate(
        id,
        { ...req.body, logo: logoUrl, slug },
        { new: true, runValidators: true },
      )

      res.json({
        success: true,
        message: "Brand updated successfully",
        data: updatedBrand,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      })
    }
  }

  /**
   * Delete brand (admin only)
   * DELETE /brands/:id
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params

      const brand = await Brand.findByIdAndDelete(id)

      if (!brand) {
        return res.status(404).json({
          success: false,
          error: "Brand not found",
        })
      }

      res.json({
        success: true,
        message: "Brand deleted successfully",
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      })
    }
  }

  /**
   * Get products by brand slug
   * GET /brands/:brandSlug/products
   */
  async getProductsByBrand(req: Request, res: Response) {
    try {
      const { brandSlug } = req.params

      // Find brand by slug
      const brand = await Brand.findOne({ slug: brandSlug })
      if (!brand) {
        return res.status(404).json({
          success: false,
          error: "Brand not found",
        })
      }

      // Get products for this brand
      const products = await Product.find({ brand: brand.name }).sort({ createdAt: -1 })

      res.json({
        success: true,
        data: {
          brand,
          products,
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
