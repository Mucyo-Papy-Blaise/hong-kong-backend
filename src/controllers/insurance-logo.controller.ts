import type { Request, Response } from "express"
import { InsuranceLogo } from "../models/InsuranceLogo"
import { uploadSingleImage } from "../services/cloudinary"

/**
 * Insurance Logo controller - handles insurance logo CRUD operations
 */
export class InsuranceLogoController {
  /**
   * Get all insurance logos
   * GET /insurance-logos
   */
  async getAll(req: Request, res: Response) {
    try {
      const logos = await InsuranceLogo.find().sort({ name: 1 })

      res.json({
        success: true,
        data: logos,
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
   * GET /insurance-logos/:id
   */
  async getById(req: Request, res: Response){
    try {
      const { id } = req.params

      const insurance = await InsuranceLogo.findById(id)

      if(!insurance){
        res.status(404).json({
          success: false,
          error: 'Insurance not found'
        })
      }

      res.json({
        success: true,
        data: insurance
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }
  /**
   * Create new insurance logo (admin only)
   * POST /insurance-logos
   */
  async create(req: Request, res: Response) {
    try {
      const file = req.file

      // Upload logo to Cloudinary if provided
      let logoUrl = null
      if (file) {
        logoUrl = await uploadSingleImage(file.buffer, "eyewear/insurance")
      }

      // Create insurance logo
      const logo = await InsuranceLogo.create({
        name: req.body.name,
        logo: logoUrl,
      })

      res.status(201).json({
        success: true,
        message: "Insurance logo created successfully",
        data: logo,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      })
    }
  }

  /**
   * Update insurance logo (admin only)
   * PUT /insurance-logos/:id
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      const file = req.file

      // Find existing logo
      const logo = await InsuranceLogo.findById(id)
      if (!logo) {
        return res.status(404).json({
          success: false,
          error: "Insurance logo not found",
        })
      }

      // Upload new logo if provided
      let logoUrl = logo.logo
      if (file) {
        logoUrl = await uploadSingleImage(file.buffer, "eyewear/insurance")
      }

      // Update logo
      const updatedLogo = await InsuranceLogo.findByIdAndUpdate(
        id,
        { name: req.body.name, logo: logoUrl },
        { new: true, runValidators: true },
      )

      res.json({
        success: true,
        message: "Insurance logo updated successfully",
        data: updatedLogo,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      })
    }
  }

  /**
   * Delete insurance logo (admin only)
   * DELETE /insurance-logos/:id
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params

      const logo = await InsuranceLogo.findByIdAndDelete(id)

      if (!logo) {
        return res.status(404).json({
          success: false,
          error: "Insurance logo not found",
        })
      }

      res.json({
        success: true,
        message: "Insurance logo deleted successfully",
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      })
    }
  }
}
