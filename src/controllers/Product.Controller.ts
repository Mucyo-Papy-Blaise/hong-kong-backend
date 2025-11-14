import type { Request, Response } from "express"
import { Product } from "../models/Product"
import { uploadMultipleImages } from "../services/cloudinary"
import { calculatePagination } from "../utils/pagination"
import type { ProductFilterQuery } from "../types"
import { Brand } from "../models/Brand"
import { Lenses } from "../models/Lenses"
import mongoose from "mongoose"

/**
 * Product controller - handles all product-related operations
 */
export class ProductController {
  /**
   * Get all products with filtering, pagination, and sorting
   * GET /products
   */
async getAll(req: Request, res: Response) {
  try {
    const {
      page = "1",
      limit = "12",
      brand,
      minPrice,
      maxPrice,
      search,
      sort = "newest", // default sort
      gender,
      lensType,
      shape,
    } = req.query as ProductFilterQuery;

    //  Build filter object
    const filter: Record<string, any> = {};

    // Brand filter - convert name to ID
    if (brand && brand !== "all") {
      const brandDoc = await Brand.findOne({ 
        $or: [
          { name: { $regex: new RegExp(brand as string, "i") } },
          { _id: mongoose.Types.ObjectId.isValid(brand) ? brand : null }
        ]
      });
      if (brandDoc) filter.brand = brandDoc._id;
    }

    if (gender && gender !== "all") filter.gender = gender;

    // Lens type filter - convert name to ID
    if (lensType) {
      const lensNames = Array.isArray(lensType) ? lensType : [lensType];
      
      // Find lens documents by names
      const lenseDocs = await Lenses.find({
        name: { $in: lensNames.map((name: any) => new RegExp(name as string, "i")) }
      });
      
      if (lenseDocs.length > 0) {
        const lensIds = lenseDocs.map((l) => l._id);
        filter.lensType = { $in: lensIds };
      }
    }

    if (shape) filter.shape = { $regex: new RegExp(shape as string, "i") };

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort query safely
    const sortQuery: Record<string, 1 | -1> = (() => {
      switch (sort) {
        case "price-asc":
          return { price: 1 } as Record<string, 1 | -1>;
        case "price-desc":
          return { price: -1 } as Record<string, 1 | -1>;
        case "rating":
          return { rating: -1 } as Record<string, 1 | -1>;
        case "newest":
        default:
          return { createdAt: -1 } as Record<string, 1 | -1>;
      }
    })();

    //  Pagination setup
    const totalItems = await Product.countDocuments(filter);
    const pagination = calculatePagination(
      Number(page),
      Number(limit),
      totalItems
    );

    // Fetch products
    const products = await Product.find(filter)
      .sort(sortQuery)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("brand", "name")
      .populate("lensType", "name")
      .populate("relatedProducts", "name price images");

    // Response
    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          totalPages: pagination.totalPages,
          totalItems: pagination.totalItems,
        },
      },
    });
  } catch (error: any) {
    console.error("❌ Error in getAll:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}


  /**
   * Get single product by ID
   * GET /products/:id
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params

      const product = await Product.findById(id)
      .populate("brand", "name")
      .populate("lensType", "name")
      .populate("relatedProducts", "name price images brand rating")

      if (!product) {
        return res.status(404).json({
          success: false,
          error: "Product not found",
        })
      }

      res.json({
        success: true,
        data: product,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      })
    }
  }

  /**
   * Create new product (admin only)
   * POST /products
   */
  
  async create(req: Request, res: Response) {
  try {
    const { brand: brandName, lensType   } = req.body;
    
    // Find brand by name or slug
    let brandId;
    if (brandName) {
      const brand = await Brand.findOne({ name: brandName });
      if (!brand) {
        return res.status(400).json({ success: false, error: "Brand not found" });
      }
      brandId = brand._id;
    }

    let lensIds: mongoose.Types.ObjectId[] = [];
    if (lensType) {
      const lensNames = Array.isArray(lensType) ? lensType : JSON.parse(lensType);
      const lenses = await Lenses.find({ name: { $in: lensNames } });
      if (lenses.length === 0)
        return res.status(400).json({ success: false, error: "No lenses found" });
        lensIds = lenses.map((l) => l._id as mongoose.Types.ObjectId);
    }

    const files = req.files as Express.Multer.File[] ?? [];
    let imageUrls: string[] = [];
    if (files.length > 0) {
      imageUrls = await uploadMultipleImages(files, "eyewear/products");
    }

    const tryParseJSON = (value: any) => {
      if (typeof value !== "string") return value;
      try { return JSON.parse(value); } catch { return value; }
    }

    let features = tryParseJSON(req.body.features);
    if (Array.isArray(features) && features.length === 1 && typeof features[0] === 'string') {
      features = features[0].split(',').map((f: string) => f.trim());
    }

    const specifications = tryParseJSON(req.body.specifications);
    const relatedProducts = tryParseJSON(req.body.relatedProducts);

    const product = await Product.create({
      ...req.body,
      brand: brandId,
      lensType: lensIds,
      images: imageUrls,
      features,
      specifications,
      relatedProducts,
    });

    return res.status(201).json({ success: true, message: "Product created successfully", data: product });

  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

  /**
   * Update product (admin only)
   * PUT /products/:id
   */
async update(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { brand: brandValue } = req.body;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, error: "Product not found" });

    let brandId;
    if (brandValue) {
      // Check if it's an ObjectId (ID) or a string (name)
      if (mongoose.Types.ObjectId.isValid(brandValue) && brandValue.length === 24) {
        // It's an ID - verify it exists
        const brand = await Brand.findById(brandValue);
        if (!brand) return res.status(400).json({ success: false, error: "Brand not found" });
        brandId = brand._id;
      } else {
        // It's a name - find by name
        const brand = await Brand.findOne({ name: brandValue });
        if (!brand) return res.status(400).json({ success: false, error: "Brand not found" });
        brandId = brand._id;
      }
    }

    let lensIds;
    if (req.body.lensType) {
      const lensValues = Array.isArray(req.body.lensType)
        ? req.body.lensType
        : JSON.parse(req.body.lensType);
      
      // Check if first value is an ID or name
      if (lensValues.length > 0 && mongoose.Types.ObjectId.isValid(lensValues[0]) && lensValues[0].length === 24) {
        // They're IDs
        const lenses = await Lenses.find({ _id: { $in: lensValues } });
        if (lenses.length === 0)
          return res.status(400).json({ success: false, error: "No lenses found" });
        lensIds = lenses.map((l) => l._id as mongoose.Types.ObjectId);
      } else {
        // They're names
        const lenses = await Lenses.find({ name: { $in: lensValues } });
        if (lenses.length === 0)
          return res.status(400).json({ success: false, error: "No lenses found" });
        lensIds = lenses.map((l) => l._id as mongoose.Types.ObjectId);
      }
    }

    const files = req.files as Express.Multer.File[];
    let imageUrls = product.images;
    if (files && files.length > 0) {
      const newImageUrls = await uploadMultipleImages(files, "eyewear/products");
      imageUrls = [...imageUrls, ...newImageUrls];
    }

    const updateData: any = {
      ...req.body,
      brand: brandId || product.brand,
      images: imageUrls,
      lensType: lensIds ?? product.lensType,
    };

    if (typeof req.body.features === "string") updateData.features = JSON.parse(req.body.features);
    if (typeof req.body.specifications === "string") updateData.specifications = JSON.parse(req.body.specifications);
    if (typeof req.body.relatedProducts === "string") updateData.relatedProducts = JSON.parse(req.body.relatedProducts);

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    res.json({ success: true, message: "Product updated successfully", data: updatedProduct });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
  /**
   * Delete product (admin only)
   * DELETE /products/:id
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params

      const product = await Product.findByIdAndDelete(id)

      if (!product) {
        return res.status(404).json({
          success: false,
          error: "Product not found",
        })
      }

      res.json({
        success: true,
        message: "Product deleted successfully",
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      })
    }
  }

  /**
   * Get related products for a product
   * GET /related-products/:productId
   */
  async getRelatedProducts(req: Request, res: Response) {
    try {
      const { productId } = req.params

      const product = await Product.findById(productId).populate(
        "relatedProducts",
        "name price images brand rating",
      )

      if (!product) {
        return res.status(404).json({
          success: false,
          error: "Product not found",
        })
      }

      res.json({
        success: true,
        data: product.relatedProducts,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      })
    }
  }
}
